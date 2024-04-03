import { APIEmbed, SlashCommandSubcommandBuilder } from 'discord.js';
import { addEphemeralOption } from '../../../lib/discordjs.js';
import { SubCommandDefinition } from './+command.js';
import { LinksGroup, embedFromLinksGroups } from './+skip.shared.js';


const linksInformatica: LinksGroup[] = [
    {
        name: `instagram`,
        links: [
            {
                name: `Facultad de Informática UNLP`,
                url: `https://www.instagram.com/informaticaunlp/`,
                shortDesc: `College & university`
            },
            {
                name: `Tutorías Informática UNLP`,
                url: `https://www.instagram.com/tutoriasinformatica/`,
                shortDesc: `Education`
            },
            {
                name: `Bienestar UNLP`,
                url: `https://www.instagram.com/bienestarunlp/`,
                shortDesc: `La Prosecretaría de Bienestar Universitario de la Universidad Nacional de La Plata brinda beneficios para igualar las oportunidades para estudiar`
            },
            {
                name: `Biblioteca de Informática`,
                url: `https://www.instagram.com/bibliofi_unlp/`,
                shortDesc: `Espacio en construcción.\nEn este momento no podemos atenderte, dejanos tu consulta en la casilla de mensajes y pronto estaremos en contacto.`
            },
            {
                name: `Esports UNLP`,
                url: `https://www.instagram.com/esports.unlp/`,
                shortDesc: `🎮 Espacio de formación y contención para estudiantes de UNLP sobre deportes electrónicos`
            },
            {
                name: `PostInfoUNLP`,
                url: `https://www.instagram.com/postinfounlp/`,
                shortDesc: `Secretaria de Postgrado Facultad de Informática #UNLP`
            },
        ]
    },
    {
        name: `twitter`,
        links: [
            {
                name: `Informática - UNLP`,
                url: `https://twitter.com/InformaticaUNLP`,
                shortDesc: `Twitter Oficial de la Facultad de Informática de la Universidad Nacional de La Plata - UNLP`
            },
            {
                name: `Postgrado Informática #UNLP`,
                url: `https://twitter.com/PostInfoUNLP`,
                shortDesc: `Secretaria de Postgrado Facultad de Informática #UNLP`
            },
            {
                name: `III-LIDI-UNLP`,
                url: `https://twitter.com/IIILIDI`,
                shortDesc: `Instituto de Investigación en Informática - #LIDI`
            },
            {
                name: `Bienestar UNLP`,
                url: `https://twitter.com/BienestarUNLP`,
                shortDesc: `Cuenta oficial de la Prosecretaría de Bienestar Universitario (PBU) de la Universidad Nacional de La Plata.`
            },
            {
                name: `UNLP Esports`,
                url: `https://twitter.com/EsportsUnlp`,
                shortDesc: `Proyecto de formación en deportes electrónicos para estudiantes de la Universidad Nacional de La Plata🎓🎮`
            },
        ]
    },
    {
        name: `facebook`,
        links: [
            {
                name: `Facultad de Informática UNLP`,
                url: `https://www.facebook.com/InfoUNLP`,
                shortDesc: `Facebook oficial de la Facultad de Informática (UNLP)`
            },
            {
                name: `Infociytt`,
                url: `https://www.facebook.com/profile.php?id=100075879910307`,
                shortDesc: `Espacio de la Facultad de Informática orientado al desarrollo de actividades vinculadas a la innova`
            },
            {
                name: `Bienestar Unlp`,
                url: `https://www.facebook.com/BienestarUNLP`,
                shortDesc: `La Prosecretaría de Bienestar Universitario de la Universidad Nacional de La Plata brinda beneficios`
            },
        ]
    },
];

const linksReply: { embeds: APIEmbed[]; ephemeral: boolean; } = {
    embeds: [
        embedFromLinksGroups(
            `Links de la Facultad de Informatica - UNLP`,
            linksInformatica
        )
    ],
    ephemeral: true
};


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`socials`)
    .setNameLocalization(`es-ES`, `redes`)
    .setDescription(`Official socials of Facultad de Informatica`)
    .setDescriptionLocalization(`es-ES`, `Redes oficiales de la Facultad de Informatica`);
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
