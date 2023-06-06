import { SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { tsToRawHsMinS } from '../../../lib';


export default ((runningPomodoros) => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('end')
            .setNameLocalization('es-ES', 'terminar')
            .setDescription('Termina la sesion actual')
        ,
        async execute({ interaction }) {
            const userId = interaction.member.id;
            const runningPomodoro = runningPomodoros.get(userId);
            if (!runningPomodoro) {
                return interaction.reply({
                    content: `Debes iniciar una sesion pomodoro para poder terminarla`,
                    ephemeral: true
                });
            }

            runningPomodoros.delete(userId);

            runningPomodoro.end();

            return interaction.reply({
                content: `Sesion finalizada\n\nResumen de la sesion:\nObjetivo: ${runningPomodoro.objetive}, no cumplido :c\n- Ciclos completos: ${runningPomodoro.stats.completedCicles}\n- Pausas realizadas: ${runningPomodoro.stats.timesPaused}\n- Duracion total: ${tsToRawHsMinS(runningPomodoro.stats.sessionEndTime - runningPomodoro.stats.sessionStartTime)}`,
            });
        }
    };
}) satisfies SubCommandDefinition;
