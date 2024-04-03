import { channelMention, ChannelType, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type.js';


const VALID_CHANNEL_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement] satisfies ChannelType[];

const commandData = new SlashCommandBuilder()
    .setName('purge-channel')
    .setNameLocalization(`es-ES`, 'limpiar-canal')
    .setDescription(`Deletes the last 100 (maximum allowed by Discord) messages from a channel`)
    .setDescriptionLocalization(`es-ES`, `Elimina los últimos 100 (máximo permitido por Discord) mensajes de un canal`)
    .addChannelOption(opt => opt
        .setRequired(true)
        .setName('channel')
        .setDescription('The channel to purge')
        .addChannelTypes(...VALID_CHANNEL_TYPES)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            await interaction.reply({
                content: `Deleting messages...`,
                ephemeral: true,
                fetchReply: true,
            });
            const channel = interaction.options.getChannel('channel', true, VALID_CHANNEL_TYPES);

            const messages = await channel.messages.fetch({
                limit: 100,
                cache: false,
            });
            if (!messages) {
                return interaction.editReply({
                    content: `A problem occured at fetching the messages from ${channelMention(channel.id)}`,
                });
            }

            let count = 0;
            for (const message of messages.values()) {
                if (await message.delete()) {
                    count++;
                }
            }

            return interaction.editReply({
                content: `Succesfully deleted ${count} of ${messages.size} messages from ${channelMention(channel.id)}`,
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
