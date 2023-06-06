import { ApplicationCommandDataResolvable, SlashCommandBuilder } from 'discord.js';
import { z } from 'zod';
import { INTERACTION } from '../../globalConfigs';
import { f, logWithTime } from '../../lib';
import { ExtendedClient } from '../client';
import { fsConfig } from './config';
import { CommandCallbackArgs, SubCommandGroupModule, CommandPermissions, MultiFileCommandDefinition, MultiFileCommandModule, GenericSubCommandDefinition, GroupSetupDefinition, GroupSetupModule, SingleFileCommandDefinition, SingleFileCommandModule, GenericSubCommandModule, SubCommandGroupDefinition, SlashCommandTrait } from './type';


const singleFileCommandSchema = z.object({
    default: z
        .function()
        .returns(z.object({
            data: z.object({}),
            permissions: z.optional(z.array(z.bigint())),
            execute:
                z.function(
                    z.tuple([z.object({
                        client: z.object({}),
                        interaction: z.object({})
                    })]),
                    z.promise(z.unknown())
                ),
        })),
});
// type test = z.infer<typeof singleFileCommandSchema>;

const multiFileCommandSchema = z.object({
    default: z
        .function()
        .returns(z.object({
            data: z.object({}),
            permissions: z.optional(z.array(z.bigint())),
            execute: z.optional(
                z.function(
                    z.tuple([z.object({
                        client: z.object({}),
                        interaction: z.object({})
                    })]),
                    z.promise(z.unknown())
                )
            ),
            subCommandArgs: z.optional(
                z.tuple([]).or(z.tuple([z.unknown()]).rest(z.unknown()))
            )
        })),
});
// type test = z.infer<typeof directoryCommandSchema>;

const subCommandGroupSchema = z.object({
    default: z
        .function()
        .returns(z.object({ data: z.object({}), })),
});
// type test = z.infer<typeof subCommandGroupSchema>;

const subCommandSchema = z.object({
    default: z
        .function()
        .returns(z.object({
            data: z.object({}),
            execute: z.optional(
                z.function(
                    z.tuple([z.object({
                        client: z.object({}),
                        interaction: z.object({})
                    })]),
                    z.promise(z.unknown())
                )
            ),
        })),
});
// type test = z.infer<typeof subCommandSchema>;

const groupSetupSchema = z.object({
    config: z.object({
        categories: z.optional(z.array(z.string())),
        permissions: z.optional(z.array(z.bigint())),
    }),
});
// type test = z.infer<typeof commandSetupModuleSchema>;


async function proccessReservedEntry(entry: f.EntryDirectory | f.EntryFile, accumulatedSetup: AccumulatedSetup) {
    // logWithTime(`reserved entry not processed, entry:\n${JSON.stringify(entry, null, 2)}\n`);
}


type RawSubCommand = {
    file: f.EntryFile;
    module: GenericSubCommandModule;
};

type RawSubCommandGroup = {
    file: f.EntryFile;
    module: SubCommandGroupModule;
    subCommands: RawSubCommand[];
};

async function processSubCommandGroup(directory: f.EntryDirectory): Promise<RawSubCommandGroup | undefined> {
    const setupEntry = directory.extract(fsConfig.subCommandGroupSetup.re, fsConfig.subCommandGroupSetup.type);
    if (!setupEntry) return undefined;

    const setupModule = await f.importModule<SubCommandGroupModule>(setupEntry.absolutePath, subCommandGroupSchema);
    if (!setupModule.success) {
        console.log(`import error: ${setupModule.error}\n  path > ${setupEntry.absolutePath}\n  exception? > ${setupModule.exception?.cause ?? setupModule.exception?.stack}`);
        return undefined;
    }

    const subCommands: RawSubCommand[] = [];
    for (const entry of directory.entries) {
        if (
            fsConfig.skiped.re.test(entry.name) ||
            fsConfig.reserved.re.test(entry.name) ||
            entry.type === f.entryType.DIRECTORY
        ) {
            continue;
        }

        const subCommandModule = await f.importModule<GenericSubCommandModule>(entry.absolutePath, subCommandSchema);
        if (!subCommandModule.success) {
            console.log(`import error: ${subCommandModule.error}\n  path > ${entry.absolutePath}\n  exception? > ${subCommandModule.exception?.cause ?? subCommandModule.exception?.stack}`);
            continue;
        }

        subCommands.push({ file: entry, module: subCommandModule.module });
    }

    if (subCommands.length === 0) {
        console.log(`skiped empty directory while loading commands at '${directory.absolutePath}'`);
        return undefined;
    }

    return {
        file: setupEntry,
        module: setupModule.module,
        subCommands: subCommands
    };
}

type AccumulatedSetup = {
    categories: Set<string>;
    permission: bigint;
};

type GroupSetup = {
    categories?: Set<string>;
    permission?: bigint;
};

class SubCommand {
    file: f.EntryFile;
    module: GenericSubCommandModule;
    value: ReturnType<GenericSubCommandDefinition>;
    execute: ReturnType<GenericSubCommandDefinition>['execute'];

    constructor(file: f.EntryFile, module: GenericSubCommandModule, args?: unknown[]) {
        this.file = file;
        this.module = module;
        this.value = args ? module.default(...args) : module.default();
        this.execute = this.value.execute;
    }

    get data() {
        return this.value.data;
    }
}

class SubCommandGroup {
    file: f.EntryFile;
    module: SubCommandGroupModule;
    value: ReturnType<SubCommandGroupDefinition>;
    subCommands: SubCommand[];

    constructor(file: f.EntryFile, module: SubCommandGroupModule) {
        this.file = file;
        this.module = module;
        this.value = module.default();
        this.subCommands = [];
    }

    get data() {
        return this.value.data;
    }

    addSubCommand(subCommand: SubCommand) {
        this.subCommands.push(subCommand);
        this.data.addSubcommand(subCommand.data);
    }
}

function reducePermissions(accumulated?: bigint, news?: CommandPermissions) {
    let reduced = accumulated ?? 0n;
    if (news) {
        for (const permission of news)
            reduced |= permission;
    }
    return reduced !== 0n ? reduced : undefined;
}


class MultiFileCommand implements SlashCommandTrait {
    setupFile: f.EntryFile;
    module: MultiFileCommandModule;
    value: ReturnType<MultiFileCommandDefinition>;
    #executionMap: Map<string, SubCommand>;

    constructor(setupFile: f.EntryFile, module: MultiFileCommandModule, subCommandsGroups: RawSubCommandGroup[], subCommands: RawSubCommand[], config?: GroupSetup) {
        this.setupFile = setupFile;
        this.module = module;
        this.value = module.default();
        this.#executionMap = new Map();

        for (const rawSubCommandGroup of subCommandsGroups) {
            const subCommandGroup = new SubCommandGroup(rawSubCommandGroup.file, rawSubCommandGroup.module);
            for (const rawSubCommand of rawSubCommandGroup.subCommands) {
                const subCommand = new SubCommand(rawSubCommand.file, rawSubCommand.module, this.value.subCommandsArgs);
                subCommandGroup.addSubCommand(subCommand);
                this.#executionMap.set(`${subCommandGroup.data.name}.${subCommand.data.name}`, subCommand);
            }
            this.value.data.addSubcommandGroup(subCommandGroup.data);
        }

        for (const rawSubCommand of subCommands) {
            const subCommand = new SubCommand(rawSubCommand.file, rawSubCommand.module, this.value.subCommandsArgs);
            this.value.data.addSubcommand(subCommand.data);
            this.#executionMap.set(subCommand.data.name, subCommand);
        }

        this.value.data.setDefaultMemberPermissions(reducePermissions(config?.permission, this.value.permissions));
    }

    get data() {
        return this.value.data;
    }

    async execute(arg: CommandCallbackArgs): Promise<unknown> {
        const groupName = arg.interaction.options.getSubcommandGroup();
        const subCommandName = arg.interaction.options.getSubcommand();
        const subCommand = this.#executionMap.get(groupName ? `${groupName}.${subCommandName}` : subCommandName)!;

        if (!this.value.execute) {
            return subCommand.execute(arg);
        }

        const preExecutionResult = await this.value.execute(arg);
        if (!preExecutionResult)
            throw new Error('Error when handling command');

        return subCommand.execute(arg);
    }
}

async function proccesMultiFileCommand(directory: f.EntryDirectory, accumulatedSetup: GroupSetup): Promise<MultiFileCommand | undefined> {
    const setupEntry = directory.extract(fsConfig.commandSetup.re, fsConfig.commandSetup.type);
    if (!setupEntry) return undefined;

    const setupModule = await f.importModule<MultiFileCommandModule>(setupEntry.absolutePath, multiFileCommandSchema);
    if (!setupModule.success) {
        console.log(`import error: ${setupModule.error}\n  path > ${setupEntry.absolutePath}\n  exception? > ${setupModule.exception?.cause ?? setupModule.exception?.stack}`);
        return undefined;
    }

    const subCommandsGroups: RawSubCommandGroup[] = [];
    const subCommands: RawSubCommand[] = [];
    for (const entry of directory.entries) {
        if (fsConfig.skiped.re.test(entry.name)) {
            continue;
        }

        if (entry.type === f.entryType.DIRECTORY) {
            if (!fsConfig.subCommandGroup.re.test(entry.name)) {
                continue;
            }

            const result = await processSubCommandGroup(entry);
            if (!result) continue;

            subCommandsGroups.push(result);
        }

        const subCommandModule = await f.importModule<GenericSubCommandModule>(entry.absolutePath, subCommandSchema);
        if (!subCommandModule.success) {
            console.log(`import error: ${subCommandModule.error}\n  path > ${entry.absolutePath}\n  exception? > ${subCommandModule.exception?.cause ?? subCommandModule.exception?.stack}`);
            continue;
        }

        subCommands.push({ file: entry as f.EntryFile, module: subCommandModule.module });
    }

    if (subCommandsGroups.length === 0 && subCommands.length === 0) {
        console.log(`skiped empty directory while loading commands at '${directory.absolutePath}'`);
        return undefined;
    }

    return new MultiFileCommand(setupEntry, setupModule.module, subCommandsGroups, subCommands, accumulatedSetup);
}


class SingleFileCommand implements SlashCommandTrait {
    file: f.EntryFile;
    module: SingleFileCommandModule;
    value: ReturnType<SingleFileCommandDefinition>;
    execute: ReturnType<SingleFileCommandDefinition>['execute'];

    constructor(file: f.EntryFile, module: SingleFileCommandModule, config?: GroupSetup) {
        this.file = file;
        this.module = module;
        this.value = module.default();

        const newPermission = reducePermissions(config?.permission, this.value.permissions);

        if (this.value.data instanceof SlashCommandBuilder) {
            this.value.data.setDefaultMemberPermissions(newPermission);
        }

        this.execute = this.value.execute;
    }

    get data() {
        return this.value.data;
    }
}

type Command = SingleFileCommand | MultiFileCommand;

class Group {
    file?: f.EntryFile;
    module?: GroupSetupModule;
    value: GroupSetupDefinition;
    innerGroups: Group[];
    commands: Command[];

    constructor(file: f.EntryFile | undefined, module: GroupSetupModule | undefined, value: GroupSetupDefinition, innerGroups: Group[], commands: Command[]) {
        this.file = file;
        this.module = module;
        this.value = value;
        this.innerGroups = innerGroups;
        this.commands = commands;
    }

    flattenCommands() {
        const commands = this.commands.slice();
        for (const group of this.innerGroups) {
            for (const command of group.flattenCommands()) {
                commands.push(command);
            }
        }
        return commands;
    }
}

const defaultGroupSetup = {
    categories: new Set(),
    permission: 0n
} as const satisfies GroupSetup;

async function processDirectoryGroup(directory: f.EntryDirectory, accumulatedSetup: AccumulatedSetup) {
    const setupEntry = directory.extract(fsConfig.groupSetup.re, fsConfig.groupSetup.type);

    let setupModule: GroupSetupDefinition = defaultGroupSetup;
    let actualSetup = accumulatedSetup;

    if (setupEntry) {
        const setup = await f.importModule<GroupSetupModule>(setupEntry.absolutePath, groupSetupSchema);
        if (setup.success) {
            setupModule = setup.module.config;
            actualSetup = {
                categories: new Set(...accumulatedSetup.categories, ...setupModule.categories ?? []),
                permission: setupModule.permissions?.reduce((prev, crr) => prev | crr, accumulatedSetup.permission) ?? accumulatedSetup.permission
            };
        }
    }

    const innerGroups: Group[] = [];
    const commands: Command[] = [];
    for (const entry of directory.entries) {
        if (fsConfig.skiped.re.test(entry.name)) {
            continue;
        }

        if (fsConfig.reserved.re.test(entry.name)) {
            proccessReservedEntry(entry, actualSetup);
            continue;
        }

        if (entry.type === f.entryType.DIRECTORY) {
            if (fsConfig.group.re.test(entry.name)) {
                const result = await processDirectoryGroup(entry, actualSetup);
                if (!result) continue;

                innerGroups.push(result);
                continue;
            }

            const result = await proccesMultiFileCommand(entry, actualSetup);
            if (!result) continue;

            commands.push(result);
            continue;
        }

        const commandModule = await f.importModule<SingleFileCommandModule>(entry.absolutePath, singleFileCommandSchema);
        if (!commandModule.success) {
            console.log(`import error: ${commandModule.error}\n  path > ${entry.absolutePath}\n  exception? > ${commandModule.exception?.cause ?? commandModule.exception?.stack}`);
            continue;
        }

        commands.push(new SingleFileCommand(entry, commandModule.module, actualSetup));
    }

    if (innerGroups.length === 0 && commands.length === 0) {
        console.log(`skiped empty directory while loading commands at '${directory.absolutePath}'`);
        return undefined;
    }

    const name = directory.name.slice(1, directory.name.length - 1);
    return new Group(setupEntry, setupModule as any, actualSetup, innerGroups, commands);
};


async function loadGroupSetup(directory: f.EntryDirectory, previus?: AccumulatedSetup) {
    const setup = { ...(previus ?? defaultGroupSetup) };
    const setupEntry = directory.extract(fsConfig.groupSetup.re, fsConfig.groupSetup.type);
    if (!setupEntry) return { setup };

    const result = await f.importModule<GroupSetupModule>(setupEntry.absolutePath, groupSetupSchema);
    if (!result.success) return { setup };

    const module = result.module;
    if (module.config.categories)
        setup.categories = new Set(...setup.categories, module.config.categories);

    if (module.config.permissions)
        for (const permission of module.config.permissions)
            setup.permission |= permission;

    return { setup, setupEntry, setupModule: module };
}

async function processCommandsDirectory(baseDir: f.EntryDirectory) {
    const baseDirCopy = baseDir.copy();
    const { setup, setupEntry, setupModule } = await loadGroupSetup(baseDirCopy);

    const innerGroups: Group[] = [];
    const commands: Command[] = [];
    for (const entry of baseDirCopy.entries) {
        if (fsConfig.skiped.re.test(entry.name))
            continue;

        if (fsConfig.reserved.re.test(entry.name)) {
            proccessReservedEntry(entry, setup);
            continue;
        }

        if (entry.type === f.entryType.DIRECTORY) {
            if (fsConfig.group.re.test(entry.name)) {
                const result = await processDirectoryGroup(entry, setup);
                if (!result) continue;

                innerGroups.push(result);
                continue;
            }

            const result = await proccesMultiFileCommand(entry, setup);
            if (!result) continue;

            commands.push(result);
            continue;
        }

        const commandModule = await f.importModule<SingleFileCommandModule>(entry.absolutePath, singleFileCommandSchema);
        if (!commandModule.success) {
            console.log(`import error: ${commandModule.error}\n  path > ${entry.absolutePath}\n  exception? > ${commandModule.exception?.cause ?? commandModule.exception?.stack}`);
            continue;
        }

        commands.push(new SingleFileCommand(entry, commandModule.module, setup));
    }

    if (innerGroups.length === 0 && commands.length === 0) {
        console.log(`skiped empty directory while loading commands at '${baseDirCopy.absolutePath}'`);
        return undefined;
    }

    const resultGroup = new Group(setupEntry, setupModule!, setup, innerGroups, commands);

    return {
        commandsDirectory: baseDir,
        result: resultGroup,
        flattenedCommands: resultGroup.flattenCommands()
    };
}


async function loadCommands() {
    const COMMANDS_ABS_DIR = f.posixJoin(
        ...f.splitEntrys(__dirname), '..', '..', INTERACTION.COMMANDS.path
    );
    const commandsDir = f.deepScan({
        absolutePath: COMMANDS_ABS_DIR,
        fileNamePattern: fsConfig.ignored.file.reNegated,
        dirNamePattern: fsConfig.ignored.dir.reNegated,
    });
    if (!commandsDir || commandsDir.isEmpty()) return undefined;

    const commands = await processCommandsDirectory(commandsDir);

    return commands;
}

export async function registerCommands(client: ExtendedClient): Promise<void> {
    const loadedCommands = await loadCommands();

    if (!loadedCommands) {
        logWithTime(`Failed to load any command`);
        return;
    }

    const commandsData: ApplicationCommandDataResolvable[] = [];
    const commandsNames: string[] = [];

    for (const command of loadedCommands.flattenedCommands) {
        commandsData.push(command.data);
        commandsNames.push(command.data.name);
        client.commands.set(command.data.name, command);
    }

    client.on('ready', async () => {
        if (process.env.guildId) {
            await client.guilds.cache.get(process.env.guildId)?.commands.set(commandsData);
        }
        else {
            await client.application?.commands.set(commandsData);
        }

        logWithTime('Commands Registered:', commandsNames);
    });
}
