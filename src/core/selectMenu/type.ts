import { AnySelectMenuInteraction } from 'discord.js';
import { z } from 'zod';
import { MutableRecord, OptionalField } from '../../lib/utilType.js';
import { ExtendedClient } from '../client.js';


type BaseConfig = {
    readonly channelId: string;
    readonly messageId: string;
    readonly createdAt: Date;
    readonly cachePath: string;
};

type RequiredConfig<Type extends string = string, Name extends string = string> = {
    readonly type: Type;
    readonly name: Name;
    readonly customId: `${Type}_${Name}`;
};

export type ExtendBaseConfig<T extends RequiredConfig> = BaseConfig & T;

export type CompleteBaseConfig = BaseConfig & RequiredConfig;


export type CallbackArgs = [{ client: ExtendedClient, interaction: AnySelectMenuInteraction<'cached'>; }];

export type Callback = (...args: CallbackArgs) => Promise<unknown>;

export type DefaultSelectMenuDefinition<Config extends CompleteBaseConfig, Data extends Config = Config> = (config: Config) => {
    readonly data: Data;
    execute(...args: CallbackArgs): Promise<unknown>;
};

export type DefaultSelectMenuModule<Config extends CompleteBaseConfig = CompleteBaseConfig, Schema extends z.Schema<Config> = z.Schema<Config>> = {
    TYPE_ID: Config['type'];
    configSchema: Schema;
    validateConfig?(data: unknown): ReturnType<Schema['safeParse']>;
    default: DefaultSelectMenuDefinition<Config>;
};

export type SelectMenuTrait = {
    readonly data: CompleteBaseConfig;
    execute(...args: CallbackArgs): Promise<unknown>;
};

export type BaseDynamicConfig = MutableRecord<OptionalField<BaseConfig, 'cachePath'> & RequiredConfig>;

export type DynamicConfig<T extends Record<string, any> = Record<string, any>> = BaseDynamicConfig & T;
