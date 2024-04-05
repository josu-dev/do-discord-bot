import { updateServerStats } from '../db/functions.js';
import { db } from '../db/index.js';
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

            const update = await updateServerStats(db, newPresence.guild);
            if (!update.success) {
                log.error(update.message, update.error);
            }
        }
    };
}) satisfies EventDefinition<'presenceUpdate'>;
