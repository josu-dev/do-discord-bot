import { spoiler, userMention } from 'discord.js';
import { nanoid } from 'nanoid';
import { GUILD } from '../botConfig.js';
import { ServerStats, db } from '../db/index.js';
import { dev } from '../enviroment.js';
import { log } from '../lib/logging.js';
import type { EventDefinition } from './+type.js';


const WELCOME_CHANNEL = dev
    ? '836228707441311754'
    : GUILD.WELCOME.CHANNEL;

const WELCOME_MESSAGE_URL = dev
    ? `http://localhost:3000/api/welcome_message.png`
    : GUILD.WELCOME.IMG_GEN_URL;

export default (() => {
    return {
        once: false,
        name: `guildMemberAdd`,
        description: `Welcome message for new members`,
        async response(client, member) {
            if (member.user.bot) {
                return;
            }

            const channel = client.channels.cache.get(WELCOME_CHANNEL);
            if (!channel || channel.isDMBased() || !channel.isTextBased()) {
                throw new Error(`Bad configuration for welcome channel, CHANNEL: ${WELCOME_CHANNEL} is not a valid text channel of guild ${member.guild.name} (${member.guild.id})`);
            }

            if (!WELCOME_MESSAGE_URL) {
                await channel.send(GUILD.WELCOME.FALLBACK_MESSAGE.replaceAll(`{{mention}}`, userMention(member.id)));
                return;
            }

            const image_url = `${WELCOME_MESSAGE_URL}?username=${encodeURIComponent(member.displayName)}&avatar_id=${encodeURIComponent(member.user.avatar ?? '')}&user_id=${encodeURIComponent(member.user.id)}`;

            try {
                await channel.send({
                    content: `${spoiler(`${userMention(member.id)} es nuevo en el servidor!`)}\n​`,
                    files: [image_url]
                });
            }
            catch (error) {
                if (error instanceof TypeError) {
                    if (error.message.includes('fetch failed')) {
                        log.error(`Error fetching welcome image for ${member.user.tag} (${member.user.id})`);
                    }
                    else {
                        log.error(`Error sending welcome image for ${member.user.tag} (${member.user.id})\n`, error);
                    }
                    await channel.send(GUILD.WELCOME.FALLBACK_MESSAGE.replaceAll(`{{mention}}`, userMention(member.id)));
                }
                else {
                    log.error(`Unknown error sending welcome message for ${member.user.tag} (${member.user.id})`);
                    throw error;
                }
            }

            let totalMembers = 0;
            let totalOnline = 0;
            let totalBots = 0;
            for (const m of member.guild.members.cache.values()) {
                totalMembers++;
                if (m.presence?.status !== 'offline') {
                    totalOnline++;
                }
                if (m.user.bot) {
                    totalBots++;
                }
            }
            try {
                await db.insert(ServerStats).values([{
                    id: nanoid(),
                    guild_id: member.guild.id,
                    bots_count: totalBots,
                    members_count: totalMembers,
                    members_online: totalOnline,
                }]).onConflictDoUpdate({
                    target: [ServerStats.guild_id],
                    set: {
                        bots_count: totalBots,
                        members_count: totalMembers,
                        members_online: totalOnline,
                    }
                });
            }
            catch (error) {
                log.error(`Error updating server stats on guildMemberAdd event for guild ${member.guild.id}\n`, error);
            }
        }
    };
}) satisfies EventDefinition<'guildMemberAdd'>;
