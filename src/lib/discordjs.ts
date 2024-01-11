import { EmbedBuilder, GuildMember, SlashCommandBuilder, SlashCommandSubcommandBuilder, spoiler, userMention } from 'discord.js';


export function mentionAtEnd(userId: string, message: string, mentionVisible = false) {
    return message + (message.endsWith('\n\n') ? '' : '\n') + (mentionVisible ? userMention(userId) : spoiler(userMention(userId)));
}
export function mentionAtStart(userId: string, message: string, mentionVisible = false) {
    return (mentionVisible ? userMention(userId) : spoiler(userMention(userId))) + '\n' + message;
}

export function embedByMember(member: GuildMember): EmbedBuilder {
    const embed = new EmbedBuilder()
        // .setColor(member.displayColor)
        .setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL()
        })
        .setFooter({
            text: `By ${member.displayName} <3`
        })
        .setTimestamp();

    const { accentColor } = member.user;
    if (accentColor)
        embed.setColor(accentColor);

    return embed;
}

export function addEphemeralOption(anyCommandBuilder: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> | SlashCommandSubcommandBuilder) {
    anyCommandBuilder.addBooleanOption(opt => opt
        .setName(`ephemeral`)
        .setNameLocalization(`es-ES`, `efimero`)
        .setDescription(`Sets the response as ephemeral, default true`)
        .setDescriptionLocalization(`es-ES`, `Establece la respuesta como efimera, por defecto true`)
    );
    return anyCommandBuilder;
}

export function jsonCodeblock(obj: unknown, space: number = 2): `\`\`\`json\n${string}\`\`\`\n` {
    return `\`\`\`json\n${JSON.stringify(obj, null, space)}\`\`\`\n`;
}
