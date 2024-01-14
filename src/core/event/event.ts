import { z } from 'zod';
import { f } from '../../lib';
import { log } from '../../lib/logging';
import { ExtendedClient } from '../client';
import type { EventCallback, EventModule, EventNames } from './type';


const eventSchema = z.object({
    default: z
        .function()
        .returns(z.object({
            once: z.boolean(),
            name: z.string(),
            description: z.string(),
            response: z
                .function(
                    z.tuple([z.object({})]).rest(z.unknown()),
                    z.void()
                )
        }))
});
// type test = z.infer<typeof eventSchema>;


class Event<N extends EventNames> {
    readonly name: N;
    readonly once: boolean;
    readonly description: string;
    readonly response: EventCallback<N>;

    constructor(eventName: N, once: boolean, description: string, responseFn: EventCallback<N, ExtendedClient>) {
        this.name = eventName;
        this.once = once;
        this.description = description;
        this.response = responseFn;
    }
}


export async function registerEvents(client: ExtendedClient): Promise<void> {
    const EVENTS_ABS_DIR = f.posixJoin(
        ...f.splitEntrys(__dirname), '..', '..', 'events'
    );

    const eventsToLoad = f.deepList({
        type: 'file',
        absolutePath: EVENTS_ABS_DIR,
        dirNamePattern: /^[^!+][\w-]+$/,
        fileNamePattern: /^[^!+][\w-]+\.(ts|js)$/,
    });
    if (!eventsToLoad || eventsToLoad.length === 0) {
        log.warn(`Failed to find events to register`);
        return;
    }

    for (const eventName of eventsToLoad) {
        const EVENT_ABS_PATH = f.posixJoin(EVENTS_ABS_DIR, eventName);

        const importResult = await f.importModuleWithZod<EventModule>(EVENT_ABS_PATH, eventSchema);
        if (!importResult.success) {
            log.warn(`import error: ${importResult.error}\n  path > ${EVENT_ABS_PATH}\n  exception?.name > ${importResult.exception?.name}`);
            log.warn(`Event declared at path '${EVENT_ABS_PATH}' has problems, not loaded`);
            continue;
        };

        const event = importResult.module.default();

        if (event.once)
            client.once(event.name, (...args) => void event.response(client, ...args));
        else
            client.on(event.name, (...args) => void event.response(client, ...args));
    }
}
