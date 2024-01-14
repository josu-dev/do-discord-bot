import { APIEmbed, GuildMember, LocaleString, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { REPLY } from '../botConfig';
import type { Group } from '../core/command/command';
import { addEphemeralOption } from '../lib/discordjs';
import { translationMap } from '../lib/intl';
import { SingleFileCommandDefinition, SlashCommandTrait } from './+type';


const commandData = new SlashCommandBuilder()
    .setName(`help`)
    .setNameLocalization(`es-ES`, `ayuda`)
    .setDescription(`Show the help menu for the bot`)
    .setDescriptionLocalization(`es-ES`, `Muestra el menu de ayuda del bot`);

addEphemeralOption(commandData);


const helpMenuHeader = translationMap({
    "es-ES": `# Ayuda\nMenu de ayuda del bot sobre los comandos disponibles.\n\n**Lista de comandos:**`,
    "en-US": `# Help\nBot help menu about available commands.\n\n**Commands list:**`
});


function commandHelp(command: SlashCommandTrait, locale: LocaleString) {
    return `\`/${command.data.name_localizations?.[locale] ?? command.data.name}\` ${command.data.description_localizations?.[locale] ?? command.data.description ?? 'Sin descripcion'}`;
}


function commandGroupHelp(group: Group, locale: LocaleString, permissions: PermissionsBitField) {
    let commandsList = '';
    for (const command of group.commands) {
        // @ts-expect-error
        if (command.data.default_member_permissions && !permissions.has(PermissionsBitField.resolve(command.data.default_member_permissions))) {
            continue;
        }
        commandsList += `\n- ${commandHelp(command, locale)}`;
    }
    if (!commandsList) {
        return '';
    }

    return `\n### ${group.name}\n${group.value.description?.[locale] ?? 'Sin descripcion'}\n${commandsList}`;
}


function createHelpMenu(commands: Group, locale: LocaleString, member: GuildMember): string {
    let text = "";
    for (const command of commands.commands) {
        // @ts-expect-error
        if (command.data.default_member_permissions && !permissions.has(command.data.default_member_permissions)) {
            continue;
        }
        text += `\n- ${commandHelp(command, locale)}`;
    }
    if (text) {
        text = helpMenuHeader[locale] + "\n" + text;
    }
    else {
        text = helpMenuHeader[locale];
    }

    for (const group of commands.innerGroups) {
        if (group.value.permissions && !member.permissions.has(group.value.permissions)) {
            continue;
        }
        text += commandGroupHelp(group, locale, member.permissions);
    }

    return text;
}

export default ((commands) => {

    return {
        data: commandData,
        async execute({ interaction, client }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

            const embed: APIEmbed = {
                description: createHelpMenu(commands, interaction.locale, interaction.member),
                color: REPLY.EMBED.COLOR_INT,
                thumbnail: {
                    url: client.user?.displayAvatarURL() ?? ''
                }
            };

            return interaction.reply({
                embeds: [embed],
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SingleFileCommandDefinition<[Group]>;
