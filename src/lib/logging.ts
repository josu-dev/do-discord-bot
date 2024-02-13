import { dev, logLevel } from '../enviroment';


const argDateFormater = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
export function currentArgDate() {
    return argDateFormater.format(Date.now());
}

/**
 * A simple logging utility
 * 
 * Log levels:
 * - _: fatal
 * - 1: core
 * - 2: error
 * - 3: warn
 * - 4: info
 * - 5: debug
 * - >: dev
 */
export const log = {
    dev(...args: any[]) {
        if (dev) {
            console['log'](`[DEV] ${currentArgDate()}`, ...args);
        }
    },
    debug(...args: any[]) {
        if (dev || logLevel >= 5) {
            console['debug'](`[DEBUG] ${currentArgDate()}`, ...args);
        }
    },
    info(...args: any[]) {
        if (dev || logLevel >= 4) {
            console['info'](`[INFO] ${currentArgDate()}`, ...args);
        }
    },
    warn(...args: any[]) {
        if (dev || logLevel >= 3) {
            console['warn'](`[WARN] ${currentArgDate()}`, ...args);
        }
    },
    error(...args: any[]) {
        if (logLevel >= 2) {
            console['error'](`[ERROR] ${currentArgDate()}`, ...args);
        }
    },
    core(...args: any[]) {
        if (logLevel >= 1) {
            console['log'](`[CORE] ${currentArgDate()}`, ...args);
        }
    },
    fatal(...args: any[]) {
        console['error'](`[FATAL] ${currentArgDate()}`, ...args);
    },
} as const;
