import { PermissionFlagsBits } from 'discord.js';
import { GroupSetupDefinition } from '../+type';


export const config = {
    permissions: [PermissionFlagsBits.Administrator]
} satisfies GroupSetupDefinition;
