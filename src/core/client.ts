import { Client, Collection } from 'discord.js';

import { MutableArray } from '../lib/utilType';
import { ProgramTaskData, ScheduleTaskData } from './types';
import { CLIENT } from '../botConfig';
import { registerEvents } from './event';
import { type SlashCommandTrait, registerCommands } from './command';
import { registerSelectMenus } from './selectMenu';
import { SelectMenuTrait } from './selectMenu/type';
import { botToken } from '../enviroment';


type RegisteredTask = { callback: (...args: any) => void; id: number | NodeJS.Timeout; };


export class ExtendedClient extends Client {
    commands: Collection<string, SlashCommandTrait>;
    selectMenus: Collection<string, SelectMenuTrait>;
    #programedTasks: Map<string, RegisteredTask>;
    #scheduledTasks: Map<string, RegisteredTask>;

    constructor() {
        super({
            intents: CLIENT.INTENTS,
            partials: CLIENT.PARTIALS as MutableArray<typeof CLIENT.PARTIALS>
        });

        this.commands = new Collection();
        this.selectMenus = new Collection();
        this.#programedTasks = new Map();
        this.#scheduledTasks = new Map();
    }

    async start() {
        await registerCommands(this);
        await registerEvents(this);
        await registerSelectMenus(this);
        await this.login(botToken);
    }


    programTask<C extends (...args: A) => void, A extends unknown[]>({ name, callback, ms, args, initialize = false }: ProgramTaskData<C, A>) {
        if (this.#programedTasks.has(name)) {
            console.log(`Task named '${name}' already has been registered with fn='${this.#programedTasks.get(name)}'`);
            return;
        }
        const id = setTimeout((...args) => {
            this.#programedTasks.delete(name);
            callback(...args);
        }, ms, ...args);
        this.#programedTasks.set(name, { callback, id });
        if (initialize)
            callback(...args);
    }

    removeProgramedTask(name: string) {
        const task = this.#programedTasks.get(name);
        if (!task) {
            console.log(`Programaed task with name '${name}' is not registered, can't be removed`);
            return;
        }
        this.#programedTasks.delete(name);
        try {
            clearTimeout(task.id);
        } catch (error) {
            if (!(error instanceof TypeError))
                throw error;
            console.log(`Error while clearing a task, invalid id\n  name > ${name}\n  id > ${task.id}\n  callback > ${task.callback}`);
        }
    }


    scheduleTask<C extends (...args: A) => void, A extends unknown[]>({ name, callback, interval, args, initialize = false }: ScheduleTaskData<C, A>) {
        if (this.#scheduledTasks.has(name)) {
            console.log(`Task named '${name}' already has been registered with fn='${this.#scheduledTasks.get(name)}'`);
            return;
        }
        const id = setInterval(callback, interval, ...args);
        this.#scheduledTasks.set(name, { callback, id });
        if (initialize)
            callback(...args);
    }

    removeScheduledTask(name: string) {
        const task = this.#scheduledTasks.get(name);
        if (!task) {
            console.log(`Task with name '${name}' is not registered, can't be removed`);
            return;
        }
        this.#scheduledTasks.delete(name);
        try {
            clearInterval(task.id);
        } catch (error) {
            if (!(error instanceof TypeError))
                throw error;
            console.log(`Error while clearing a task, invalid id\n  name > ${name}\n  id > ${task.id}\n  callback > ${task.callback}`);
        }
    }
}
