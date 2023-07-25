import { APIEmbed, APIEmbedField, ChatInputCommandInteraction, SlashCommandBuilder, bold, hideLinkEmbed, hyperlink } from 'discord.js';
import { SingleFileCommandDefinition } from '../../+type';
import { addEphemeralOption } from '../../../lib/discordjs';
import { APIResponse } from './+skip/types';
import { bingChatRegistry } from './+skip/users';
import { logWithTime } from '../../../lib';


const EMBED_COLOR = 0x006880;
const MINIMUM_QUESTION_LENGTH = 4;

// const BING_CHAT_API_URL = 'http://127.0.0.1:8000/api/ask';
const BING_CHAT_API_URL = process.env.bcRestURL + '/api/ask';


type ConversationStyle = 'creative' | 'balanced' | 'precise';


const commandData = new SlashCommandBuilder()
    .setName(`bing-chat`)
    .setNameLocalization(`es-ES`, `bing-chat`)
    .setDescription(`Perform a question using the Bing Chat AI (may take a while)`)
    .setDescriptionLocalization(`es-ES`, `Realiza una pregunta usando el AI de Chat de Bing (puede tardar un poco)`)
    .addStringOption(option => option
        .setRequired(true)
        .setName(`question`)
        .setNameLocalization(`es-ES`, `pregunta`)
        .setDescription(`The question to ask`)
        .setDescriptionLocalization(`es-ES`, `La pregunta a realizar`)
        .setMinLength(MINIMUM_QUESTION_LENGTH)
        .setMaxLength(1800)
    )
    .addStringOption(option => option
        .setName('style')
        .setNameLocalization('es-ES', 'estilo')
        .setDescription('The style of the response default is Precise')
        .setDescriptionLocalization('es-ES', 'El estilo de la respuesta por defecto es Preciso')
        .setChoices(
            {
                name: 'Creative',
                name_localizations: { 'es-ES': 'Creativo' },
                value: 'creative'
            },
            {
                name: 'Balanced',
                name_localizations: { 'es-ES': 'Equilibrado' },
                value: 'balanced'
            },
            {
                name: 'Precise',
                name_localizations: { 'es-ES': 'Preciso' },
                value: 'precise'
            }
        )
    );
addEphemeralOption(commandData);


const staticReplyDefinition = {
    shortInput: {
        content: `La pregunta no puede estar vacia.` as const,
        ephemeral: true as const,
    },
    waitForAvailability: {
        content: `Esperando a que se libere el servidor...` as const,
        ephemeral: true,
        fetchReply: true as const
    },
    generating: {
        content: `Generando respuesta...` as const,
        ephemeral: true,
        fetchReply: true as const
    },
    errorGeneratingAnswer: {
        content: `Ocurrio un error al generar la respuesta, intenta de nuevo mas tarde` as const,
    },
    warnNotification: {
        content: `Advertencia: La pregunta es inadecuada para el uso de este comando, si no estas seguro de que la pregunta sea adecuada, por favor no la uses. La proxima vez que uses este comando, si la pregunta es inadecuada, se te prohibira el uso de este comando.` as const,
    },
    banNotification: {
        content: `Has sido baneado del uso de este comando por usar una pregunta inadecuada.` as const,
        ephemeral: true as const
    },
    accessDenied: {
        content: `Estas banneado del uso de este comando por haber hecho un uso inadecuado anteriormente.` as const,
        ephemeral: true as const
    },
};


function cachedReply<Name extends keyof typeof staticReplyDefinition>(name: Name, ephemeral: boolean = true) {
    const data = staticReplyDefinition[name];
    // @ts-ignore
    data.ephemeral = ephemeral;
    return data;
}


class SimpleQueue<T> {
    #queue: T[] = [];

    reset() {
        this.#queue = [];
    }

    add(question: T) {
        this.#queue.push(question);
    }

    next() {
        return this.#queue.shift();
    }

    get isEmpty() {
        return this.#queue.length === 0;
    }

    get hasSome() {
        return this.#queue.length > 0;
    }
}


type QuestionData = {
    question: string;
    style: ConversationStyle;
    interact: ChatInputCommandInteraction<'cached'>;
    ephemeral: boolean;
    cachedBodyRequest?: string;
};


const questionQueue = new SimpleQueue<QuestionData>();


type Message = APIResponse<true>['messages'][number];

const validationResult = {
    fewMessages: 'BAD_LENGTH',
    infringingQuestion: 'BAD_QUESTION',
    unexpectedError: 'UNEXPECTED_ERROR',
    success: 'SUCCESS'
} as const;

type ValidationResult = typeof validationResult[keyof typeof validationResult];

function validateMessages(messages: Message[]): ValidationResult {
    if (messages.length < 2) {
        logWithTime('Unexpected quantity of messages on BC response\n  messages: ' + JSON.stringify(messages, null, 2));
        return validationResult.fewMessages;
    }
    const input = messages[0]!;
    if (input.offense !== 'None') {
        logWithTime(`Infringing question on command bing-chat\n  offense: ${input.offense}\n  question: \`${input.text}\``);
        return validationResult.infringingQuestion;
    }
    const output = messages[1]!;
    if (!output.text) {
        logWithTime(`Unexpected missing text on BC response\n  message: ${JSON.stringify(output, null, 2)}`);
        return validationResult.unexpectedError;
    }
    return validationResult.success;
}

function replyFromMessages(question: string, messages: APIResponse<true>['messages'], ephemeral: boolean = false) {
    const answer = messages[messages.length - 1]!;
    const references: number[] = [];
    const text = answer.text
        .replace(
            /^(Hola, este es Bing.|This is Bing.|Hello, this is Bing.)\s+/,
            ''
        )
        .replaceAll(
            /\[\^(\d)\^\]/g,
            (_, p1) => {
                if (!references.includes(Number(p1))) {
                    references.push(Number(p1));
                }
                return ' ' + bold('[' + p1 + ']');
            }
        );

    const embed = {
        title: `Respuesta`,
        description: text.length > 4096 ? text.slice(0, 2093) + '...' : text,
        fields: [] as APIEmbedField[],
        color: EMBED_COLOR,
        footer: {
            text: `Powered by Bing`
        }
    } satisfies APIEmbed;

    if (answer.sourceAttributions) {
        for (let i = 0; i < references.length; i++) {
            const content = answer.sourceAttributions[i]!;
            const field = {
                inline: false,
                name: 'Referencia ' + references[i],
                value: hyperlink(content.providerDisplayName !== '' ? content.providerDisplayName : content.searchQuery, hideLinkEmbed(content.seeMoreUrl))
            } as APIEmbedField;
            embed.fields.push(field);
        }
    }

    return { content: bold('Pregunta: ') + question + '\n\u200B', embeds: [embed], ephemeral: ephemeral };
}


async function resolveQuestion(data: QuestionData, fresh: boolean = false) {
    if (fresh) {
        await data.interact.reply(cachedReply('generating', data.ephemeral));
        data.cachedBodyRequest = JSON.stringify({
            prompt: data.question,
            style: data.style,
        });
    } else {
        await data.interact.editReply(cachedReply('generating'));
    }

    const apiResponse = await fetch(
        BING_CHAT_API_URL,
        {
            method: 'POST',
            body: data.cachedBodyRequest,
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': process.env.bcRestToken!,
                'charset': 'utf-8'
            }
        }
    ).catch(err => { console.error(err); return undefined; });

    if (!apiResponse || apiResponse.status !== 200 && apiResponse.status !== 429) {
        console.error('Unexpected error on BC request with status: ' + apiResponse?.status);
        return data.interact.editReply(cachedReply('errorGeneratingAnswer'));
    }

    if (apiResponse.status === 429) {
        questionQueue.add(data);
        return data.interact.editReply(cachedReply('waitForAvailability'));
    }

    const responseData = await apiResponse.json().catch(err => { console.error(err); return undefined; }) as APIResponse;

    if (questionQueue.hasSome) {
        resolveQuestion(questionQueue.next()!);
    }

    const messages = responseData ? responseData.success ? responseData.messages : undefined : undefined;
    if (!messages) {
        return data.interact.editReply(cachedReply('errorGeneratingAnswer'));
    }

    const validation = validateMessages(messages);
    if (validation !== validationResult.success) {
        if (
            validation === validationResult.fewMessages ||
            validation === validationResult.unexpectedError
        ) {
            return data.interact.editReply(cachedReply('errorGeneratingAnswer'));
        }
        if (validation === validationResult.infringingQuestion) {
            const userId = data.interact.user.id;
            const user = bingChatRegistry.get(userId, true);
            const context = structuredClone(messages);
            if (user.isWarned) {
                user.ban(context);
                return data.interact.editReply(cachedReply('banNotification'));
            }
            user.warn(context);
            return data.interact.editReply(cachedReply('warnNotification'));
        }
        throw new Error('Unhandled validation result ' + validation);
    }

    try {
        return data.interact.editReply(replyFromMessages(data.question, messages, data.ephemeral));
    }
    catch (err) {
        console.error(err);
        console.log(JSON.stringify(messages));
        return data.interact.editReply(cachedReply('errorGeneratingAnswer'));
    }
};


export default (() => {
    questionQueue.reset();

    return {
        data: commandData,
        async execute({ interaction }) {
            if (bingChatRegistry.isBanned(interaction.user.id)) {
                return interaction.reply(cachedReply('accessDenied'));
            }

            const question = interaction.options.getString('question', true).trim();
            if (question.length < MINIMUM_QUESTION_LENGTH) {
                return interaction.reply(cachedReply('shortInput'));
            }

            const style = interaction.options.getString('style') as ConversationStyle | null ?? 'precise';
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            const data = {
                question,
                style,
                interact: interaction,
                ephemeral
            } as QuestionData;

            if (questionQueue.hasSome) {
                questionQueue.add(data);
                return interaction.reply(cachedReply('waitForAvailability', ephemeral));
            }

            return resolveQuestion(data, true);
        }
    };
}) satisfies SingleFileCommandDefinition;
