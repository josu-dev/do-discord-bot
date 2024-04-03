import axios from 'axios';
import { Agent } from 'https';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { f } from '../../../lib/index.js';
import { log } from '../../../lib/logging.js';


type htmlString = string;
type ISODateString = string; // ISO 8601 date Example: 2004-02-12T15:19:21+00:00
type APIMessage = {
    materia: string,
    titulo: string,
    cuerpo: htmlString;
    fecha: string;
    autor: string,
    is_anulado: boolean,
    fecha_anulacion: ISODateString,
    adjuntos: {
        nombre: string;
        public_path: string;
    }[];
};
type APIResponse = {
    total: number,
    from: number,
    count: 20,
    mensajes: APIMessage[];
};
type mdString = string;
type Message = {
    id: string;
    cathedra: string;
    title: string;
    content: mdString;
    creationDate: string;
    author: string;
    canceled: boolean;
    canceledDate: ISODateString;
    attachments: {
        name: string;
        publicUrl?: string;
    }[];
};
type LocalCache = {
    availibleToFetch: number,
    latestIds: string[];
};

const axiosInstance = axios.create();
const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

const nhm = new NodeHtmlMarkdown({
    codeFence: '```',
    codeBlockStyle: 'fenced',
    bulletMarker: '-',
    maxConsecutiveNewlines: 2,
    useLinkReferenceDefinitions: false,
    useInlineLinks: false,
    /**
     * Supplied elements will be ignored (ignores inner text does not parse children)
     * readonly ignore?: string[];
     */
    /**
     * Supplied elements will be treated as blocks (surrounded with blank lines)
     * readonly blockElements?: string[];
     */
    /**
     * User-defined text replacement pattern (Replaces matching text retrieved from nodes)
     * textReplace?: (readonly [pattern: RegExp, replacement: string])[];
     */
});


function sanitizeMessage(msg: APIMessage): Message {
    return {
        id: msg.materia.trim() + msg.fecha.trim(),
        cathedra: msg.materia.trim(),
        title: msg.titulo.trim(),
        content: nhm.translate(msg.cuerpo).trimStart(),
        author: msg.autor.trim(),
        creationDate: msg.fecha.trim(),
        canceled: msg.is_anulado,
        canceledDate: msg.fecha_anulacion,
        attachments: msg.adjuntos.map(
            adjunto => ({
                name: adjunto.nombre.trim(),
                publicUrl: adjunto.public_path
            })
        )
    };
}


class SizedFIFOList<T> {
    #items: T[];
    #limit: number;

    constructor(limit: number) {
        this.#items = [];
        this.#limit = limit;
    }

    get length() {
        return this.#items.length;
    }

    push(...items: T[]) {
        const totalCount = items.length + this.#items.length;
        if (totalCount <= this.#limit) {
            this.#items.unshift(...items);
            return;
        }
        const allItems = [...items, ...this.#items];
        const deletedItems = allItems.splice(this.#limit, totalCount - this.#limit);
        this.#items.splice(0, this.#items.length, ...allItems);
        return deletedItems;
    }

    first(): T | undefined {
        return this.#items[0];
    }

    items() {
        return [...this.#items];
    }
}


type UpdateListener = (newMessages: Message[], billboard: BillboardScraper) => void;

type FetchMessagesReturnType = {
    success: false;
    error: number;
} | {
    success: true,
    availableToFetch: number,
    from: number,
    to: number,
    messages: Message[];
};


export class BillboardScraper {
    static #CACHE_PATH = 'cache.json' as const;
    static #URL = `https://gestiondocente.info.unlp.edu.ar/cartelera/data/{offset}/{size}?idMateria=` as const;
    static get URL() {
        return BillboardScraper.#URL;
    }
    static #EXTEND_MESSAGES_COUNT = 10 as const;

    #availableToFetch: number;
    readonly messagesMap: Map<string, Message>;
    readonly messagesIds: SizedFIFOList<string>;
    readonly #updateListeners: UpdateListener[];

    constructor() {
        this.#availableToFetch = -1;
        this.messagesMap = new Map();
        this.messagesIds = new SizedFIFOList(20);
        this.#updateListeners = [];
    }

    get cachedMessagesCount() {
        return this.messagesMap.size;
    }

    async #fetchMessages(count = 10, offset: number = 0): Promise<FetchMessagesReturnType> {
        const response = await axiosInstance
            .get(
                BillboardScraper.#URL
                    .replace('{offset}', `${offset}`)
                    .replace('{size}', `${count}`),
                { httpsAgent }
            )
            .catch(
                error => ({
                    status: 503,
                    error: error
                } as const)
            );
        if (response.status !== 200) {
            return {
                success: false,
                error: response.status
            };
        }

        const insecureResponse = response.data as APIResponse;
        return {
            success: true,
            availableToFetch: insecureResponse.total,
            from: offset,
            to: offset + insecureResponse.mensajes.length,
            messages: insecureResponse.mensajes.map(mensaje => sanitizeMessage(mensaje))
        };
    }


    onUpdate(listener: UpdateListener) {
        if (this.#updateListeners.includes(listener)) {
            throw new Error(`BillboardScraper already listening with ${listener.toString()}`);
        }
        this.#updateListeners.push(listener);
    }

    async update(count: number = 5) {
        const response = await this.#fetchMessages(count);
        if (!response.success || response.messages.length === 0) {
            return;
        }

        this.#availableToFetch = response.availableToFetch;

        let lastUpdateIndex = -1;
        for (let i = 0; i < response.messages.length; i++) {
            if (response.messages[i]!.id === this.messagesIds.first()) {
                lastUpdateIndex = i;
                break;
            }
        }
        if (lastUpdateIndex === 0) {
            log.info(`No updates on gestiondocente`);
            return;
        }
        if (lastUpdateIndex === -1) {
            const extendedResponse = await this.#fetchMessages(BillboardScraper.#EXTEND_MESSAGES_COUNT, count);
            if (extendedResponse.success) {
                response.messages.push(...extendedResponse.messages);
                for (let i = 0; i < response.messages.length; i++) {
                    if (response.messages[i]!.id === this.messagesIds.first()) {
                        lastUpdateIndex = i;
                        break;
                    }
                }
            }
        }

        const endSliceIndex = lastUpdateIndex > 0 ? lastUpdateIndex : undefined;
        const newMessages = response.messages.slice(0, endSliceIndex);
        for (const message of [...newMessages].reverse()) {
            this.messagesMap.set(message.id, message);
            const removed = this.messagesIds.push(message.id);
            if (removed)
                this.messagesMap.delete(removed[0]!);
        }

        for (const listener of this.#updateListeners) {
            listener(newMessages, this);
        }

        log.info(`${newMessages.length} new messages on gestion docente`);
    }

    #loadCache() {
        const cache = f.readJSON(f.posixJoin(import.meta.dirname, BillboardScraper.#CACHE_PATH));
        if (!cache) return false;

        const insecureCache = cache as LocalCache;
        this.#availableToFetch = insecureCache.availibleToFetch;
        this.messagesIds.push(...insecureCache.latestIds);
        return true;
    }

    #saveCache() {
        if (f.writeJSON(
            f.posixJoin(import.meta.dirname, BillboardScraper.#CACHE_PATH),
            {
                availableToFetch: this.#availableToFetch,
                latestIds: this.messagesIds.items()
            }
        )) return;
        log.error('Error while trying to save billboardScraper local cache');
    }

    async start(lastSendedId?: string) {
        if (lastSendedId) {
            this.messagesIds.push(lastSendedId);
        } else {
            // this.#loadCache(lastSendedId);
        }
        await this.update(10);
    }

    async end() {
        this.#saveCache();
        this.#updateListeners.splice(0);
    }
}


export async function checkBillboardEndpoint() {
    const response = await axiosInstance
        .get(
            BillboardScraper.URL
                .replace('{offset}', `${0}`)
                .replace('{size}', `${1}`),
            {
                httpsAgent,
                timeout: 2 * 1000,
                timeoutErrorMessage: `Billboard din't respond`,
            },
        )
        .catch(error => {
            if (!(error instanceof axios.AxiosError)) {
                return {
                    threw: true,
                    axiosError: false,
                    message: error.message ?? 'Unknown error happend at trying to GET'
                } as const;
            }

            if (error.code === axios.AxiosError.ECONNABORTED || error.code === axios.AxiosError.ETIMEDOUT) {
                return {
                    status: 503,
                } as const;
            }

            return {
                threw: true,
                axiosError: true,
                message: error.message
            } as const;
        });

    if (response.status !== undefined) {
        console;
        return {
            up: response.status >= 200 && response.status < 300,
            status: response.status,
        } as const;
    }

    return {
        up: false,
        threw: true,
        errorMessage: response.message
    } as const;
}
