import { APIEmbed, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { LinksGroup, embedFromLinksGroups } from './+skip.shared';
import { addEphemeralOption } from '../../../lib/discordjs';


const frequentLinks: LinksGroup[] = [
    {
        name: `materias`,
        links: [
            {
                name: `Ideas`,
                url: `https://ideas.info.unlp.edu.ar/login`,
                shortDesc: `Plataforma para las primeras cursadas`
            },
            {
                name: `Catedras Linti`,
                url: `https://catedras.linti.unlp.edu.ar/`,
                shortDesc: `Plataforma para la comunicacion y material de las catedras`
            },
            {
                name: `Asignaturas MFI`,
                url: `https://asignaturas.info.unlp.edu.ar/`,
                shortDesc: `Plataforma para la comunicacion y material de las catedras`
            },
        ]
    },
    {
        name: `otros`,
        links: [
            {
                name: `Siu Guarani`,
                url: `https://www.guarani-informatica.unlp.edu.ar/inicio_alumno`,
                shortDesc: `Inscripsion cursadas y finales, gestion con la facultad`
            },
            {
                name: `Gestion Docente | Cartelera`,
                url: `https://gestiondocente.info.unlp.edu.ar/cartelera`,
                shortDesc: `Donde algunas catedras realizan notificaciones/comunicados`
            },
            {
                name: `Informatica`,
                url: `https://www.info.unlp.edu.ar/`,
                shortDesc: `Pagina oficial de la Facultad de Informatica - UNLP`
            }
        ]
    },
];

const linksReply: { embeds: APIEmbed[]; ephemeral: boolean; } = {
    embeds: [
        embedFromLinksGroups(
            `Paginas frecuentadas como estudiante`,
            frequentLinks
        )
    ],
    ephemeral: true
};


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`sites`)
    .setNameLocalization(`es-ES`, `paginas`)
    .setDescription(`Frequently used sites`)
    .setDescriptionLocalization(`es-ES`, `Paginas usadas frecuentemente`);
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            linksReply.ephemeral = ephemeral;

            return interaction.reply(linksReply);
        }
    };
}) satisfies SubCommandDefinition;
