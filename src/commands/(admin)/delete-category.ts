import { channelMention, ChannelType, GuildBasedChannel, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type.js';
import { log } from '../../lib/logging.js';


const commandData = new SlashCommandBuilder()
    .setName('delete-category')
    .setNameLocalization(`es-ES`, `borrar-categoria`)
    .setDescription(`Deletes a category and all its channels`)
    .setDescriptionLocalization(`es-ES`, `Borra una categoría y todos sus canales`)
    .addChannelOption(option => option
        .setName(`category`)
        .setDescription(`The category to delete`)
        .setDescriptionLocalization(`es-ES`, `La categoría a borrar`)
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            await interaction.deferReply({ ephemeral: true, fetchReply: true });

            const category = interaction.options.getChannel('category', true, [ChannelType.GuildCategory]);
            const categoryChannels = interaction.guild.channels.cache.filter(
                channel => channel.parentId === category.id
            );
            if (categoryChannels.size === 0) {
                return interaction.editReply(`No channels found in ${channelMention(category.id)}`);
            }

            const channelPromises: Promise<GuildBasedChannel>[] = [];

            for (const channel of categoryChannels.values()) {
                channelPromises.push(channel.delete(`Deleted by 'delete-category' command`));
            }

            try {
                await Promise.all(channelPromises);
                await category.delete(`Deleted by 'delete-category' command`);
                return interaction.editReply(`Deleted category ${category.name} and all its channels`);
            }
            catch (error) {
                log.error('Error deleting category and its channels', error);
                return interaction.editReply(`Error deleting category ${category.name} and its channels`);
            }
        }
    };
}) satisfies SingleFileCommandDefinition;
