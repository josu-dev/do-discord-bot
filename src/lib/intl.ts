import { LocaleString, LocalizationMap } from 'discord.js';

type TranslationRecord = {
    [Key in string]: string | TranslationRecord;
};

export type TranslationDefinition = Record<string, TranslationRecord>;


type PathInto<T extends Record<string, any>> = keyof {
    [K in keyof T as T[K] extends string
    ? K
    : T[K] extends Record<string, any>
    ? `${K & string}.${PathInto<T[K]> & string}`
    : never
    ]: any;
} & string;

type TypeFromPath<T extends Record<string, unknown>, Path extends string> =
    Path extends keyof T
    ? T[Path]
    : Path extends `${infer Key}.${infer Rest}`
    ? T[Key] extends Record<string, unknown>
    ? TypeFromPath<T[Key], Rest>
    : never
    : never;


export function t<T extends TranslationDefinition, P extends PathInto<T>>(record: T, path: P): TypeFromPath<T, P> {
    return eval("record." + path);
}


export function translationMap<T extends LocalizationMap, L extends LocaleString = "en-US", R = Record<LocaleString, string>>(map: T, defaultLocale?: L): R {
    const _defaultLocale = defaultLocale || "en-US";

    return new Proxy(map, {
        get(target, prop) {
            if (prop in target) {
                // @ts-expect-error
                return target[prop];
            }
            return target[_defaultLocale];
        }
    }) as unknown as R;
}
