import { channelMention, ChannelType, Collection, ForumLayoutType, PermissionFlagsBits, SlashCommandBuilder, TextChannel, ThreadAutoArchiveDuration } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
import { REPLY } from '../../botConfig';
import { log } from '../../lib/logging';


const GUILD_CATEGORY = [ChannelType.GuildCategory] satisfies [ChannelType];

const commandData = new SlashCommandBuilder()
    .setName('category-to-forum')
    .setNameLocalization(`es-ES`, 'categoria-a-foro')
    .setDescription(`Moves all channels from a category to a new forum where each channel is a post`)
    .setDescriptionLocalization(`es-ES`, `Mueve todos los canales de una categoría a un nuevo foro donde cada canal es un post`)
    .addChannelOption(option => option
        .setName('from')
        .setDescription('The category to move')
        .setDescriptionLocalization(`es-ES`, `La categoría que mover`)
        .setRequired(true)
        .addChannelTypes(...GUILD_CATEGORY)
    )
    .addChannelOption(option => option
        .setName('to')
        .setDescription('The category where to move')
        .setDescriptionLocalization(`es-ES`, `La categoría donde mover`)
        .setRequired(true)
        .addChannelTypes(...GUILD_CATEGORY)
    )
    .addBooleanOption(option => option
        .setName('delete')
        .setDescription('Delete the original category, default false')
        .setDescriptionLocalization(`es-ES`, `Borrar la categoría original, por defecto falso`)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            await interaction.deferReply({ ephemeral: true, fetchReply: true });

            const destCategory = interaction.options.getChannel('to', true, GUILD_CATEGORY);
            if (!destCategory.permissionsFor(interaction.guild.roles.everyone).has(PermissionFlagsBits.ViewChannel)) {
                return interaction.editReply(`Destination category is not viewable by everyone`);
            }

            const fromCategory = interaction.options.getChannel('from', true, GUILD_CATEGORY);
            if (fromCategory.id === destCategory.id) {
                return interaction.editReply(`Source and destination categories cannot be the same`);
            }

            const deleteOriginalOption = interaction.options.getBoolean('delete') ?? false;

            const fromChannels = interaction.guild.channels.cache.filter(channel => channel.parentId === fromCategory.id);
            const fromTextChannels = fromChannels.filter(
                channel => channel.type === ChannelType.GuildText
            ) as Collection<string, TextChannel>;

            if (fromTextChannels.size === 0) {
                return interaction.editReply(`No text channels found in ${channelMention(fromCategory.id)}`);
            }
            const deleteOriginal = deleteOriginalOption && fromChannels.size === fromTextChannels.size;

            const createdForum = await interaction.guild.channels.create({
                type: ChannelType.GuildForum,
                parent: destCategory,
                name: fromCategory.name,
                topic: fromCategory.name,
                defaultAutoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                defaultForumLayout: ForumLayoutType.ListView,
                reason: `Creating forum channel for ${fromCategory.name}`,
            }).catch(e => {
                log.error(`Error creating forum channel for ${fromCategory.name}`, e);
                return undefined;
            });
            if (!createdForum) {
                return interaction.editReply(`Error creating forum channel for ${fromCategory.name}`);
            }

            async function moveChannelToForum(channel: TextChannel) {
                let index = 0;
                while (index < channel.name.length && !channel.name[index]!.match(/[a-z]/i)) {
                    index++;
                }
                let name = channel.name;
                if (index < channel.name.length) {
                    name = channel.name.slice(0, index) + channel.name[index]!.toUpperCase() + channel.name.slice(index + 1);
                }
                name = name.split('-').join(' ');

                const thread = await createdForum!.threads.create({
                    name: name,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                    message: {
                        content: channel.topic || `Foro para temas relacionados a ${channel.name}`
                    },
                    reason: `Moving from ${channelMention(channel.id)}`
                });
                const messages = await channel.messages.fetch({ cache: false }).catch(() => []);

                for (const message of messages.reverse().values()) {
                    if (message.author.bot || !message.content && message.attachments.size === 0) {
                        continue;
                    }

                    await thread.send({
                        embeds: message.content ? [{
                            author: {
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL()
                            },
                            description: message.content,
                            timestamp: new Date(message.createdTimestamp).toISOString(),
                            color: message.author.accentColor ?? REPLY.EMBED.COLOR_INT,
                        }] : undefined,
                        files: message.attachments.map(a => a.url),
                    }).catch();
                }

                if (deleteOriginal) {
                    channel = await channel.delete(`Moved to ${channelMention(createdForum!.id)}`).catch(e => {
                        log.error(`Error deleting channel ${channel.name} after moving to forum`, e);
                        return channel;
                    });
                }

                return channel;
            }

            const channelPromises: Promise<TextChannel>[] = [];
            for (const channel of fromTextChannels.values()) {
                channelPromises.push(moveChannelToForum(channel));
            }

            await Promise.all(channelPromises);

            if (deleteOriginal) {
                await fromCategory.delete(`Moved to ${channelMention(createdForum!.id)}`).catch(e => {
                    log.error(`Error deleting category ${fromCategory.name} after moving to forum`, e);
                });
            }

            return interaction.editReply(
                `Moved all channels (${channelPromises.length}) from ${channelMention(fromCategory.id)} to ${channelMention(destCategory.id)}${!deleteOriginal && deleteOriginalOption ? ' but could not delete original category because it has non-text channels' : ''}`
            );
        }
    };
}) satisfies SingleFileCommandDefinition;
