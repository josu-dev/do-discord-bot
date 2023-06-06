import { SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';


export default ((runningPomodoros) => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('pause')
            .setNameLocalization('es-ES', 'pausar')
            .setDescription('Detiene la sesion actual')
        ,
        async execute({ interaction }) {
            const userId = interaction.member.id;
            const runningPomodoro = runningPomodoros.get(userId);
            if (!runningPomodoro)
                return interaction.reply({
                    content: `Debes iniciar una sesion pomodoro para poder pausarla`,
                    ephemeral: true
                });

            runningPomodoro.pause();
            return interaction.reply({
                content: 'Sesion pausada',
                ephemeral: true
            });
        }
    };
}) satisfies SubCommandDefinition;
