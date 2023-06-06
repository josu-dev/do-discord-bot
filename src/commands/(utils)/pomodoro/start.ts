import { SlashCommandSubcommandBuilder, userMention } from 'discord.js';
import { SubCommandDefinition, Pomodoro, pomodoroEvent } from './+command';
import { tsToRawHsMinS } from '../../../lib';


export default ((runningPomodoros) => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('start')
            .setNameLocalization('es-ES', 'iniciar')
            .setDescription('Inicia una sesion')
            .addStringOption(opt => opt
                .setName('objetive')
                .setNameLocalization('es-ES', 'objetivo')
                .setDescription('Objetivo de esta sesion pomodoro y/o tema de estudio')
                .setMinLength(4)
                .setMaxLength(255)
            )
            .addIntegerOption(opt => opt
                .setName('cicles')
                .setNameLocalization('es-ES', 'ciclos')
                .setDescription('Numero de ciclos para la sesion')
                .addChoices(
                    { name: '2', value: 2 },
                    { name: '3', value: 3 },
                    { name: '4', value: 4 }
                )
            )
            .addIntegerOption(opt => opt
                .setName('break-time')
                .setNameLocalization('es-ES', 'tiempo-descanso')
                .setDescription('Tiempo de descanso para cada ciclo')
                .addChoices(
                    { name: '2', value: 2 },
                    { name: '5', value: 5 },
                    { name: '10', value: 10 }
                )
            )
            .addIntegerOption(opt => opt
                .setName('study-time')
                .setNameLocalization('es-ES', 'tiempo-estudio')
                .setDescription('Tiempo de estudio para cada ciclo')
                .addChoices(
                    { name: '20', value: 20 },
                    { name: '25', value: 25 },
                    { name: '30', value: 30 },
                    { name: '40', value: 40 },
                    { name: '50', value: 50 }
                )
            )
            .addIntegerOption(opt => opt
                .setName('end-break-time')
                .setNameLocalization('es-ES', 'tiempo-descanso-final')
                .setDescription('Tiempo de descanso al final de la sesion')
                .addChoices(
                    { name: '15', value: 15 },
                    { name: '20', value: 20 },
                    { name: '30', value: 30 }
                )
            )
        ,
        async execute({ client, interaction }) {
            const userId = interaction.member.id;
            if (runningPomodoros.has(userId)) {
                return interaction.reply({
                    content: `Ya iniciaste una sesion pomodoro, terminala para empezar otra`,
                    ephemeral: true
                });
            }

            const opt = interaction.options;
            const cicles = opt.getInteger('cicles') ?? 4;
            const breakTime = opt.getInteger('break-time') ?? 5;
            const studyTime = opt.getInteger('study-time') ?? 25;
            const endBreakTime = opt.getInteger('end-break-time') ?? 20;
            const objetive = opt.getString('objetive') ?? 'sin objetivo planteado';

            const pomodoro = new Pomodoro({
                taskManager: client,
                objetive,
                userId,
                cicles,
                breakTime,
                studyTime,
                endBreakTime,
                onEvent: (event, pomodoro) => {
                    const mention = userMention(userId);
                    let message = '';
                    if (event === pomodoroEvent.BreakStart)
                        message = `${mention} comenzo tu tiempo de descanso`;
                    else if (event === pomodoroEvent.StudyStart)
                        message = `${mention} comenzo tu tiempo de estudio`;
                    else if (event === pomodoroEvent.FinalBreakStart)
                        message = `${mention} comenzo tu tiempo de descanso final, a relajarse`;
                    else if (event === pomodoroEvent.End) {
                        message = `${mention} termino tu sesion de estudio\n\nEste es el resumen de la sesion:\nObjetivo: ${pomodoro.objetive}, cumplido :D\n- Ciclos completos: ${pomodoro.stats.completedCicles}\n- Pausas realizadas: ${pomodoro.stats.timesPaused}\n- Duracion total: ${tsToRawHsMinS(pomodoro.stats.sessionEndTime - pomodoro.stats.sessionStartTime)}`;
                        runningPomodoros.delete(userId);
                    }
                    else {
                        return;
                    }
                    interaction.channel?.send(message);
                },
            });

            runningPomodoros.set(userId, pomodoro);

            pomodoro.start();

            return interaction.reply({
                content: `Inicio la sesion de estudio, a estudiar`
            });
        }
    };
}) satisfies SubCommandDefinition;
