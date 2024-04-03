import { BaseMessageOptions, ChannelType, ComponentType, Role, SlashCommandSubcommandBuilder, TextBasedChannel, codeBlock } from 'discord.js';
import { TYPES, dynamicRegisterSelectMenu } from '../../../core/selectMenu/selectMenu.js';
import { schema } from '../../../lib/index.js';
import { log } from '../../../lib/logging.js';
import { SubCommandDefinition } from './+command.js';


const MAX_ROL_OPTIONS = 10;


export default (() => {
    const commandData = new SlashCommandSubcommandBuilder()
        .setName('select-role')
        .setDescription('Create a menu to select especific roles')
        .addStringOption(opt => opt
            .setRequired(true)
            .setName('id')
            .setDescription('ID to identify the menu regex=\\w(\\w)+')
        )
        .addChannelOption(opt => opt
            .setRequired(true)
            .setName('channel')
            .setDescription('Channel to send the menu')
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(opt => opt
            .setName('description')
            .setDescription('Optional description on top of the menu')
            .setMinLength(4)
            .setMaxLength(256)
        )
        .addAttachmentOption(opt => opt
            .setName('embed')
            .setDescription('Optional embed on top of the menu')
        )
        .addBooleanOption(opt => opt
            .setName('unlimited')
            .setDescription('Allow unlimited roles to be selected')
        )
        .addBooleanOption(opt => opt
            .setName('empty')
            .setDescription('Allow empty selection')
        );

    for (let i = 0; i < MAX_ROL_OPTIONS; i++) {
        commandData.addRoleOption(opt => opt
            .setName(`rol-${i + 1}`)
            .setDescription(`Rol option ${i + 1}`)
        );
    }

    return {
        data: commandData,
        async execute({ client, interaction }) {
            await interaction.deferReply({
                ephemeral: true,
                fetchReply: true
            });

            const opt = interaction.options;
            const id = opt.getString('id', true);
            const channel = opt.getChannel('channel', true) as TextBasedChannel;
            const description = opt.getString('description');
            // https://glitchii.github.io/embedbuilder/
            const embed = opt.getAttachment('embed');
            const unlimited = opt.getBoolean('unlimited') ?? false;
            const empty = opt.getBoolean('empty') ?? false;

            if (!description && !embed) {
                return interaction.editReply({
                    content: `Must provide a description or embed file (json format) to create the menu`,
                });
            }

            function existId(roles: Role[], id: string) {
                for (const rol of roles) if (rol.id === id) return true;
                return false;
            }
            const duplicatedRoles: Set<string> = new Set();
            const roles: Role[] = [];
            for (let i = 0; i < MAX_ROL_OPTIONS; i++) {
                const newRol = opt.getRole(`rol-${i + 1}`);
                if (!newRol) {
                    continue;
                }
                if (existId(roles, newRol.id)) {
                    duplicatedRoles.add(newRol.name);
                    continue;
                }
                roles.push(newRol);
            }

            if (roles.length === 0) {
                return interaction.editReply({
                    content: `Must provide at least 1 rol to create the menu`,
                });
            }
            if (duplicatedRoles.size !== 0) {
                let roles = '';
                for (const rol of duplicatedRoles) {
                    roles += ` ${rol}`;
                }
                return interaction.editReply({
                    content: `Must provide unique roles, repeated roles:${roles}`,
                });
            }

            const customId = `${TYPES.autoRol}_${id}` as const;

            for (const selectMenu of client.selectMenus.values()) {
                if (selectMenu.data.customId === customId) {
                    return interaction.editReply({
                        content: `id='${id}' is already used in a role select menu`,
                    });
                }
            }

            const messageData: BaseMessageOptions = {};

            if (description) {
                messageData.content = description;
            }

            if (embed) {
                const json = await fetch(embed.url).then(f => f.json()).catch(log.error);
                const parsed = schema.embedSchema.safeParse(json);
                if (!parsed.success) {
                    return interaction.editReply({
                        content: `provided embed is invalid\nerror: ${parsed.error}`,
                    });
                }
                messageData.embeds = [parsed.data];
            }

            const selectMenuMessage = await channel.send({
                ...messageData,
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [{
                            type: ComponentType.StringSelect,
                            custom_id: customId,
                            placeholder: 'Sin seleccionar...',
                            options: roles.map(rol => ({
                                label: rol.name,
                                value: rol.id,
                            })),
                            min_values: empty ? 0 : 1,
                            max_values: unlimited ? roles.length : 1,
                        }]
                    }
                ]
            });

            const simplifiedRoles: {
                guild: string,
                id: string,
                name: string,
                color: number;
            }[] = [];
            for (const rol of roles) {
                simplifiedRoles.push({
                    guild: rol.guild.id,
                    id: rol.id,
                    name: rol.name,
                    color: rol.color
                });
            }
            const data = {
                type: TYPES.autoRol,
                name: id,
                customId: customId,
                channelId: channel.id,
                messageId: selectMenuMessage.id,
                createdAt: interaction.createdAt,
                roles: simplifiedRoles,
                description: messageData.content,
                embed: messageData.embeds?.[0],
            };

            const registered = await dynamicRegisterSelectMenu(client, data);

            if (!registered && selectMenuMessage) {
                await selectMenuMessage.delete();
            }

            return interaction.editReply({
                content: registered && selectMenuMessage ?
                    `Succesfully created the menu\n${codeBlock(JSON.stringify(data, null, 2))}` :
                    `Failed to register the menu`,
            });
        },
    };
}) satisfies SubCommandDefinition;
