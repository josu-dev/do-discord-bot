import { nanoid } from 'nanoid';
import { ServerStats, db } from '../db/index.js';
import { log } from '../lib/logging.js';
import type { EventDefinition } from './+type.js';

export default (() => {
    return {
        once: false,
        name: `presenceUpdate`,
        description: `Welcome message for new members`,
        async response(client, oldPresence, newPresence) {
            if (newPresence.user?.bot) {
                return;
            }

            let updatePresence = oldPresence?.status !== newPresence.status;
            if (!updatePresence || !newPresence.guild) {
                return;
            }

            let totalMembers = 0;
            let totalOnline = 0;
            let totalBots = 0;
            for (const [_, m] of await newPresence.guild.members.fetch({withPresences: true})) {
                totalMembers++;
                if (!m.presence) {
                    continue;
                }

                if (m.user.bot) {
                    totalBots++;
                }
                else if (m.presence.status !== 'offline' && m.presence.status !== 'invisible') {
                    totalOnline++;
                }
            }

            try {
                await db.insert(ServerStats).values([{
                    id: nanoid(),
                    guild_id: newPresence.guild.id,
                    bots_count: totalBots,
                    members_count: totalMembers,
                    members_online: totalOnline,
                }]).onConflictDoUpdate({
                    target: [ServerStats.guild_id],
                    set: {
                        members_count: totalMembers,
                        members_online: totalOnline,
                        bots_count: totalBots,
                    }
                });
            }
            catch (error) {
                log.error(`Error updating server stats on guildMemberAdd event for guild ${newPresence.guild.id}\n`, error);
            }
        }
    };
}) satisfies EventDefinition<'presenceUpdate'>;
