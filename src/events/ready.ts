import { PRESENCES } from '../botConfig';
import { ExtendedClient } from '../core/client';
import { pickRandom } from '../lib';
import { log } from '../lib/logging';
import type { EventDefinition } from './+type';


function updatePresence(client: ExtendedClient) {
    client.user?.setPresence(pickRandom(PRESENCES));
}

export default (() => {
    return {
        once: true,
        name: `ready`,
        description: `Logs that the bot set up was succesfull as well as event handling`,
        async response(client) {
            log.core(`Bot initialized succesfully, logged in as ${client.user?.tag ?? 'unknown'}`);

            client.scheduleTask({
                name: 'updatePresence',
                callback: updatePresence,
                interval: 5 * 60 * 1000,
                args: [client],
                initialize: true
            });
        }
    };
}) satisfies EventDefinition<'ready'>;
