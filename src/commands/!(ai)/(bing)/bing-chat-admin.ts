import { APIEmbed, PermissionFlagsBits, SlashCommandBuilder, bold, codeBlock, userMention } from 'discord.js';
import { SingleFileCommandDefinition } from '../../+type';
import { bingChatRegistry } from './+skip/users';


const EMBED_COLOR = 0x006880;

const commandData = new SlashCommandBuilder()
    .setName(`bing-chat-admin`)
    .setDescription(`Manage the bing chat command.`)
    .addSubcommand(cmd => cmd
        .setName(`list`)
        .setDescription(`List the users that have been warned or banned`)
        .addStringOption(opt => opt
            .setRequired(true)
            .setName(`mode`)
            .setNameLocalization(`es-ES`, `modo`)
            .setDescription(`The mode to list the users`)
            .setDescriptionLocalization(`es-ES`, `El modo para listar los usuarios`)
            .setChoices(
                {
                    name: `ban`,
                    name_localizations: { 'es-ES': `ban` },
                    value: `ban`
                },
                {
                    name: `warn`,
                    name_localizations: { 'es-ES': `advertencia` },
                    value: `warn`
                }
            )
        )
    )
    .addSubcommand(cmd => cmd
        .setName(`user-info`)
        .setDescription(`Get info about a user`)
        .addUserOption(opt => opt
            .setRequired(true)
            .setName(`user`)
            .setDescription(`The user to get info about`)
        )
        .addBooleanOption(opt => opt
            .setName(`show-context-warn`)
            .setDescription(`Show the context of the last warn`)
        )
        .addBooleanOption(opt => opt
            .setName(`show-context-ban`)
            .setDescription(`Show the context of the last ban`)
        )
    )
    .addSubcommand(cmd => cmd
        .setName(`remove-warn`)
        .setDescription(`Remove warn state from a user`)
        .addUserOption(opt => opt
            .setRequired(true)
            .setName(`user`)
            .setDescription(`The user to remove the warn`)
        )
    )
    .addSubcommand(cmd => cmd
        .setName(`remove-ban`)
        .setDescription(`Remove ban state from a user`)
        .addUserOption(opt => opt
            .setRequired(true)
            .setName(`user`)
            .setDescription(`The user to remove the ban`)

        )
    );


type SubCommandName = 'list' | 'user-info' | 'remove-warn' | 'remove-ban';

type Mode = 'ban' | 'warn';


function contextEmbed<T extends Mode>(mode: T, context: unknown) {
    return {
        title: `Context ${mode}`,
        description: codeBlock(JSON.stringify(context, null, 2).slice(0, 4000)),
        color: EMBED_COLOR
    };
}


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const command = interaction.options.getSubcommand() as SubCommandName;
            if (command === 'list') {
                const mode = interaction.options.getString(`mode`, true) as 'banned' | 'warned';
                const users = mode === 'warned' ? bingChatRegistry.getWarnedUsers() : bingChatRegistry.getBannedUsers();

                let usersSummary = '';
                for (const user of users) {
                    usersSummary += `${userMention(user.id)} - ${(user.id)} - ${user.warningsCount} warns - ${user.bansCount} bans\n`;
                }

                const embed: APIEmbed = {
                    title: `Users ${mode} ${users.length}`,
                    description: usersSummary,
                    color: EMBED_COLOR,
                };

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const inputUser = interaction.options.getUser(`user`, true);

            if (command === 'user-info') {
                const user = bingChatRegistry.get(inputUser.id);
                if (!user) {
                    return interaction.reply({
                        content: `User ${userMention(inputUser.id)} hasn't been warned or banned`,
                        ephemeral: true
                    });
                }

                const showContextWarn = interaction.options.getBoolean(`show-context-warn`) ?? false;
                const showContextBan = interaction.options.getBoolean(`show-context-ban`) ?? false;

                const embeds = [{
                    title: `Summary of ${userMention(user.id)}`,
                    description: bold('id: ') + user.id + '\n' + bold('warns: ') + user.warningsCount + '\n' + bold('bans: ') + user.bansCount,
                    color: EMBED_COLOR,
                }] satisfies APIEmbed[];

                if (showContextWarn) {
                    embeds.push(contextEmbed(`warn`, user.lastWarnContext ?? ''));
                }
                if (showContextBan) {
                    embeds.push(contextEmbed(`ban`, user.lastBanContext ?? ''));
                }

                return interaction.reply({ embeds: embeds, ephemeral: true });
            }

            if (command === 'remove-warn') {
                const success = bingChatRegistry.removeWarn(inputUser.id);
                return interaction.reply({
                    content: success
                        ? `Warn removed from ${userMention(inputUser.id)}`
                        : `User ${userMention(inputUser.id)} hasn't been warned`,
                    ephemeral: true
                });
            }

            if (command === 'remove-ban') {
                bingChatRegistry.removeWarn(inputUser.id);
                const success = bingChatRegistry.removeBan(inputUser.id);
                return interaction.reply({
                    content: success
                        ? `Ban removed from ${userMention(inputUser.id)}`
                        : `User ${userMention(inputUser.id)} hasn't been banned`,
                    ephemeral: true
                });
            }

            throw new Error(`Unhandled subcommand ${command} at bing-chat-admin command`);
        },
        permissions: [PermissionFlagsBits.Administrator]
    };
}) satisfies SingleFileCommandDefinition;
