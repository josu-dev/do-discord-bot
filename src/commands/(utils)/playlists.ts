import { bold, hyperlink, hideLinkEmbed, italic, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';


const playlists = [
    {
        name: `Fifi's Covers (all)`,
        shortDesc: `Acustic guitar`,
        link: 'https://www.youtube.com/watch?v=mHgPqSgffT8&list=PLstB1Rty2XZKObg3XpMT8JUzTcnXHQd2F'
    },
    {
        name: `Mix: Cigarettes After Sex`,
        shortDesc: `Quiet chill`,
        link: 'https://www.youtube.com/watch?v=5soixb2U6xM&list=RDEMKGfuPgnuOACykuookqvo7w&start_radio=1'
    },
    {
        name: `Eli & Fur - Malibu Sunset Set [2021]`,
        shortDesc: `Evocative vocals, cascading synths and rolling basslines`,
        link: 'https://youtu.be/ZmO9jQgm_Ig'
    },
    {
        name: `Kaleo - Official videos`,
        shortDesc: `Icelandic rock band`,
        link: 'https://www.youtube.com/watch?v=FNwgOkl5nRY&list=PLRgYF7F83IHdR-jsEo_RH2RjQfDPGQUHe'
    },
] as const;

const playlistMessage = 'Recomendaciones para escuchar:\n' +
    playlists.reduce(
        (prev, crr) =>
            `${prev}  ${bold(`${hyperlink(crr.name, hideLinkEmbed(crr.link))}`)}  -  ${italic(crr.shortDesc)}\n`,
        ''
    );


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('playlists')
            .setDescription('Playlists to listen to while programming/studying')
            .setDescriptionLocalization('es-ES', 'Listas de reproducción para escuchar mientras programas/estudias')
        ,
        async execute({ interaction }) {
            return interaction.reply({
                content: playlistMessage,
                ephemeral: true
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
