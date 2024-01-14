import { SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
import { GUILD } from '../../botConfig';
import { dev } from '../../enviroment';
import { dateAsArg } from '../../lib';
import { jsonCodeblock } from '../../lib/discordjs';


const VERIFIED_ROLE_ID = dev ? '1133933055422246914' : GUILD.ROLES.VERIFIED;

const commandData = new SlashCommandBuilder()
    .setName('member-info')
    .setDescription('Get info about a member')
    .addUserOption(option => option
        .setName('member')
        .setDescription('The member to get info from')
        .setRequired(true)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const opts = interaction.options;
            const user = opts.getUser('member', true);
            const member = opts.getMember('member');

            if (!member) {
                return interaction.reply({
                    content: `Member with id \`${user.id}\` not found`,
                    ephemeral: true,
                });
            }

            await interaction.deferReply({
                ephemeral: true,
                fetchReply: true,
            });

            const userInfo = {
                tag: member.user.tag,
                username: member.user.username,
                created: {
                    timestamp: member.user.createdTimestamp,
                    at: member.user.createdAt,
                    human: dateAsArg(member.user.createdAt),
                },
                avatar: member.user.avatarURL(),
                isBot: member.user.bot,
            };

            const memberInfo = {
                displayName: member.displayName,
                accepedRules: !member.pending,
                isVerified: member.roles.cache.has(VERIFIED_ROLE_ID),
                isBoosting: member.premiumSinceTimestamp !== null,
                avatar: member.avatarURL(),
                joined: {
                    timestamp: member.joinedTimestamp,
                    at: member.joinedAt,
                    human: dateAsArg(member.joinedAt ?? undefined),
                },
                roles: member.roles.cache.map(role => role.name),
            };

            const info = {
                id: member.id,
                user: userInfo,
                member: memberInfo,
            };

            return interaction.editReply({
                content: `Information about \`${member.displayName}\`:${jsonCodeblock(info)}`,
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
