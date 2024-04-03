import { bold, SlashCommandBuilder } from 'discord.js';
import { REPOSITORY } from '../botConfig.js';
import { addEphemeralOption } from '../lib/discordjs.js';
import { SingleFileCommandDefinition } from './+type.js';


const commandData = new SlashCommandBuilder()
    .setName(`repository`)
    .setNameLocalization(`es-ES`, `repositorio`)
    .setDescription(`The source code of the bot`)
    .setDescriptionLocalization(`es-ES`, `El codigo fuente del bot`);
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            return interaction.reply({
                content: `Codigo fuente del bot: ${bold(' ' + REPOSITORY.URL + ' ')}\n** **`,
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
