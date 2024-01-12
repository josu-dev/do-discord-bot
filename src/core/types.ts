type TaskData<C extends (...args: A) => void, A extends unknown[]> = {
    name: string,
    callback: C,
    args: A;
    initialize?: boolean;
};

export type ProgramTaskData<C extends (...args: A) => void, A extends unknown[]> = TaskData<C, A> & { ms: number; };

export type ScheduleTaskData<C extends (...args: A) => void, A extends unknown[]> = TaskData<C, A> & { interval: number; };

export type ProgramTask<C extends (...args: A) => void, A extends unknown[]> = ({ name, callback, ms, args, initialize }: ProgramTaskData<C, A>) => void;

type RemoveTask = (name: string) => void;

export interface TaskProgramerTrait<C extends (...args: A) => void, A extends unknown[]> {
    programTask: ProgramTask<C, A>;
    removeProgramedTask: RemoveTask;
}

export interface TaskSchedulerTrait<C extends (...args: A) => void, A extends unknown[]> {
    scheduleTask: ProgramTask<C, A>;
    removeScheduledTask: RemoveTask;
}
