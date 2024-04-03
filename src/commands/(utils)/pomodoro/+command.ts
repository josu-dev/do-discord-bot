import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, SubCommandDefinitionFrom } from '../../+type.js';
import type { TaskProgramerTrait } from '../../../core/types.js';
import { Values } from '../../../lib/utilType.js';


export const pomodoroEvent = {
    Start: 'Start',
    BreakStart: 'BreakStart',
    StudyStart: 'StudyStart',
    FinalBreakStart: 'FinalBreakStart',
    End: 'End',
} as const;

type PomodoroEvents = Values<typeof pomodoroEvent>;

type PomodoroData = {
    taskManager: TaskProgramerTrait<() => void, []>;
    userId: string;
    objetive: string;
    cicles: number;
    breakTime: number;
    studyTime: number;
    endBreakTime: number;
    onEvent: (event: PomodoroEvents, pomorodo: Pomodoro) => void;
};

export class Pomodoro {
    static #IIID: number = 0;
    id: `pomodoro-${number}`;
    taskManager: TaskProgramerTrait<() => void, []>;
    userId: string;
    objetive: string;
    readonly config: {
        cicles: number;
        breakTime: number;
        studyTime: number;
        endTime: number;
    };
    timeoutId?: number | NodeJS.Timeout;
    lastStartTime: number;
    isPaused: boolean;
    pausedAt: number;
    onBreak: boolean;
    nextEventTimestamp: number;
    onEvent: (event: PomodoroEvents, pomodoro: this) => void;
    readonly stats: {
        sessionStartTime: number;
        completedCicles: number;
        timesPaused: number;
        sessionEndTime: number;
    };

    /** Time values on minutes */
    constructor({ taskManager, objetive, userId, cicles, breakTime, studyTime, endBreakTime, onEvent }: PomodoroData) {
        this.taskManager = taskManager;
        this.userId = userId;
        const actualTime = Date.now();
        this.lastStartTime = actualTime;
        this.isPaused = false;
        this.objetive = objetive;
        this.pausedAt = 0;
        this.id = `pomodoro-${Pomodoro.#IIID}`;
        this.onBreak = false;
        this.nextEventTimestamp = -1;
        this.onEvent = onEvent;
        this.config = {
            cicles: cicles,
            breakTime: breakTime * 60 * 1000,
            studyTime: studyTime * 60 * 1000,
            endTime: endBreakTime * 60 * 1000,
        };
        this.stats = {
            sessionStartTime: actualTime,
            completedCicles: 0,
            timesPaused: 0,
            sessionEndTime: -1,
        };
        Pomodoro.#IIID += 1;
    }

    #program(callback: () => void, ms: number) {
        this.nextEventTimestamp = Date.now() + ms;
        this.taskManager.programTask({
            name: this.id,
            callback: callback.bind(this),
            ms,
            args: []
        });
    }


    #end() {
        this.stats.sessionEndTime = Date.now();
        this.onEvent(pomodoroEvent.End, this);
    }

    #newCicle() {
        this.stats.completedCicles += 1;
        if (this.stats.completedCicles < this.config.cicles) {
            this.onBreak = false;
            this.#program(this.#break, this.config.studyTime);
            this.onEvent(pomodoroEvent.StudyStart, this);
            return;
        }
        this.#program(this.#end, this.config.endTime);
        this.onEvent(pomodoroEvent.FinalBreakStart, this);
    }

    #break() {
        this.onBreak = true;
        this.#program(this.#newCicle, this.config.breakTime);
        this.onEvent(pomodoroEvent.BreakStart, this);
    }

    start() {
        this.#program(this.#break, this.config.studyTime);
        this.lastStartTime = Date.now();
        this.onEvent(pomodoroEvent.Start, this);
    }

    pause() {
        if (this.isPaused) return;
        this.isPaused = true;
        this.taskManager.removeProgramedTask(this.id);
        this.pausedAt = Date.now();
        this.stats.timesPaused += 1;
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.lastStartTime = Date.now();
        const remainingMs = this.nextEventTimestamp - this.pausedAt;
        if (!this.onBreak) {
            this.#program(this.#break, remainingMs);
            return;
        }
        if (this.stats.completedCicles < this.config.cicles)
            this.#program(this.#newCicle, remainingMs);
        else
            this.#program(this.#end, remainingMs);

    }

    end() {
        if (!this.isPaused) {
            this.taskManager.removeProgramedTask(this.id);
        }
        this.stats.sessionEndTime = Date.now();
    }
}


const baseCommand = (() => {
    const runningPomodoros = new Map<string, Pomodoro>();

    return {
        data: new SlashCommandBuilder()
            .setName('pomodoro')
            .setDescription('Funcionalidad para ayudarte con el estudio')
        ,
        subCommandsArgs: [runningPomodoros]
    };
}) satisfies MultiFileCommandDefinition;

export type SubCommandDefinition = SubCommandDefinitionFrom<typeof baseCommand>;

export default baseCommand;
