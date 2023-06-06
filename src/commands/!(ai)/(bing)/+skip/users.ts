class UserRegistry {
    readonly id: string;
    #warned: boolean;
    #warns: number;
    #lastWarning?: Date;
    #lastWarnContext: unknown;

    #banned: boolean;
    #bans: number;
    #lastBan?: Date;
    #lastBanContext: unknown;

    constructor({ id, warned, banned }: { id: string, warned?: boolean, banned?: boolean; }) {
        this.id = id;
        this.#warned = !!warned;
        this.#warns = Number(!!warned);
        this.#lastWarning = warned ? new Date() : undefined;

        this.#banned = !!banned;
        this.#bans = Number(!!banned);
        this.#lastBan = banned ? new Date() : undefined;
    }

    get isWarned() {
        return this.#warned;
    }
    get lastWarning() {
        return this.#lastWarning;
    }
    get lastWarnContext() {
        return this.#lastWarnContext;
    }
    get warningsCount() {
        return this.#warns;
    }

    get isBanned() {
        return this.#banned;
    }
    get lastBan() {
        return this.#lastBan;
    }
    get lastBanContext() {
        return this.#lastBanContext;
    }
    get bansCount() {
        return this.#bans;
    }

    warn(context?: unknown) {
        this.#warned = true;
        this.#lastWarning = new Date();
        this.#warns++;
        this.#lastWarnContext = context;
    }

    removeWarn() {
        if (this.#warned) {
            this.#warned = false;
            return true;
        }
        return false;
    }

    ban(context?: unknown) {
        this.#banned = true;
        this.#lastBan = new Date();
        this.#bans++;
        this.#lastBanContext = context;
    }

    removeBan() {
        if (this.#banned) {
            this.#banned = false;
            return true;
        }
        return false;
    }
}

class CommandRegistry {
    #users: Map<string, UserRegistry> = new Map();

    constructor() {
        this.#users = new Map();
    }

    get(id: string, createIfNotExists?: false): UserRegistry | undefined;
    get(id: string, createIfNotExists: true): UserRegistry;
    get(id: string, createIfNotExists = false) {
        return this.#users.get(id) ?? (createIfNotExists ? this.add(id) : undefined);
    }

    add(id: string) {
        const user = new UserRegistry({ id });
        this.#users.set(id, user);
        return user;
    }

    warnUser(userId: string, context?: unknown) {
        let user = this.#users.get(userId) ?? new UserRegistry({ id: userId, warned: false });
        user.warn(context);
        this.#users.set(userId, user);
    }

    banUser(userId: string, context?: unknown) {
        let user = this.#users.get(userId) ?? new UserRegistry({ id: userId, banned: false });
        user.ban(context);
        this.#users.set(userId, user);
    }

    isWarned(userId: string) {
        return this.#users.get(userId)?.isWarned ?? false;
    }

    isBanned(userId: string) {
        return this.#users.get(userId)?.isBanned ?? false;
    }

    removeWarn(userId: string) {
        return !!this.#users.get(userId)?.removeWarn();
    }

    removeBan(userId: string) {
        return !!this.#users.get(userId)?.removeBan();
    }

    getWarnedUsers() {
        const warnedUsers: UserRegistry[] = [];
        for (const user of this.#users.values()) {
            if (user.isWarned) warnedUsers.push(user);
        }
        return warnedUsers;
    }

    getBannedUsers() {
        const bannedUsers: UserRegistry[] = [];
        for (const user of this.#users.values()) {
            if (user.isBanned) bannedUsers.push(user);
        }
        return bannedUsers;
    }

    getAllUsers() {
        return [...this.#users.values()];
    }
}


export const bingChatRegistry = new CommandRegistry();
