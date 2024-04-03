import { PermissionFlagsBits } from 'discord.js';
import { GroupSetupDefinition } from '../+type.js';


export const config = {
    permissions: [PermissionFlagsBits.Administrator],
    description: {
        "es-ES": `Comandos para administrar el bot y el servidor.`,
        "en-US": `Commands to manage the bot and the server.`
    }
} satisfies GroupSetupDefinition;
