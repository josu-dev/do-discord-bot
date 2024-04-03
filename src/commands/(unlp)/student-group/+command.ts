import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, SubCommandDefinitionFrom } from '../../+type.js';


const baseCommand = (() => {
    return {
        data: new SlashCommandBuilder()
            .setName(`student-group`)
            .setNameLocalization(`es-ES`, `agrupacion-estudiantil`)
            .setDescription(`Commands related to student groups`)
            .setDescription(`Commandos relacionados a las agrupaciones estudiantiles`)
    };
}) satisfies MultiFileCommandDefinition;

export type SubCommandDefinition = SubCommandDefinitionFrom<typeof baseCommand>;

export default baseCommand;
