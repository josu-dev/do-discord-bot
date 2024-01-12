import { PermissionFlagsBits } from 'discord.js';
import { GroupSetupDefinition } from '../+type';


export const config = {
    permissions: [PermissionFlagsBits.Administrator],
    description: {
        "es-ES": `Comandos disponibles durante el desarrollo del bot.`,
        "en-US": `Commands available during bot development.`
    }
} satisfies GroupSetupDefinition;
