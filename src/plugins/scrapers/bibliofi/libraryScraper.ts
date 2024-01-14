import * as cheerio from 'cheerio';
import { log } from '../../../lib/logging';
import { RecordToTuple } from '../../../lib/utilType';


const BASE_URL = `http://catalogo.info.unlp.edu.ar`;
const BASE_SEARCH_URL = `http://catalogo.info.unlp.edu.ar/meran/opac-busquedasDB.pl`;


export const documentTypes = {
    "ACT": "Acta",
    "ANA": "Analítica",
    "CAT": "Apunte de cátedra",
    "ART": "Artículo",
    "CDR": "CD-ROM",
    "DIS": "Dispositivos electrónicos",
    "DCA": "Documento de cátedra",
    "ELE": "Documento Electrónico",
    "FOL": "Folleto",
    "FOT": "Fotocopia",
    "HER": "Herramientas",
    "INF": "Informe técnico",
    "LEG": "Legislación",
    "LIB": "Libros",
    "NOR": "Norma",
    "PLA": "Placa",
    "PRO": "Programa de estudio",
    "SEW": "Publicacion seriada (web)",
    "SER": "Publicaciones seriadas",
    "REP": "Repositorio documental",
    "REV": "Revista",
    "SEM": "Seminarios",
    "SW": "Sitio Web",
    "WEB": "Sitio web",
    "SOF": "Software",
    "TES": "Tesis",
    "VID": "Video grabación",
    "EMPTY": "SIN SELECCIONAR",
} as const;

type DocumentOptions = typeof documentTypes;

type QueryParams = {
    titulo?: string,
    autor?: string,
    isbn?: number,
    tipo_nivel3_name?: keyof Exclude<DocumentOptions, 'EMPTY'> | '';
    tema?: string,
    estantes?: string,
    only_available?: `on`,
    submit?: undefined,
    tipoAccion?: `BUSQUEDA_AVANZADA`,
    tipo?: `normal`,
    token?: undefined;
};

export type SearchOptions = {
    title?: string;
    author?: string;
    isbn?: number;
    topic?: string;
    documentType?: keyof DocumentOptions;
    onlyAvailable?: boolean;
};


function buildSearchURL({ title, author, isbn, topic, documentType, onlyAvailable }: SearchOptions) {
    const queryArray = [
        ['titulo', title],
        ['autor', author],
        ['isbn', isbn],
        ['tipo_nivel3_name', documentType === 'EMPTY' ? '' : documentType],
        ['tema', topic],
        ['only_available', onlyAvailable ? '1' : '0'],
        ['tipoAccion', 'BUSQUEDA_AVANZADA'],
        ['tipo', 'normal'],
    ] satisfies RecordToTuple<QueryParams>;
    // ignored possible query params: estantes, submit, token
    // only_available could be defined as: ['only_available', onlyAvailable? 'on': undefined],

    const queryParams: string[] = [];
    for (let i = 0; i < queryArray.length; i++) {
        if (queryArray[i]![1] === undefined) continue;
        queryParams.push(`${queryArray[i]![0]}=${encodeURIComponent(queryArray[i]![1]!)}`);
    }

    return BASE_SEARCH_URL + '?' + queryParams.join('&');
}

export type SearchResult = {
    total: number,
    scrapedURL: string,
    documents: {
        imgURL?: string,
        title: string,
        docURL?: string,
        author?: string,
        authorURL?: string,
        edition?: string,
        unavailable: boolean,
        onLibrary: boolean,
        onHouse: boolean,
        rate?: number;
    }[],
    empty: boolean,
};

async function resolveSearch(url: string): Promise<SearchResult | undefined> {
    const page = await fetch(url).then(r => r.text()).catch(error => { log.error(error); return undefined; });
    if (!page) return undefined;

    const $ = cheerio.load(page);
    const resultCount = Number($('h3 small').text()?.match(/\d+/)?.[0] ?? 0);
    const rows = $('table tbody').find(`tr`)
        .map((i, el) => {
            const td = $(el).find(`td`);
            const imgUrl = $(td[0]).find(`img`).attr(`src`);
            const titleEl = $(td[1]).find(`a`);
            const author = $(td[2]).find(`a`);
            const home = $(td[4]).text().toLowerCase();
            const rate = $(td[5]).find(`div`)?.attr(`data-rating`);
            let authorURL: string | undefined;
            if (author.length === 1) {
                const href = author.attr(`href`) ?? '';
                const [base, name] = href.split(`autor=`);
                if (base && name)
                    authorURL = `${BASE_URL}${base}autor=${encodeURIComponent(name!)}`;
            }
            const edition = $(td[3]).find(`span`).text().replace(/(\n|\t|\s)+/g, ' ').trim();
            return {
                imgURL: imgUrl ? BASE_URL + imgUrl : undefined,
                title: titleEl.text(),
                docURL: titleEl.attr(`href`) ? BASE_URL + titleEl.attr(`href`) : undefined,
                author: author.length !== 0 ? author.text() : undefined,
                authorURL: authorURL,
                edition: !edition || edition === '' ? undefined : edition,
                unavailable: !home.includes(`sala`) || !home.includes(`domicilio`),
                onLibrary: home.includes(`sala`),
                onHouse: home.includes(`domicilio`),
                rate: rate ? Number(rate) : undefined,
            };
        })
        .toArray();
    if (rows.length === 0) {
        return {
            total: resultCount,
            scrapedURL: url,
            documents: rows,
            empty: true,
        } as const;
    }

    return {
        total: resultCount,
        scrapedURL: url,
        documents: rows,
        empty: false,
    } as const;
}


export async function librarySearch(searchText: string) {
    const url = BASE_SEARCH_URL + `?string=` + encodeURIComponent(searchText) + `&tipoAccion=BUSQUEDA_COMBINABLE&token=`;
    return resolveSearch(url);
}

export async function customLibrarySearch(options: SearchOptions) {
    const url = buildSearchURL(options);
    return resolveSearch(url);
}
