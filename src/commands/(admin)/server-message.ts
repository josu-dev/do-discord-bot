import { APIEmbed, Attachment, channelMention, ChannelType, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
import { schema } from '../../lib';


const MAX_EMBED_OPTIONS = 5;
const VALID_CHANNEL_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement] satisfies ChannelType[];

const commandData = new SlashCommandBuilder()
    .setName('server-message')
    .setDescription('Sends a message as the server to the specified channel, provide title & content | embeds > 0')
    .addChannelOption(opt => opt
        .setRequired(true)
        .setName('channel')
        .setDescription('The desired channel')
        .addChannelTypes(...VALID_CHANNEL_TYPES)
    )
    .addStringOption(opt => opt
        .setName('title')
        .setDescription('Title for the first embed'))
    .addStringOption(opt => opt
        .setName('content')
        .setDescription('Content for the first embed')
        .setMinLength(4)
        .setMaxLength(2000)
    )
    .addBooleanOption(opt => opt
        .setName('signed')
        .setDescription('If the embeds must be signed or by the server, default true')
    );

for (let i = 0; i < MAX_EMBED_OPTIONS; i++) {
    commandData.addAttachmentOption(opt => opt
        .setName(`embed-${i + 1}`)
        .setDescription(`Embed ${i + 1}`)
    );
}

export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            await interaction.deferReply({
                ephemeral: true,
                fetchReply: true
            });

            const opt = interaction.options;
            const channel = opt.getChannel('channel', true, VALID_CHANNEL_TYPES);
            const title = opt.getString('title');
            const content = opt.getString('content');
            const isSigned = opt.getBoolean('signed') ?? true;

            if ((title && !content) || (!title && content)) {
                return interaction.editReply({
                    content: `Missing ${title ? 'content' : 'title'} to generate the first embed of the message`,
                });
            }

            const isFirstEmbed = title && content;

            function existId(embes: Attachment[], name: string) {
                for (const embed of embes) if (embed.name === name) return true;
                return false;
            }
            const duplicatedAttachments: Set<string> = new Set();
            const embedsAttachments: Attachment[] = [];
            for (let i = 0; i < MAX_EMBED_OPTIONS; i++) {
                const embedAttachment = opt.getAttachment(`embed-${i + 1}`);
                if (!embedAttachment) {
                    continue;
                }
                if (existId(embedsAttachments, embedAttachment.name)) {
                    duplicatedAttachments.add(embedAttachment.name);
                    continue;
                }
                embedsAttachments.push(embedAttachment);
            }

            if (duplicatedAttachments.size !== 0) {
                let embeds = '';
                for (const embed of duplicatedAttachments) {
                    embeds += ` ${embed}`;
                }
                return interaction.editReply({
                    content: `Must provide unique embeds, repeated embeds:${embeds}`,
                });
            }

            if (!isFirstEmbed && embedsAttachments.length === 0) {
                return interaction.editReply({
                    content: `Must provide at least one embed attachment if both title and content aren't provided`,
                });
            }


            function setSharedEmbedData(embed: APIEmbed): APIEmbed {
                if (isSigned) {
                    embed.author = {
                        name: interaction.guild.name,
                        icon_url: interaction.guild.iconURL() ?? undefined
                    };
                    embed.timestamp = new Date().toISOString();
                }
                embed.color = 9709102;
                return embed;
            }

            const embeds: APIEmbed[] = [];

            if (isFirstEmbed) {
                embeds.push(setSharedEmbedData({
                    title: title,
                    description: content
                }));
            }
            if (embedsAttachments.length !== 0) {

                const promises: Promise<unknown>[] = [];
                for (const attachment of embedsAttachments) {
                    promises.push(
                        fetch(attachment.url).then(f => f.json()).catch(error => void console.log(error))
                    );
                }

                const rawEmbeds = await Promise.all(promises);

                const parsedPromises: ReturnType<typeof schema.embedSchema.safeParseAsync>[] = [];
                for (const rawEmbed of rawEmbeds) {
                    parsedPromises.push(
                        schema.embedSchema.safeParseAsync(rawEmbed)
                    );
                }
                const parsedEmbeds = await Promise.all(parsedPromises);
                let error: string = '';
                for (const parsed of parsedEmbeds) {
                    if (!parsed.success) {
                        error = error + `provided embed is invalid\nerror: ${parsed.error}\n`;
                        continue;
                    }
                    embeds.push(setSharedEmbedData(parsed.data));
                }
                if (error !== '') {
                    return interaction.editReply(error);
                }
            }

            const serverMessage = await channel.send({ embeds: embeds });

            return interaction.editReply({
                content: serverMessage ?
                    `Succesfully sended the message at ${channelMention(channel.id)}` :
                    `Failed to send the message`,
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
