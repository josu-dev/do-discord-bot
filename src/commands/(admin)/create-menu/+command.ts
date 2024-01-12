import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, BaseSubCommandDefinition } from '../../+type';


export type SubCommandDefinition = BaseSubCommandDefinition<[]>;


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('create-menu')
            .setDescription('Utility to create diferents kinds of menus for text channels')
        ,
    };
}) satisfies MultiFileCommandDefinition;
