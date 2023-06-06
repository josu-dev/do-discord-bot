import fs from 'fs';
import path from 'path';
import { z } from 'zod';

import * as tu from './utilType';


export function splitEntrys(absolutePath: string) {
    return absolutePath.split(path.sep);
}

export function posixJoin(...entrysNames: string[]): string {
    return entrysNames.join(path.posix.sep);
}

export function toPosix(anyPath: string): string {
    const regex = /[\/\\]+$/;
    const outputPath = anyPath.replace(regex, '');
    return outputPath.split(path.sep).join('/');
}

export function readJSON(absPath: string): unknown | undefined {
    if (!absPath) {
        console.log(`to read a json mus provide a valid string path, provided path='${path}'`);
        return undefined;
    }
    let content: string;
    try {
        content = fs.readFileSync(absPath, { encoding: 'utf-8' });
    } catch (error) {
        if (!isNodeJSError(error)) throw error;
        switch (error.code) {
            case 'ENOENT':
                console.log(`File at '${absPath}' does not exist`);
                break;
            case 'EACCES':
                console.log(`Permission denied to read ${path}`);
                break;
            default:
                console.log(`Unhandled error, code: ${error.code}, message: ${error.message}`);
                break;
        }
        return undefined;
    }
    try {
        return JSON.parse(content) as unknown;
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        console.log(`Syntax error when trying to parse json at '${path}'`);
        return undefined;
    }
}

export function writeJSON<T extends tu.Json>(absPath: string, value: T): boolean {
    if (!absPath) {
        console.log(`to save a json mus provide a valid string path, provided path='${path}'`);
        return false;
    }
    try {
        fs.writeFileSync(absPath, JSON.stringify(value, null, 2), { encoding: 'utf-8' });
        return true;
    } catch (error) {
        if (error instanceof TypeError) {
            console.log(`Type error when trying to JSON.stringify a value`);
            return false;
        }
        if (!isNodeJSError(error)) throw error;
        switch (error.code) {
            case 'ENOENT':
                console.log(`Directory at '${absPath}' does not exist`);
                break;
            case 'EACCES':
                console.log(`Permission denied to read ${path}`);
                break;
            default:
                console.log(`Unhandled error, code: ${error.code}, message: ${error.message}`);
                break;
        }
        return false;
    }
}

type EntryData = {
    name: string;
    absolutePath: string;
    parent?: EntryDirectory;
};

type Entry = EntryFile | EntryDirectory;

export const entryType = {
    DIRECTORY: `DIRECTORY`,
    FILE: 'FILE',
    ANY: 'ANY'
} as const;

type EntryTypes = typeof entryType[keyof typeof entryType];

type EntryTypeMapper = {
    DIRECTORY: EntryDirectory;
    FILE: EntryFile;
    ANY: EntryDirectory | EntryFile;
};

type FileData = EntryData & {
    module?: {};
};

export class EntryFile implements FileData {
    readonly type = entryType.FILE;
    name: string;
    absolutePath: string;
    parent?: EntryDirectory;
    module?: {};

    constructor({ name, absolutePath, parent, module }: FileData) {
        this.name = name;
        this.absolutePath = absolutePath;
        this.parent = parent;
        this.module = module;
    }
}

type DirectoryData = EntryData & {
    entries: Entry[];
};

export class EntryDirectory implements DirectoryData {
    readonly type = entryType.DIRECTORY;
    name: string;
    absolutePath: string;
    parent?: EntryDirectory;
    entries: Entry[];

    constructor({ name, absolutePath, parent, entries }: DirectoryData) {
        this.name = name;
        this.absolutePath = absolutePath;
        this.parent = parent;
        this.entries = entries;
    }

    get<T extends EntryTypes>(entryName: string, type?: T): EntryTypeMapper[T] | undefined {
        const actualType = type ?? entryType.ANY;
        for (const entry of this.entries) {
            if (entry.name === entryName && (actualType === entryType.ANY || entry.type === actualType))
                return entry as EntryTypeMapper[T];
        }
        return undefined;
    }

    deepGet(entryName: string, type: EntryTypes = entryType.ANY): EntryTypeMapper[typeof type] | undefined {
        for (const entry of this.entries) {
            if (entry.name === entryName && (type === entryType.ANY || entry.type === type))
                return entry;
        }
        for (const entry of this.entries) {
            if (entry.type === entryType.DIRECTORY) {
                const deeper = entry.deepGet(entryName, type);
                if (deeper) return deeper;
            }
        }
        return undefined;
    }

    isEmpty(): boolean {
        return this.entries.length === 0;
    }

    copy() {
        const newEntries: Entry[] = [];
        for (const entry of this.entries) {
            if (entry.type === 'DIRECTORY')
                newEntries.push(entry.copy());
            else
                newEntries.push({ ...entry });
        }
        const newObject = new EntryDirectory(this);
        newObject.entries = newEntries;
        return newObject;
        // return new EntryDirectory({ ...this, entries: newEntries });
        // return structuredClone(this);
    }

    extract<T extends EntryTypes>(name: string | RegExp, type?: T): EntryTypeMapper[T] | undefined {
        const actualType = type ?? entryType.ANY;
        // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        const re = typeof name === 'string' ? new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : name;
        let foundEntry: EntryTypeMapper[T];
        let foundIndex = -1;
        for (let index = 0; index < this.entries.length; index++) {
            const entry = this.entries[index]!;
            if (!(re.test(entry.name) && (actualType === entryType.ANY || entry.type === actualType))) continue;

            foundIndex = index;
            foundEntry = entry as EntryTypeMapper[T];
            break;
        }
        if (foundIndex < 0) return undefined;

        this.entries.splice(foundIndex, 1);
        return foundEntry!;
    }
}


function isNodeJSError(error: any): error is NodeJS.ErrnoException {
    return (error?.code !== undefined);
}

type BaseScanOptions = {
    parentDir?: EntryDirectory;
    fileNamePattern?: RegExp,
    dirNamePattern?: RegExp;
};

type _DeepScanOptions = BaseScanOptions & {
    absPath: string;
};

type PathByComponents = {
    absolutePath: string;
    components?: undefined;
};

type PathByAbsolutePath = {
    absolutePath?: undefined;
    components: string[];
};

type DeepScanOptions = BaseScanOptions & (PathByAbsolutePath | PathByComponents);

function _deepScan({ parentDir, absPath: absolutePath, fileNamePattern, dirNamePattern }: _DeepScanOptions): Entry[] | undefined {
    if (!absolutePath) {
        console.log(`to scan a directory must provide a valid string path, provided path='${path}'`);
        return undefined;
    }
    let entrys: fs.Dirent[];
    try {
        entrys = fs.readdirSync(absolutePath, { withFileTypes: true });
    } catch (error) {
        if (!isNodeJSError(error)) throw error;
        switch (error.code) {
            case 'ENOENT':
                console.log(`Directory at '${absolutePath}' does not exist`);
                break;
            case 'EACCES':
                console.log(`Permission denied to read ${path}`);
                break;
            default:
                console.log(`Unhandled error, code: ${error.code}, message: ${error.message}`);
                break;
        }
        return undefined;
    }
    if (entrys.length === 0) return [];

    entrys = entrys.filter(entry =>
        entry.isDirectory() && (!dirNamePattern || dirNamePattern.test(entry.name)) ||
        entry.isFile() && (!fileNamePattern || fileNamePattern.test(entry.name))
    );

    const dirEntries: Entry[] = [];
    for (const entry of entrys) {
        const newEntry = {
            name: entry.name,
            absolutePath: posixJoin(absolutePath, entry.name),
            parent: parentDir
        };
        if (entry.isFile()) {
            dirEntries.push(new EntryFile(newEntry));
            continue;
        }
        if (!entry.isDirectory()) continue;

        const innerScan = _deepScan({ absPath: newEntry.absolutePath, fileNamePattern, dirNamePattern });
        if (!innerScan) continue;

        dirEntries.push(new EntryDirectory({
            ...newEntry,
            entries: innerScan
        }));
    }
    return dirEntries;
}

export function deepScan({ parentDir, absolutePath, components, fileNamePattern, dirNamePattern }: DeepScanOptions): EntryDirectory | undefined {
    if (!absolutePath && (!components || components.length === 0)) {
        console.log(`to scan a directory must provide a string path or components of a path, provided path='${path}' and components='${components}'`);
        return undefined;
    }

    const scanPath = absolutePath ?? components.join(path.posix.sep);
    const baseName = scanPath.split(path.posix.sep).at(-1)!;
    const innerScan = _deepScan({ absPath: scanPath, fileNamePattern, dirNamePattern });

    return new EntryDirectory({
        name: baseName,
        absolutePath: scanPath,
        parent: parentDir,
        entries: innerScan ?? []
    });
}


type ImportSuccess<I extends unknown = unknown> = {
    success: true,
    module: I;
};

export const importErrors = {
    pathError: `empty path`,
    unableToImport: `unable to import`,
    exeption: `exception thrown`,
    imcompatible: `imported module didn't match the schema`
} as const;

type ImportErrors = tu.Values<typeof importErrors>;

type ImportError<Message extends ImportErrors = ImportErrors> = {
    success: false,
    error: Message;
    exception?: Error | z.ZodError;
};

type ImportReturnType<I extends unknown> = Promise<ImportSuccess<I> | ImportError>;

export async function importModule<T extends unknown>(filePath: string): ImportReturnType<unknown>;
export async function importModule<T extends unknown>(filePath: string, schema: z.Schema): ImportReturnType<T>;
export async function importModule<T extends unknown>(filePath: string, schema?: z.Schema): ImportReturnType<T | unknown> {
    if (!filePath)
        return {
            success: false,
            error: importErrors.pathError
        };

    const rawModule = await import(filePath).catch(error => ({ _isError: true, error }));
    if (!rawModule)
        return {
            success: false,
            error: importErrors.unableToImport
        };
    if (rawModule._isError)
        return {
            success: false,
            error: importErrors.exeption,
            exception: rawModule.error as Error
        };

    if (!schema)
        return {
            success: true,
            module: rawModule as unknown
        };

    const parsedModule = schema.safeParse(rawModule);
    if (!parsedModule.success)
        return {
            success: false,
            error: importErrors.imcompatible,
            exception: parsedModule.error
        };

    return {
        success: true,
        module: rawModule as T
    };
}

export async function importModuleWithZod<T extends unknown>(filePath: string, schema: z.Schema): ImportReturnType<T> {
    if (!filePath)
        return {
            success: false,
            error: importErrors.pathError
        };

    const rawModule = await import(filePath).catch(error => ({ _isError: true, error }));
    if (!rawModule || rawModule._isError)
        return {
            success: false,
            error: !rawModule ? importErrors.unableToImport : importErrors.exeption,
            exception: rawModule?.error as Error
        };

    const parsedModule = schema.safeParse(rawModule);
    if (!parsedModule.success)
        return {
            success: false,
            error: importErrors.imcompatible,
            exception: parsedModule.error
        };

    return {
        success: true,
        module: rawModule as T
    };
}


type DeepListDirOptions = {
    type: 'any' | 'dir' | 'file';
    fileNamePattern?: RegExp,
    dirNamePattern?: RegExp;
} & (PathByAbsolutePath | PathByComponents);

export function deepList({ type = 'any', absolutePath, components, fileNamePattern, dirNamePattern }: DeepListDirOptions): string[] | undefined {
    if (absolutePath === '' || components?.length === 0) {
        console.log(`to scan a directory must provide a string path or components of a path, provided path='${path}' and components='${components}'`);
        return undefined;
    }

    const scanPath = absolutePath ?? components!.join(path.posix.sep);
    try {
        let entrys = fs.readdirSync(scanPath, { withFileTypes: true });
        if (entrys.length === 0) return [];

        entrys = entrys.filter(entry =>
            entry.isDirectory() && (!dirNamePattern || dirNamePattern.test(entry.name)) ||
            entry.isFile() && (!fileNamePattern || fileNamePattern.test(entry.name))
        );

        const deeperEntrys: string[] = [];
        for (const entry of entrys) {
            if (!entry.isDirectory()) continue;

            const innerScan = deepList({ type, components: [scanPath, entry.name], fileNamePattern, dirNamePattern });
            if (!innerScan) continue;

            deeperEntrys.push(...innerScan.map(pathTail => path.posix.join(entry.name, pathTail)));
        }

        if (type === 'file')
            entrys = entrys.filter(entry => entry.isFile());
        if (type === 'dir')
            entrys = entrys.filter(entry => entry.isDirectory());

        return [...entrys.map(fileEntry => fileEntry.name), ...deeperEntrys];
    } catch (error) {
        if (!isNodeJSError(error)) throw error;
        switch (error.code) {
            case 'ENOENT':
                console.log(`Directory at '${absolutePath}' not exist`);
                break;
            case 'EACCES':
                console.log(`Permission denied to read ${path}`);
                break;
            default:
                console.log(`Unhandled error, code: ${error.code}, message: ${error.message}`);
                break;
        }
        return undefined;
    }
}
