import type { Guild } from 'discord.js';
import { nanoid } from 'nanoid';
import { DB, ServerStats } from './index.js';

export type Result = {
    success: true;
} | {
    success: false;
    error: unknown;
    message: string;
};

export async function updateServerStats(db: DB, guild: Guild) {
    const stats = {} as typeof ServerStats.$inferInsert;
    stats.id = nanoid();
    stats.guild_id = guild.id;
    stats.bots_count = 0;
    stats.members_count = 0;
    stats.members_online = 0;
    stats.members_connected = 0;
    stats.members_last_day = 0;
    stats.members_last_week = 0;

    const today = new Date().getTime();
    for (const m of (await guild.members.fetch({ withPresences: true })).values()) {
        if (m.user.bot) {
            stats.bots_count++;
            continue;
        }

        stats.members_count++;
        if (m.joinedTimestamp) {
            if (today - m.joinedTimestamp < 86400000) {
                stats.members_last_day++;
            }
            if (today - m.joinedTimestamp < 604800000) {
                stats.members_last_week++;
            }
        }

        if (m.voice.channelId) {
            stats.members_connected++;
        }

        if (!m.presence) {
            continue;
        }

        if (m.presence.status !== 'offline' && m.presence.status !== 'invisible') {
            stats.members_online++;
        }
    }

    try {
        await db
            .insert(ServerStats)
            .values([stats])
            .onConflictDoUpdate({
                target: [ServerStats.guild_id],
                set: {
                    bots_count: stats.bots_count,
                    members_count: stats.members_count,
                    members_online: stats.members_online,
                    members_connected: stats.members_connected,
                    members_last_day: stats.members_last_day,
                    members_last_week: stats.members_last_week
                }
            });
    }
    catch (error) {
        return {
            success: false,
            error,
            message: `Error updating server stats on guildMemberAdd event for guild ${guild.id}`
        };
    }

    return { success: true };
}
