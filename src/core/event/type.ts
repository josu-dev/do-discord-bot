import { Client, ClientEvents } from 'discord.js';
import { ExtendedClient } from '../client';


export type EventNames = keyof ClientEvents;

export type EventCallback<N extends EventNames, C extends Client = ExtendedClient> = (client: C, ...args: ClientEvents[N]) => void;

export type EventTrait<N extends EventNames> = {
    readonly once: boolean;
    readonly name: N;
    readonly description: string;
    readonly response: EventCallback<N>;
};

export type EventDefinition<N extends EventNames, A extends unknown[] = []> = (...args: A) => EventTrait<N>;

export type EventModule = { default: EventDefinition<EventNames>; };
