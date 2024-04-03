import { SlashCommandSubcommandBuilder } from 'discord.js';
import { tsToRawHsMinS } from '../../../lib/index.js';
import { SubCommandDefinition } from './+command.js';


export default ((runningPomodoros) => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('left')
            .setNameLocalization('es-ES', 'restante')
            .setDescription('Tiempo restante del diclo actual')
        ,
        async execute({ interaction }) {
            const userId = interaction.member.id;
            const runningPomodoro = runningPomodoros.get(userId);
            if (!runningPomodoro)
                return interaction.reply({
                    content: `Debes iniciar una sesion pomodoro para saber el tiempo restante`,
                    ephemeral: true
                });

            const reamingTime = runningPomodoro.nextEventTimestamp - (
                runningPomodoro.isPaused ? runningPomodoro.pausedAt : Date.now()
            );
            const cicle = runningPomodoro.stats.completedCicles + (
                runningPomodoro.stats.completedCicles < runningPomodoro.config.cicles ? 1 : 0
            );
            return interaction.reply({
                content: `El riempo restante para termina el ciclo ${cicle} es ${tsToRawHsMinS(reamingTime)}`,
                ephemeral: true
            });
        }
    };
}) satisfies SubCommandDefinition;
