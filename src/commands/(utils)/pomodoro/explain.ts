import { bold, italic, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';


const infoMessage = `
La técnica de estudio Pomodoro es una técnica de gestión del tiempo que puede ayudarte a mejorar la productividad y la concentración mientras estudias. La técnica se basa en dividir el tiempo de estudio en períodos de tiempo más pequeños, llamados "pomodoros", y tomar descansos regulares para ayudar a mantener la concentración y reducir la fatiga mental.

Aquí hay una guía paso a paso para la técnica de estudio Pomodoro:

1. ${bold('Establece tu objetivo')}: Antes de comenzar a estudiar, decide qué tarea o tema deseas cubrir durante tu sesión de estudio.

2. ${bold('Configura un temporizador')}: Configura un temporizador para 25 minutos, que se conoce como un "pomodoro". Puedes usar un temporizador de cocina, un temporizador en tu teléfono o una aplicación especializada en la técnica Pomodoro.

3. ${bold('Comienza a estudiar')}: Comienza a estudiar el tema o tarea que has elegido y trata de concentrarte únicamente en esa tarea durante los 25 minutos. Si durante este tiempo te distraes o te distraen, anota la distracción para abordarla en el próximo descanso.

4. ${bold('Toma un descanso corto')}: Cuando suena la alarma del temporizador, detente y toma un descanso corto de 5 minutos. Levántate, estira tus piernas, bebe agua, y trata de relajarte sin distraerte demasiado.

5. ${bold('Repite el proceso')}: Después del descanso, comienza otro pomodoro de 25 minutos y continúa con tu tarea. Continúa repitiendo este proceso hasta que hayas completado cuatro pomodoros, lo que equivale a aproximadamente 2 horas de estudio.

6. ${bold('Toma un descanso largo')}: Después de completar cuatro pomodoros, toma un descanso más largo de 15-30 minutos para recargar tus baterías y descansar tu mente.

7. ${bold('Evalúa tu progreso')}: Al final de cada sesión de estudio, evalúa tu progreso y verifica si has cumplido tu objetivo. Si has completado la tarea, táchala de tu lista y celebra tu éxito.

${italic('La técnica de estudio Pomodoro es una herramienta efectiva para aumentar la concentración y la productividad mientras estudias. Pruébalo durante una semana y evalúa si esta técnica de gestión del tiempo es efectiva para ti.')}
`;


export default ((runningPomodoros) => {
    return {
        data: new SlashCommandSubcommandBuilder()
            .setName('explain')
            .setNameLocalization(`es-ES`, `explicar`)
            .setDescription('Explanation of what is the Pomodoro technique')
            .setDescriptionLocalization(`es-ES`, `Explicacion de que es la técnica Pomodoro`)
        ,
        async execute({ interaction }) {
            return interaction.reply({
                embeds: [{
                    title: bold('Explicacion: Técnica Pomodoro'),
                    description: infoMessage
                }],
                ephemeral: true
            });
        }
    };
}) satisfies SubCommandDefinition;
