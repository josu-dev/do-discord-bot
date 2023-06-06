import { EntryConfigDefinition } from '../sharedType';


export const fsConfig = {
    ignored: {
        dir: {
            type: `DIRECTORY`,
            literalName: undefined,
            re: /^!.+$/,
            reNegated: /^[^!].+$/
        },
        file: {
            type: `FILE`,
            literalName: undefined,
            re: /^!.+$/,
            reNegated: /^[^!].+\.(js|ts)$/
        },
        any: {
            type: `DIRECTORY_AND_FILE`,
            literalName: undefined,
            re: /^!.+$/,
            reNegated: /^[^!].+$/
        },
    },

    skiped: {
        type: `DIRECTORY_AND_FILE`,
        literalName: undefined,
        re: /^\+skip\..+$/
    },

    group: {
        type: `DIRECTORY`,
        literalName: undefined,
        re: /^\(\w+\)$/
    },
    groupSetup: {
        type: `FILE`,
        literalName: undefined,
        re: /^\+group\.(ts|js)$/
    },

    commandSetup: {
        type: `FILE`,
        literalName: undefined,
        re: /^\+command\.(ts|js)$/
    },

    subCommandGroup: {
        type: `DIRECTORY`,
        literalName: undefined,
        re: /^\(\w+\)$/
    },
    subCommandGroupSetup: {
        type: `FILE`,
        literalName: undefined,
        re: /^\+subgroup\.(ts|js)$/
    },

    categories: {
        type: `DIRECTORY`,
        literalName: `+categories`,
        re: /^\+categories$/
    },

    reserved: {
        type: `DIRECTORY_AND_FILE`,
        literalName: undefined,
        re: /^\+.+$/
    }
} as const satisfies Record<string, EntryConfigDefinition>;
