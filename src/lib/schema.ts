import { APIEmbed } from 'discord.js';
import { z } from 'zod';


type EmbedTypeToValidate = APIEmbed;

const embedFooterSchema = z.object({
    text: z.string().min(1).max(2048),
    icon_url: z.optional(z.string()),
    proxy_icon_url: z.optional(z.string()),
});

const embedMediaSchema = z.object({
    url: z.string(),
    proxy_url: z.optional(z.string()),
    height: z.optional(z.number()),
    width: z.optional(z.number()),
});

const embedImageSchema = embedMediaSchema;
const embedThumbnailSchema = embedMediaSchema;
const embedVideoSchema = embedMediaSchema;

export const embedSchema = z.object({
    title: z.optional(z.string().min(1).max(256)),
    description: z.optional(z.string().min(1).max(4096)),
    url: z.optional(z.string()),
    timestamp: z.optional(z.string()),
    color: z.optional(z.number().int()),
    footer: z.optional(embedFooterSchema),
    image: z.optional(embedImageSchema),
    thumbnail: z.optional(embedThumbnailSchema),
    video: z.optional(embedVideoSchema),
    provider: z.optional(z.object({
        name: z.optional(z.string()),
        utl: z.optional(z.string())
    })),
    author: z.optional(z.object({
        name: z.string().min(1).max(256),
        url: z.optional(z.string()),
        icon_url: z.optional(z.string()),
        proxy_icon_url: z.optional(z.string()),
    })),
    fields: z.optional(z.array(z.object({
        name: z.string().min(1).max(256),
        value: z.string().min(1).max(1024),
        inline: z.optional(z.boolean()),
    })))
});
// type test = z.infer<typeof embedSchema>;
