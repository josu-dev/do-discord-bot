import { EntryConfigDefinition } from '../sharedType';


export const CACHE_NAME_SUFFIX = '.cache.json';

export const config = {
    ignored: {
        type: `DIRECTORY_AND_FILE`,
        literalName: undefined,
        re: /^!.+$/,
        reNegated: /^[^!].+$/
    },
    ignoredDir: {
        type: `DIRECTORY`,
        literalName: undefined,
        re: /^!.+$/,
        reNegated: /^[^!].+$/
    },
    ignoredFile: {
        type: `FILE`,
        literalName: undefined,
        re: /^!.+$/,
        reNegated: /^[^!].+\.(js|ts)$/
    },
    skip: {
        type: `DIRECTORY_AND_FILE`,
        literalName: undefined,
        re: /^\+skip.+$/
    },
    generated: {
        type: `DIRECTORY`,
        literalName: `+generated`,
        re: /^\+generated$/
    },
    reserved: {
        type: `DIRECTORY_AND_FILE`,
        literalName: undefined,
        re: /^\+.+$/
    },
    cache: {
        type: `FILE`,
        literalName: undefined,
        re: /^.+\.cache\.json$/
    }
} as const satisfies Record<string, EntryConfigDefinition>;
