import { bold, codeBlock, italic, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';


export default (() => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName(`groups`)
            .setNameLocalization(`es-ES`, `grupos`)
            .setDescription(`Generates random groups by group size or group count`)
            .setDescriptionLocalization(`es-ES`, `Genera grupos aleatorios por tamaño de grupo o por cantidad de grupos`)
            .addStringOption(opt => opt
                .setRequired(true)
                .setName(`names`)
                .setNameLocalization(`es-ES`, `nombres`)
                .setDescription(`Names for the teams. Example: juan lia jhon ana`)
                .setDescriptionLocalization(`es-ES`, `Nombres para los equipos. Ejemplo: juan lia jhon ana`)
                .setMinLength(3)
            )
            .addIntegerOption(opt => opt
                .setName(`group-size`)
                .setNameLocalization(`es-ES`, `tamaño-grupo`)
                .setDescription(`Max names count for each group`)
                .setDescriptionLocalization(`es-ES`, `Maxima cantidad de nombres por grupo`)
                .setMinValue(1)
            )
            .addIntegerOption(opt => opt
                .setName(`group-count`)
                .setNameLocalization(`es-ES`, `cantidad-grupo`)
                .setDescription(`Quantity of groups to generate`)
                .setDescriptionLocalization(`es-ES`, `Cantidad de grupos a generar`)
                .setMinValue(1)
            )
            .addIntegerOption(opt => opt
                .setName(`max-names`)
                .setNameLocalization(`es-ES`, `maximo-nombres`)
                .setDescription(`Max names count, default all`)
                .setDescriptionLocalization(`es-ES`, `Maximo de nombres, por defecto todos`)
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
            const inputNames = opt.getString('names', true);
            const inputMaxNames = opt.getInteger('max-names');
            const inputGroupSize = opt.getInteger('group-size');
            const inputGroupCount = opt.getInteger('group-count');
            const ephemeral = opt.getBoolean('ephemeral') ?? true;

            if (!inputGroupSize && !inputGroupCount && !(inputGroupSize && inputGroupCount)) {
                return interaction.reply({
                    content: `Debes ingresar el tamaño de grupo o la cantidad de grupos`,
                    ephemeral: true
                });
            }

            const splitedNames = inputNames.split(/(?: +)|[,-]|(?: y )/);
            const names: string[] = [];
            for (let name of splitedNames) {
                name = name.trim();
                if (name === '') continue;
                names.push(name);
            }
            if (names.length === 0) {
                return interaction.reply({
                    content: `Debes ingresar al menos un nombre, ningun nombre encontrado en '${inputNames}'`,
                    ephemeral: true
                });
            }

            const groups: string[][] = [];

            const randomizedNames = [...names].sort(() => Math.random() - 0.5);
            const omitedNames = randomizedNames.splice(inputMaxNames ?? names.length);

            const groupSize = inputGroupSize ?? Math.ceil(randomizedNames.length / inputGroupCount!);
            while (randomizedNames.length !== 0) {
                const team: string[] = [];
                for (let i = 0; i < groupSize && randomizedNames.length !== 0; i++) {
                    team.push(randomizedNames.shift()!);
                }
                groups.push(team);
                if (inputGroupCount && groups.length === inputGroupCount) {
                    break;
                }
            }
            omitedNames.push(...randomizedNames);

            let groupsMessage = '';
            for (let i = 0; i < groups.length; i++) {
                const team = groups[i]!;
                groupsMessage += `Equipo ${i + 1}: ${team.join(' ')}\n`;
            }
            let message = `${bold(('Grupos generados:'))}\n${codeBlock('txt', groupsMessage)}`;

            if (omitedNames.length !== 0) {
                message += '\n' + italic(`${bold('Nombres omitidos:')} ${(omitedNames.join(' '))}`);
            }

            return interaction.reply({
                content: message,
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
