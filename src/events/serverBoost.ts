import { spoiler, userMention } from 'discord.js';
import { GUILD } from '../botConfig';
import { dev } from '../enviroment';
import { log } from '../lib/logging';
import type { EventDefinition } from './+type';


const SERVER_BOOST_CHANNEL = dev
    ? '836228707441311754'
    : GUILD.BOOST.CHANNEL;

const SERVER_BOOST_URL = dev
    ? `http://localhost:3000/api/server_boost.png`
    : GUILD.BOOST.IMG_GEN_URL;

export default (() => {
    return {
        once: false,
        name: `guildMemberUpdate`,
        description: `Thanks message when a member boost the server`,
        async response(client, oldMember, newMember) {
            if (oldMember.user.bot) {
                return;
            }

            const channel = client.channels.cache.get(SERVER_BOOST_CHANNEL);
            if (!channel || channel.isDMBased() || !channel.isTextBased()) {
                throw new Error(`Bad configuration for server boost channel, CHANNEL: ${GUILD.WELCOME.CHANNEL} is not a valid text channel of guild ${oldMember.guild.name} (${oldMember.guild.id})`);
            }
            if (!newMember.premiumSince || oldMember.premiumSince?.getTime() === newMember.premiumSince.getTime()) {
                return;
            }
            log.debug(`Server boost by ${newMember.user.tag} (${newMember.user.id})\n${oldMember}\n${newMember}`);

            if (!SERVER_BOOST_URL) {
                await channel.send(GUILD.BOOST.FALLBACK_MESSAGE.replaceAll(`{{mention}}`, userMention(newMember.id)));
                return;
            }

            const image_url = `${SERVER_BOOST_URL}?username=${encodeURIComponent(newMember.displayName)}&avatar_id=${encodeURIComponent(newMember.user.avatar ?? '')}&user_id=${encodeURIComponent(newMember.user.id)}`;

            try {
                await channel.send({
                    content: `${spoiler(`${userMention(newMember.id)} boosteo el servidor!`)}\n​`,
                    files: [image_url]
                });
            }
            catch (error) {
                if (error instanceof TypeError) {
                    if (error.message.includes('fetch failed')) {
                        log.error(`Error fetching welcome image for ${newMember.user.tag} (${newMember.user.id})`);
                    }
                    else {
                        log.error(`Error sending welcome image for ${newMember.user.tag} (${newMember.user.id})\n`, error);
                    }
                    await channel.send(GUILD.WELCOME.FALLBACK_MESSAGE.replaceAll(`{{mention}}`, userMention(newMember.id)));
                }
                else {
                    log.error(`Unknown error sending welcome message for ${newMember.user.tag} (${newMember.user.id})`);
                    throw error;
                }
            }
        }
    };
}) satisfies EventDefinition<'guildMemberUpdate'>;
