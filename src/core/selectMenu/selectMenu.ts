import fs from 'fs';
import { f, logWithTime } from '../../lib';
import { readJSON, writeJSON } from '../../lib/file';
import { INTERACTION } from '../../botConfig';
import { ExtendedClient } from '../client';
import { CACHE_NAME_SUFFIX, config } from './config';
import { DefaultSelectMenuModule, DynamicConfig, SelectMenuTrait } from './type';

import { autoRol } from './menus';


const menuMap = {
    [autoRol.TYPE_ID]: autoRol
} as const;


export const TYPES = {
    autoRol: autoRol.TYPE_ID,
} as const;


function hasTypeField(data: unknown): data is ({ type: string; } & Record<string, any>) {
    return typeof data === 'object' && data !== null && 'type' in data &&
        typeof data.type === 'string' && data.type !== '';
}

function createSelectMenu(data: unknown) {
    if (!hasTypeField(data)) {
        return undefined;
    }
    if (!(data.type in menuMap)) {
        console.log(`Error at creating select menu, type='${data.type}' is invalid`);
        return undefined;
    }

    const menuModule = (menuMap as any as Record<string, DefaultSelectMenuModule>)[data.type]!;

    const validator = menuModule.validateConfig ?? menuModule.configSchema.safeParse;

    if ('createdAt' in data && typeof data.createdAt === 'string') {
        data.createdAt = new Date(data.createdAt);
    }
    const config = validator(data);

    if (!config.success) {
        console.log(`Error at validating menu config, error:${config.error}`);
        return undefined;
    }

    const selectMenu = menuModule.default(config.data);
    return selectMenu;
}

async function processMenusDirectory(baseDir: f.EntryDirectory) {
    const baseDirCopy = baseDir.copy();
    const generatedEntry = baseDirCopy.extract(config.generated.literalName, config.generated.type);
    if (!generatedEntry) return undefined;

    const menus: SelectMenuTrait[] = [];
    for (const entry of generatedEntry.entries) {
        if (
            config.skip.re.test(entry.name) ||
            config.reserved.re.test(entry.name) ||
            entry.type === f.entryType.DIRECTORY
        ) {
            continue;
        }

        if (!config.cache.re.test(entry.name)) {
            continue;
        }

        const rawJSON = readJSON(entry.absolutePath);
        const selectMenu = createSelectMenu(rawJSON);

        if (!selectMenu) {
            continue;
        }

        menus.push(selectMenu);
    }

    if (menus.length === 0) {
        return undefined;
    }

    return {
        commandsDirectory: baseDir,
        result: menus,
    };
}


async function loadMenus() {
    const MENUS_ABS_DIR = f.posixJoin(
        ...f.splitEntrys(__dirname), '..', '..', INTERACTION.SELECT_MENUS.path
    );
    const menusDir = f.deepScan({
        absolutePath: MENUS_ABS_DIR,
        fileNamePattern: config.ignored.reNegated,
        dirNamePattern: config.ignoredDir.reNegated
    });
    if (!menusDir || menusDir.isEmpty()) return undefined;

    const menus = await processMenusDirectory(menusDir);

    return menus;
}


export async function registerSelectMenus(client: ExtendedClient): Promise<void> {
    client.on('messageDelete', async (message) => {
        const selectMenu = client.selectMenus.get(message.id);
        if (!selectMenu) {
            return;
        }

        fs.unlink(
            selectMenu.data.cachePath,
            (error) => {
                if (error || !client.selectMenus.delete(selectMenu.data.messageId)) {
                    logWithTime(`error ocurred while trying to unregister a select menu\n  customId > ${selectMenu.data.customId}\n  error > ${error}`);
                    return;
                }

                logWithTime(`successfully unregistered select menu with customId='${selectMenu.data.customId}'`);
            }
        );
    });

    const loadedSelectMenus = await loadMenus();

    if (!loadedSelectMenus) {
        logWithTime(`No menus has been loaded`);
        return;
    }

    for (const selectMenu of loadedSelectMenus.result) {
        client.selectMenus.set(selectMenu.data.messageId, selectMenu);
    }
}


export async function dynamicRegisterSelectMenu<T extends DynamicConfig>(client: ExtendedClient, data: T) {
    const GENERATED_ABS_DIR = f.posixJoin(
        ...f.splitEntrys(__dirname), '..', '..', INTERACTION.SELECT_MENUS.path, config.generated.literalName, data.customId + CACHE_NAME_SUFFIX
    );
    data.cachePath = GENERATED_ABS_DIR;

    const selectMenu = createSelectMenu(data);
    if (!selectMenu) {
        return undefined;
    }

    if (!writeJSON(GENERATED_ABS_DIR, data as {})) {
        return undefined;
    }

    client.selectMenus.set(selectMenu.data.messageId, selectMenu);
    return true;
}
