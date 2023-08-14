import type { EventDefinition } from './+type';
import { ChannelType } from 'discord.js';
import { GUILD } from '../botConfig';


export default (() => {
    return {
        once: false,
        name: `interactionCreate`,
        description: `Validates that a command exist and if that's the case, runs it`,
        async response(client, interaction) {
            if (!interaction.isChatInputCommand()) return;

            if (interaction.channel?.type === ChannelType.DM) {
                return interaction.reply({
                    content: `Comandos no habilitados en Mensajes Directos`,
                    ephemeral: true
                });
            }

            if (!interaction.inCachedGuild()) {
                const guild = await interaction.guild?.fetch();
                if (!guild)
                    return interaction.reply({
                        content: `Comando no disponible para el servidor '${interaction.guild?.name}'`,
                        ephemeral: true
                    });
                return interaction.reply({
                    content: `Intentelo nuevamente`,
                    ephemeral: true
                });
            }

            const { commandName } = interaction;

            const command = client.commands.get(commandName);

            if (!command) {
                return interaction.reply({
                    content: `No se encuentra disponible el comando ${commandName}`,
                    ephemeral: true
                });
            }
            const { member } = interaction;

            const locals = {
                MemberType: member.roles.cache.has(GUILD.ROLES.ADMIN) ? 'Administrator' : member.roles.cache.has(GUILD.ROLES.MOD) ? 'Moderator' : 'Normal'
            } as const;

            try {
                await command.execute({ client, interaction, locals });
            } catch (error) {
                console.error(error);
                const repliedMessage = await interaction.fetchReply().catch(error => { console.log(error); return undefined; });
                if (repliedMessage) {
                    repliedMessage.edit({ content: 'There was an error while executing this command!' });
                }
                else {
                    interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    } as const;
}) satisfies EventDefinition<'interactionCreate'>;
