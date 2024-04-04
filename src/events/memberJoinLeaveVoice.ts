import { updateServerStats } from '../db/functions.js';
import { db } from '../db/index.js';
import { log } from '../lib/logging.js';
import type { EventDefinition } from './+type.js';

export default (() => {
    return {
        once: false,
        name: `voiceStateUpdate`,
        description: `Welcome message for new members`,
        async response(client, oldVoice, newVoice) {
            if (newVoice.member?.user.bot) {
                return;
            }

            if (oldVoice.channelId === newVoice.channelId || !newVoice.guild) {
                return;
            }

            const update = await updateServerStats(db, newVoice.guild);
            if (!update.success) {
                log.error(update.message, update.error);
            }
        }
    };
}) satisfies EventDefinition<'voiceStateUpdate'>;
