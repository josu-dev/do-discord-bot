import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, BaseSubCommandDefinition } from '../../+type';


export type SubCommandDefinition = BaseSubCommandDefinition<[]>;


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('remove')
            .setDescription('Removes certain dinamicaly loaded content')
        ,
    };
}) satisfies MultiFileCommandDefinition;
