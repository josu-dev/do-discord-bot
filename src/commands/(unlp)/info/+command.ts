import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, SubCommandDefinitionFrom } from '../../+type.js';


const baseCommand = (() => {
    return {
        data: new SlashCommandBuilder()
            .setName(`info`)
            .setNameLocalization(`es-ES`, `info`)
            .setDescription(`Commands related to Facultad Informatica - UNLP`)
            .setDescriptionLocalization('es-ES', `Commandos relacionados a la Facultad Informatica - UNLP`)
        ,
    };
}) satisfies MultiFileCommandDefinition;

export type SubCommandDefinition = SubCommandDefinitionFrom<typeof baseCommand>;

export default baseCommand;
