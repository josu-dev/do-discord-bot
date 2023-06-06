import { bold, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';


const helpMessage = `${bold('Ayuda')}
El comando pomodoro es una funcionalidad para usar la tecnica de estudio pomodoro con la ayuda de un bot. Estas son las funcionalidades:

${bold('/pomodoro info')}: Una descripcion de que es y de que consta la tecnica pomodoro.

${bold('/pomodoro ayuda')}: Explica los comandos pomodoro.

${bold('/pomodoro iniciar')}: Permite configurar y dar inicio a una sesion de estudio pomodoro, opcionalmente agregar un objetivo/tema de estudio para la sesion y por defecto los tiempos son: estudio 25min, descanso 5min, descanso final 15min con 4 ciclos en la sesion, para un total de 2:15 hs.

${bold('/pomodoro pausar')}: Pausa la sesion si tienes una iniciada.

${bold('/pomodoro reanudar')}: Reanuda la sesion si tienes una iniciada.

${bold('/pomodoro terminar')}: Termina la sesion si tienes una iniciada.

${bold('/pomodoro restante')}: Informa el tiempo restante hasta terminar la sesion si tienes una iniciada (incluye el tiempo de descanso final).
`;

export default (function (runningPomodoros) {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('help')
            .setNameLocalization('es-ES', 'ayuda')
            .setDescription('Explicacion de el comando pomodoro')
        ,
        async execute({ interaction }) {
            return interaction.reply({
                embeds: [{ description: helpMessage }],
                ephemeral: true
            });
        }
    };
}) satisfies SubCommandDefinition;
