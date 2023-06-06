import { SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { StudentGroupsNames, studenGroupsEmbeds, studentGroups } from './+skip.shared';
import { addEphemeralOption } from '../../../lib/discordjs';


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`center`)
    .setNameLocalization(`es-ES`, `centro`)
    .setDescription(`Actual student center`)
    .setDescriptionLocalization(`es-ES`, `Centro de studiantes actual`);
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            let actualCenterName: StudentGroupsNames | undefined;
            for (const group of studentGroups.values()) {
                if (group.studentCenter) {
                    actualCenterName = group.name;
                    break;
                }
            }
            if (!actualCenterName) {
                return interaction.reply({
                    content: `No se encontro centro de estudiantes actual`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: `El centro de estudiantes actual es:`,
                embeds: [studenGroupsEmbeds.get(actualCenterName)!],
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
