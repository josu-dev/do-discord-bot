import { APIApplicationCommandOptionChoice, APIEmbed, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { StudentGroupsNames, studenGroupsEmbeds, studentGroups } from './+skip.shared';
import { addEphemeralOption } from '../../../lib/discordjs';


const allStudentGroupsReply: { embeds: APIEmbed[]; ephemeral: boolean; content: string; } = {
    content: `En la facultad estan presentes las siguientes agrupaciones estudiantiles:`,
    embeds: [...studenGroupsEmbeds.values()],
    ephemeral: true
};

function studentGroupsChoices() {
    const choices: APIApplicationCommandOptionChoice<string>[] = [];
    for (const group of studentGroups.values()) {
        choices.push({
            name: group.displayName,
            value: group.name,
        });
    }
    return choices;
}

const commandData = new SlashCommandSubcommandBuilder()
    .setName(`socials`)
    .setNameLocalization(`es-ES`, `redes`)
    .setDescription(`Socials medias of students groups`)
    .setDescriptionLocalization(`es-ES`, `Redes sociales de las agrupaciones estudiantiles`)
    .addStringOption(opt => opt
        .setName(`group`)
        .setNameLocalization(`es-ES`, `agrupacion`)
        .setDescription(`Student group`)
        .setDescriptionLocalization(`es-ES`, `Agrupación estudiantil`)
        .setChoices(...studentGroupsChoices())
    );
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
            const group = interaction.options.getString('group');

            if (!group) {
                allStudentGroupsReply.ephemeral = ephemeral;
                return interaction.reply(allStudentGroupsReply);
            }

            const studentGroup = studenGroupsEmbeds.get(group as StudentGroupsNames);
            if (!studentGroup) {
                return interaction.reply({
                    content: `Invalid student group`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                embeds: [studentGroup],
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
