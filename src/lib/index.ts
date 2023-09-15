import * as file from './file';
import * as schema from './schema';
import * as utilType from './utilType';
export { file as f, schema, utilType as ut };


const dateFormater = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
export function logWithTime(...args: { toString: () => string; }[]) {
    console.log('[' + dateFormater.format(Date.now()) + ']', ...args);
}

export function tsToRawHsMinS(ts: number) {
    return ts < 1_000 ? '0s' :
        ts < 60_000 ? `${Math.floor(ts / 1000)}s` :
            ts < 3_600_000 ? `${Math.floor(ts / 60000)}m ${Math.floor((ts / 1000) % 60)}s` :
                `${Math.floor(ts / 3600000)}h ${Math.floor((ts / 60000) % 60)}m ${Math.floor((ts / 1000) % 60)}s`;
}

export function pickRandom<T extends unknown>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)]!;
}

export function hexColorToInt(color: `#${string}`) {
    return parseInt((color).slice(1), 16);
}

const argFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

export function dateAsArg(date: Date | number | undefined) {
    return argFormatter.format(date);
}
