import { z } from 'zod';


export const baseConfigSchema = z.object({
    name: z.string(),
    cachePath: z.string(),
    channelId: z.string(),
    messageId: z.string(),
    createdAt: z.date(),
});

export function customIdSchema<T extends string>(typeId: T) {
    const re = new RegExp(String.raw`^${typeId}_\w+$`);
    return z.custom<`${typeof typeId}_${string}`>((val) => typeof val === 'string' && re.test(val as string));
}

export type ParseConfigReturnType<D extends Record<string, any>, E extends z.ZodError = z.ZodError> = (config: unknown) => {
    readonly success: true,
    readonly data: D;
} | {
    readonly success: false,
    readonly error: E;
};

export function configValidatorFactory<VR extends Record<string, any>, S extends z.Schema = z.Schema>(configSchema: S): ParseConfigReturnType<VR> {
    return (config: unknown) => {
        const cache = configSchema.safeParse(config);
        if (!cache.success) {
            return cache;
        }
        return {
            success: true,
            data: config as VR
        };
    };
}

