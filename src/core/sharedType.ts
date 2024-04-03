import { entryType } from '../lib/file.js';


const directoryAndFile = `DIRECTORY_AND_FILE`;

type NonAnyEntryType = Omit<typeof entryType, 'ANY'>;

export type EntryType = NonAnyEntryType[keyof NonAnyEntryType] | typeof directoryAndFile;

export type EntryConfig<T extends EntryType = EntryType> = {
    type: T;
    re: RegExp;
    reNegated?: RegExp;
    literalName?: string;
};

export type ExtendedEntryConfig = {
    dir?: EntryConfig<typeof entryType.DIRECTORY>;
    file?: EntryConfig<typeof entryType.FILE>;
    any?: EntryConfig<typeof directoryAndFile>;
};

export type EntryConfigDefinition = EntryConfig | ExtendedEntryConfig;
