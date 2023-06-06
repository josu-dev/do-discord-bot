import type { EventDefinition } from './+type';


export default (() => {
    return {
        once: false,
        name: `interactionCreate`,
        description: `Validates that a command exist and if that's the case, runs it`,
        async response(client, interaction) {
            if (!interaction.isAnySelectMenu()) return;

            if (interaction.channel?.isDMBased()) {
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

            const { customId } = interaction;

            const selectMenu = client.selectMenus.get(interaction.message.id);

            if (!selectMenu) {
                return interaction.reply({
                    content: `No se encuentra disponible el menu seleccionable ${selectMenu}`,
                    ephemeral: true
                });
            }

            try {
                await selectMenu.execute({ client, interaction });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this select menu!', ephemeral: true });
            }
        }
    } as const;
}) satisfies EventDefinition<'interactionCreate'>;
