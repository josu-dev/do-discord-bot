import { channelMention, ChannelType, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type.js';


const VALID_CHANNEL_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement] satisfies ChannelType[];

const commandData = new SlashCommandBuilder()
    .setName('say')
    .setNameLocalization(`es-ES`, 'decir')
    .setDescription(`Sends a message to the specified channel as the bot`)
    .setDescriptionLocalization(`es-ES`, `Envía un mensaje al canal especificado como el bot`)
    .addChannelOption(opt => opt
        .setRequired(true)
        .setName('channel')
        .setNameLocalization(`es-ES`, 'canal')
        .setDescription('The channel to send the message to')
        .setDescriptionLocalization(`es-ES`, 'El canal al que enviar el mensaje')
        .addChannelTypes(...VALID_CHANNEL_TYPES)
    )
    .addStringOption(opt => opt
        .setRequired(true)
        .setName('message')
        .setNameLocalization(`es-ES`, 'mensaje')
        .setDescription('The message to send.')
        .setDescriptionLocalization(`es-ES`, 'El mensaje a enviar')
        .setMinLength(2)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const channel = interaction.options.getChannel('channel', true, VALID_CHANNEL_TYPES);
            const message = interaction.options.getString('message', true);

            const sendedMessage = await channel.send(message);
            if (!sendedMessage) {
                return interaction.reply({
                    content: `A problem occured at sending the message to ${channelMention(channel.id)}`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: `Succesfully message sent to ${channelMention(channel.id)}`,
                ephemeral: true
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
