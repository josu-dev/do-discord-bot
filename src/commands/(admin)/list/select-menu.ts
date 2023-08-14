import { codeBlock, SlashCommandSubcommandBuilder, APIEmbed } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { REPLY } from '../../../botConfig';


export default (() => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('select-menu')
            .setDescription('List all the current selectMenus registered')
            .addBooleanOption(opt => opt
                .setName('ephemeral')
                .setDescription('Sets the response as ephemeral, default true')
            )
        ,
        async execute({ client, interaction }) {
            const fields: APIEmbed['fields'] = [];
            for (const selectMenu of client.selectMenus.values()) {
                fields.push({
                    name: `Menu ${fields.length + 1}`,// @ts-ignore
                    value: codeBlock(`type: ${selectMenu.data.type}\nname: ${selectMenu.data.name}\nmessageId:${selectMenu.data.messageId}\ncreated: ${selectMenu.data.createdAt.toISOString()}`),
                    inline: true
                });
            }

            const embed: APIEmbed = {
                title: `Registered select menus: ${fields.length}`,
                color: REPLY.EMBED.COLOR_INT,
                fields: fields,
            };
            if (fields.length === 0) {
                embed.description = `No select menus to list`;
            }

            await interaction.reply({
                embeds: [embed],
                ephemeral: interaction.options.getBoolean('ephemeral') ?? true,
            });
        },
    };
}) satisfies SubCommandDefinition;
