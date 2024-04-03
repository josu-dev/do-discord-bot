import { APIEmbed, bold, codeBlock, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command.js';


export default (() => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName(`coin`)
            .setNameLocalization(`es-ES`, `moneda`)
            .setDescription(`Flips a coin`)
            .setDescriptionLocalization(`es-ES`, `Lanza una moneda`)
            .addIntegerOption(opt => opt
                .setName(`flips`)
                .setNameLocalization(`es-ES`, `lanzamientos`)
                .setDescription(`Number of flips to made, default 1`)
                .setDescriptionLocalization(`es-ES`, `Numero de lanzamientos a realizar, por defecto 1`)
                .setMinValue(1)
                .setMaxValue(511)
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
            const flipsAmount = opt.getInteger('flips') ?? 1;
            const ephemeral = opt.getBoolean('ephemeral') ?? true;

            const flips: boolean[] = [];
            let flipsMessage = '';
            for (let _ = 0; _ < flipsAmount; _++) {
                if (Math.random() >= 0.5) {
                    flips.push(true);
                    flipsMessage += 'C ';
                }
                else {
                    flips.push(false);
                    flipsMessage += 'S ';
                }
            }

            const embed: APIEmbed = {};
            embed.title = `Lanzamiento de moneda`;
            embed.color = 0xe9b535;
            if (flipsAmount === 1) {
                embed.description = `El lanzamiento de la moneda resulto en: ${bold(flips[0] ? 'Cara' : 'Seca')}`;
            }
            else {
                embed.title += ` (${flipsAmount} veces)`;
                embed.description = (
                    `Historial lanzamientos:\n` +
                    `${codeBlock(flipsMessage)}\n` +
                    `Primer lanzamiento: ${bold(flips.at(0) ? 'Cara' : 'Seca')}\n` +
                    `Ultimo lanzamiento: ${bold(flips.at(-1) ? 'Cara' : 'Seca')}`
                );
            }

            return interaction.reply({
                embeds: [embed],
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
