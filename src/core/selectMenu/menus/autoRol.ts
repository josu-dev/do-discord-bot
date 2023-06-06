import { z } from 'zod';
import { APIEmbed, Role } from 'discord.js';
import { embedSchema } from '../../../lib/schema';
import { baseConfigSchema, customIdSchema } from './shared';
import { DefaultSelectMenuDefinition, ExtendBaseConfig } from '../type';


export const TYPE_ID = `PICK_ROLES`;


export type AutoRolConfig<N extends string = string> = ExtendBaseConfig<{
    type: typeof TYPE_ID;
    name: N;
    customId: `${typeof TYPE_ID}_${N}`;
    roles: (Pick<Role, 'id' | 'name' | 'color'> & { guild: string; })[];
    title?: string;
    description?: string;
    embed?: APIEmbed;
}>;


export const configSchema = baseConfigSchema.extend({
    type: z.literal(TYPE_ID),
    customId: customIdSchema(TYPE_ID),
    roles: z.array(z.object({
        id: z.string(),
        name: z.string(),
        guild: z.string(),
        color: z.number().int()
    })),
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    embed: z.optional(embedSchema),
});


// export const validateConfig = configValidatorFactory<AutoRolConfig>(configSchema);


export default ((config) => {
    return {
        data: { ...config },
        async execute({ interaction }) {
            const rolesToRemove: string[] = [];
            for (const rol of config.roles) {
                let finded = false;
                for (const selectedRole of interaction.values) {
                    if (selectedRole === rol.id) {
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    rolesToRemove.push(rol.id);
                }
            }

            await interaction.member.roles.remove(rolesToRemove);
            await interaction.member.roles.add(interaction.values);
            await interaction.reply({
                content: `Se han actualizado tus roles`,
                ephemeral: true,
                fetchReply: true,
            });

            setTimeout(
                async () => {
                    await interaction.deleteReply().catch(e => console.log(e));
                },
                7.5 * 1000
            );
        }
    };
}) satisfies DefaultSelectMenuDefinition<AutoRolConfig>;
