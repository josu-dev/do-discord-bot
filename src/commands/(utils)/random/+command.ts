import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, SubCommandDefinitionFrom } from '../../+type';


const baseCommand = (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('random')
            .setNameLocalization('es-ES', 'aleatorio')
            .setDescription('Commands based on randomness')
            .setDescriptionLocalization('es-ES', 'Comandos basados en la aleatoriedad')
        ,
    };
}) satisfies MultiFileCommandDefinition;

export type SubCommandDefinition = SubCommandDefinitionFrom<typeof baseCommand>;

export default baseCommand;
