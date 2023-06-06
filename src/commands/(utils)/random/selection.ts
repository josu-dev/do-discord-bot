import { bold, codeBlock, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';


export default (() => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName(`selection`)
            .setNameLocalization(`es-ES`, `seleccion`)
            .setDescription(`Randomly selects a set of words`)
            .setDescriptionLocalization(`es-ES`, `Selecciona un conjunto de palabras al azar`)
            .addStringOption(opt => opt
                .setRequired(true)
                .setName(`words`)
                .setNameLocalization(`es-ES`, `palabras`)
                .setDescription(`Words from which to select. Example: apple car pedor c++`)
                .setDescriptionLocalization(`es-ES`, `Palabras entre las que seleccionar. Ejemplo: manzana auto pedro c++`)
                .setMinLength(3)
            )
            .addIntegerOption(opt => opt
                .setName(`amount`)
                .setNameLocalization(`es-ES`, `cantidad`)
                .setDescription(`Amount of words to be selected, default 1`)
                .setDescriptionLocalization(`es-ES`, `Maximo de palabras a seleccionar, por defecto 1`)
                .setMinValue(1)
            )
            .addBooleanOption(opt => opt
                .setName('ephemeral')
                .setNameLocalization('es-ES', 'efimero')
                .setDescription('Sets the response as ephemeral, default true')
                .setDescriptionLocalization('es-ES', 'Pone la respuesta como efimera, por defecto true')
            )
        ,
        async execute({ interaction }) {
            const opt = interaction.options;
            const inputWords = opt.getString('words', true);
            const amount = opt.getInteger('amount') ?? 1;
            const ephemeral = opt.getBoolean('ephemeral') ?? true;

            const splitedWords = inputWords.split(/(?: +)|[,-]|(?: y )/);
            const words: string[] = [];
            for (let word of splitedWords) {
                word = word.trim();
                if (word === '') continue;
                words.push(word);
            }
            if (words.length === 0) {
                return interaction.reply({
                    content: `Debes ingresar al menos una palabra, ningun palabra encontrada en '${inputWords}'`,
                    ephemeral: true
                });
            }

            const randomizedWords = [...words].sort(() => Math.random() - 0.5);
            const noSelectedWords = randomizedWords.splice(amount);

            let message = `${bold(randomizedWords.length === 1 ? 'Palabra seleccionada' : 'Palabras seleccionadas')}:\n${codeBlock(randomizedWords.join(' '))}`;

            if (noSelectedWords.length !== 0) {
                message += `\n${bold('Palabras restantes')}: ${noSelectedWords.join(' ')}`;
            }

            return interaction.reply({
                content: message,
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
