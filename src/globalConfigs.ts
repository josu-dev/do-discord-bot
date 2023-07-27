import { ActivityType, Partials, PresenceData } from 'discord.js';


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
    SINGLE_GUILD: true,
} as const;


/*
 * Bot customizations
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
 * Guild configurations, only applies if CLIENT.SINGLE_GUILD is true
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
        CODE: 'Jur4R4Jcpx',
        URL: 'https://discord.gg/Jur4R4Jcpx',
    },
    EMBED: {
        COLOR_HEX: '#94262e',
        COLOR_INT: 0x94262e,
    },
} as const;
