import { bold, codeBlock, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';


export default (() => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName(`yes-or-no`)
            .setNameLocalization(`es-ES`, `si-o-no`)
            .setDescription(`Randomly answer with yes or no`)
            .setDescriptionLocalization(`es-ES`, `Responde con si o no al azar`)
            .addStringOption(opt => opt
                .setRequired(true)
                .setName(`question`)
                .setNameLocalization(`es-ES`, `pregunta`)
                .setDescription(`Question to be answered`)
                .setDescriptionLocalization(`es-ES`, `Pregunta a responder`)
                .setMinLength(2)
            )
            .addBooleanOption(opt => opt
                .setName(`maybe`)
                .setNameLocalization(`es-ES`, `tal-vez`)
                .setDescription(`Enables the 'maybe' result, default false`)
                .setDescriptionLocalization(`es-ES`, `Habilita el resulado 'tal vez', por defecto false`)
            )
            .addBooleanOption(opt => opt
                .setName(`ephemeral`)
                .setNameLocalization(`es-ES`, `efimero`)
                .setDescription(`Sets the response as ephemeral, default true`)
                .setDescriptionLocalization(`es-ES`, `Pone la respuesta como efimera, por defecto true`)
            )
        ,
        async execute({ interaction }) {
            const opt = interaction.options;
            const question = opt.getString('question', true);
            const maybe = opt.getBoolean('maybe') ?? false;
            const ephemeral = opt.getBoolean('ephemeral') ?? true;

            const randomNumber = Math.random();
            let result = '';
            if (maybe) {
                result = randomNumber <= (1 / 3) ? 'Si' : randomNumber <= (2 / 3) ? 'Tal vez' : 'No';
            }
            else {
                result = randomNumber <= (1 / 2) ? 'Si' : 'No';
            }

            return interaction.reply({
                embeds: [{
                    color: interaction.member.displayColor ?? Math.floor(Math.random() * 0xffffff),
                    title: `${interaction.member.displayName} pregunto:`,
                    description: `${codeBlock(question)}\nRespuesta: ${bold(result)}`
                }],
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
