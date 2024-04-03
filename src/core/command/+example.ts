import { SlashCommandBuilder } from 'discord.js';
// Replace with './+type' as the path when copying
import { SingleFileCommandDefinition } from './type.js';
// Use relative imports for any value import outside nodemodules


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('example')
            .setNameLocalization('es-ES', 'ejemplo')
            .setDescription('This is an example command')
            .setDescriptionLocalization('es-ES', 'Esto es un commando de ejemplo')
        ,
        async execute({ client, interaction, locals }) {
            // Code to run on command execution

            // Should always end with any type of interaction reply?
            return interaction.reply({
                content: `Latencia contra el bot ${client.ws.ping}ms`,
            });
        },
        // Permissions to be setted for this specific command with PermissionFlagsBits.* , it is not required
        permissions: []
    };
}) satisfies SingleFileCommandDefinition;
