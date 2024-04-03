import { codeBlock, SlashCommandSubcommandBuilder } from 'discord.js';
import fs from 'fs';
import { log } from '../../../lib/logging.js';
import { SubCommandDefinition } from './+command.js';


export default (() => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('select-menu')
            .setDescription('List all the current selectMenus registered')
            .addStringOption(opt => opt
                .setRequired(true)
                .setName('message-id')
                .setDescription('The id of the message containing the selectMenu')
                .setMinLength(16)
                .setMaxLength(24)
            )
        ,
        async execute({ client, interaction }) {
            await interaction.deferReply({
                ephemeral: true,
                fetchReply: true
            });

            const messageId = interaction.options.getString(`message-id`, true);
            const deletedSelectMenu = client.selectMenus.get(messageId);

            if (!deletedSelectMenu) {
                return interaction.editReply({
                    content: `Error, no selectMenu registered with messageId=${messageId}`
                });
            }

            fs.unlink(
                deletedSelectMenu.data.cachePath,
                (error) => {
                    if (error || !client.selectMenus.delete(deletedSelectMenu.data.messageId)) {
                        log.error(`error ocurred while trying to unregister a select menu\n  customId > ${deletedSelectMenu.data.customId}\n  error > ${error}`);
                        interaction.editReply(`Error, something happend while removing selectMenu with messageId > ${messageId} and customId > ${deletedSelectMenu.data.customId}`);
                        return;
                    }

                    log.info(`successfully unregistered select menu with messageId=${messageId} and customId=${deletedSelectMenu.data.customId}`);
                    interaction.editReply(`Succesfully deleted selectMenu:\n${codeBlock('json', JSON.stringify(deletedSelectMenu!.data, null, 2))}`);
                }
            );

            return interaction.editReply({
                content: `Deleting selectMenu...`
            });
        },
    };
}) satisfies SubCommandDefinition;
