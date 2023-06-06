import { SlashCommandSubcommandBuilder, codeBlock, hyperlink } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { addEphemeralOption } from '../../../lib/discordjs';


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`explain`)
    .setNameLocalization(`es-ES`, `explicar`)
    .setDescription(`Explanation of what is a student group`)
    .setDescriptionLocalization(`es-ES`, `Explica que es una agrupacion estudiantil`);
addEphemeralOption(commandData);

const reply = {
    content: ``,
    embeds: [{
        title: `Explicacion: Agrupaciones Estudiantiles`,
        description: `Una agrupación estudiantil en Argentina es una organización formada por estudiantes de establecimientos educativos para defender sus derechos y fomentar la participación joven dentro y fuera de la escuela.
        
        Estan respaldadas por la ley de Centros de Estudiantes: ${hyperlink(`Ley 26.877`, `https://www.argentina.gob.ar/normativa/nacional/ley-26877-218150`)}
        
        Un pequeño resumen:`,
        fields: [
            {
                name: `¿Qué es un Centro de Estudiantes?`,
                value: `Es un órgano democrático de representación de las y los estudiantes.\n\nEs una organización formada por alumnos y alumnas de establecimientos educativos para defender sus derechos. También fomenta la participación joven dentro y fuera de la escuela.`
            },
            {
                name: `¿Dónde funcionan?`,
                value: `Funcionan en instituciones educativas públicas: escuelas secundarias, institutos de educación superior, instituciones para adultos y de formación profesional.`
            },
            {
                name: `¿Para qué sirven?`,
                value: `Sirven para:\n${codeBlock(`text`, `- Formar a las y los estudiantes en las prácticas democráticas, republicanas y federales.\n- Defender los derechos humanos.\n- Defender el derecho a aprender.\n- Afianzar el derecho a la libre expresión.\n- Reconocer a la educación pública como un derecho.\n- Contribuir a mejorar la calidad de la educación.\n- Promover la participación en los problemas educativos.\n- Gestionar ante las autoridades los pedidos y necesidades de alumnos y alumnas.\n- Insertar a los estudiantes en la sociedad a través de acciones que beneficien a la comunidad.`)}`
            },
            {
                name: `¿Quiénes forman parte de un centro de estudiantes?`,
                value: `Todos los estudiantes regulares de una institución educativa tienen derecho a participar en el centro de estudiantes.\n\nEl Centro no le pertenece a ningún estudiante ni grupo de estudiantes porque es una asociación pública, que representa a todos los jóvenes que van a la escuela.`
            },
        ],
        color: 0x37bbed
    }],
    ephemeral: true
};


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            reply.ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
            return interaction.reply(reply);
        }
    };
}) satisfies SubCommandDefinition;
