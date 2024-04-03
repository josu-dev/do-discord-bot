import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, BaseSubCommandDefinition } from '../../+type.js';


export type SubCommandDefinition = BaseSubCommandDefinition<[]>;


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('list')
            .setDescription('Lists different statistics, features and qualities of the client')
        ,
    };
}) satisfies MultiFileCommandDefinition;
