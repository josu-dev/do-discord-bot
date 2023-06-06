import type { EventDefinition } from './+type';
import { PRESENCES } from '../globalConfigs';
import { ExtendedClient } from '../core/client';
import { logWithTime, pickRandom } from '../lib';


function updatePresence(client: ExtendedClient) {
    client.user?.setPresence(pickRandom(PRESENCES));
}

export default (() => {
    return {
        once: true,
        name: `ready`,
        description: `Logs that the bot set up was succesfull as well as event handling`,
        async response(client) {
            logWithTime(`Initialized bot`);

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
