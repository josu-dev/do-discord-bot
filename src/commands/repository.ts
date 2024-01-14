import { bold, SlashCommandBuilder } from 'discord.js';
import { REPOSITORY } from '../botConfig';
import { addEphemeralOption } from '../lib/discordjs';
import { SingleFileCommandDefinition } from './+type';


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
