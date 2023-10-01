import { spoiler, userMention } from 'discord.js';
import { GUILD } from '../botConfig';
import { dev } from '../enviroment';
import type { EventDefinition } from './+type';


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
                        console.error(`Error fetching welcome image for ${member.user.tag} (${member.user.id})`);
                    }
                    else {
                        console.error(`Error sending welcome image for ${member.user.tag} (${member.user.id})\n`, error);
                    }
                    await channel.send(GUILD.WELCOME.FALLBACK_MESSAGE.replaceAll(`{{mention}}`, userMention(member.id)));
                }
                else {
                    console.error(`Unknown error sending welcome message for ${member.user.tag} (${member.user.id})`);
                    throw error;
                }
            }
        }
    };
}) satisfies EventDefinition<'guildMemberAdd'>;
