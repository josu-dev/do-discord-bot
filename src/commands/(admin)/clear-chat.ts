import { SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type.js';
import { log } from '../../lib/logging.js';


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('clear-chat')
            .setDescription('Prune up to n messages')
            .addIntegerOption(opt => opt
                .setRequired(true)
                .setName('amount')
                .setDescription('Number of messages to prune')
                .setMinValue(1)
                .setMaxValue(100)
            )
        ,
        async execute({ interaction }) {
            const amount = interaction.options.getInteger('amount')!;

            let error = false;
            await interaction.channel?.bulkDelete(amount, true).catch(async error => {
                if (!interaction.replied) {
                    interaction.reply({
                        content: 'There was an error trying to prune messages in this channel!',
                        ephemeral: true
                    });
                    return;
                }
                const errorMessage = await interaction.channel?.send({ content: 'There was an error trying to prune messages in this channel!' });
                errorMessage && setTimeout(
                    () => errorMessage.delete().catch(e => log.error(e)),
                    7.5 * 1000
                );
            });

            if (!error) interaction.reply({ content: `Successfully pruned \`${amount}\` messages.`, ephemeral: true });
        }
    };
}) satisfies SingleFileCommandDefinition;
