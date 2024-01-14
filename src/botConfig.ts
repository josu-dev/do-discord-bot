import { ActivityType, Partials, PresenceData } from 'discord.js';
import env from './enviroment';


export const INTERACTION = {
    COMMANDS: {
        path: `commands`
    },
    SELECT_MENUS: {
        path: `generated/selectMenus`
    },
} as const;

export const CLIENT = {
    INTENTS: 3276799,
    PARTIALS: [Partials.Channel, Partials.Message, Partials.Reaction],
} as const;

export const REPOSITORY = {
    URL: 'https://github.com/J-Josu/do-discord-bot',
} as const;


/*
 * Customizations
 */

export const REPLY = {
    EMBED: {
        COLOR: '#3e639b',
        COLOR_INT: 4088731,
    },
} as const;

export const PRESENCES = [
    {
        status: 'online',
        activities: [{ type: ActivityType.Listening, name: 'coolers del servidor' }]
    },
    {
        status: 'dnd',
        activities: [{ type: ActivityType.Watching, name: 'Como ser mejor bot?' }]
    },
    {
        status: 'idle',
        activities: [{ type: ActivityType.Playing, name: 'actualizar la bios' }]
    },
    {
        status: 'online',
        activities: [{ type: ActivityType.Listening, name: 'mi desarrollador' }]
    },
    {
        status: 'online',
        activities: [{ type: ActivityType.Competing, name: 'aprobar CADP' }]
    },
] satisfies PresenceData[];


/*
 * Configuration of the guild
 */

export const GUILD = {
    NEW_MEMBER: {
        ROLES: [
            '1075784400962326648',
        ],
    },
    ROLES: {
        ADMIN: '1075765516007899196',
        MOD: '1075784143893430382',
        VERIFIED: '1133910615845523536',
    },
    INVITE: {
        CODE: env.guildInviteCode,
        URL: env.guildInviteCode ? `https://discord.gg/${env.guildInviteCode}` : undefined,
    },
    EMBED: {
        COLOR_HEX: '#94262e',
        COLOR_INT: 0x94262e,
    },
    WELCOME: {
        CHANNEL: '1075773559156252784',
        IMG_GEN_URL: process.env.WELCOME_IMG_GEN_URL,
        FALLBACK_MESSAGE: 'Bienvenido {{mention}} al servidor!\n\nEsperamos que la comunidad te sea de ayuda y te lo pases bien con los demas estudiantes ;)',
    },
    BOOST: {
        CHANNEL: '1075765075794735126',
        IMG_GEN_URL: process.env.BOOST_IMG_GEN_URL,
        FALLBACK_MESSAGE: 'Agradescanlen a {{mention}} que acabo de boostear el servidor y eso nos beneficia a todos!',
    },
} as const;
