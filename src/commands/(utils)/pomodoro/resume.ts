import { SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command.js';


export default ((runningPomodoros) => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('resume')
            .setNameLocalization('es-ES', 'reanudar')
            .setDescription('Reanuda la sesion actual')
        ,
        async execute({ interaction }) {
            const userId = interaction.member.id;
            const runningPomodoro = runningPomodoros.get(userId);
            if (!runningPomodoro)
                return interaction.reply({
                    content: `Debes iniciar una sesion pomodoro para poder reanudarla`,
                    ephemeral: true
                });

            runningPomodoro.resume();
            return interaction.reply({
                content: 'Sesion reanudada',
                ephemeral: true
            });
        }
    };
}) satisfies SubCommandDefinition;
