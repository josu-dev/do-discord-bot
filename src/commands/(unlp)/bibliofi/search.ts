import { APIEmbed, InteractionEditReplyOptions, SlashCommandSubcommandBuilder, blockQuote, bold, hideLinkEmbed, hyperlink } from 'discord.js';
import { SearchResult, SubCommandDefinition, librarySearch } from './+command';
import { INFORMATICA } from '../+skip.config';
import { addEphemeralOption } from '../../../lib/discordjs';


const ratingEmoji = (rating?: number) => {
    switch (rating) {
        case 0:
            return '🙁';
        case 1:
            return '⭐';
        case 2:
            return '⭐⭐';
        case 3:
            return '⭐⭐⭐';
        case 4:
            return '⭐⭐⭐⭐';
        case 5:
            return '⭐⭐⭐⭐⭐';
        default:
            return 'Sin calificar';
    }
};

export function documentsReply(searchResult: SearchResult) {
    const embeds: APIEmbed[] = [];
    for (const doc of searchResult.documents) {
        const fields: APIEmbed['fields'] = [
            { name: `Autor/es`, value: doc.author ? hyperlink(doc.author, doc.authorURL ?? '') : 'Desconocido/s', inline: true },
            { name: `Edición`, value: doc.edition ?? 'Desconocida', inline: true },
            { name: `Calificación`, value: ratingEmoji(doc.rate), inline: true },
            { name: `Disponibilidad`, value: doc.unavailable ? 'No disponible' : (doc.onLibrary ? `Sala\n` : ``) + (doc.onHouse ? `Domicilio` : ``), inline: true },
        ];

        embeds.push({
            title: doc.title.slice(0, 256),
            url: doc.docURL,
            thumbnail: {
                url: doc.imgURL ?? '',
            },
            color: INFORMATICA.embed.embedColorInt,
            fields: fields
        });
    }

    const showedDocs = searchResult.total > searchResult.documents.length ? `Se muestran los primeros ${bold(searchResult.documents.length.toString())}` : '';
    return {
        content: blockQuote(`Fuente ${hideLinkEmbed(searchResult.scrapedURL)}\n` + `Se encontraron ${bold(searchResult.total.toString())} resultados\n` + showedDocs),
        embeds: embeds,
    } satisfies InteractionEditReplyOptions;
}


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`search`)
    .setNameLocalization('es-ES', `buscar`)
    .setDescription(`Search for a document in the library`)
    .setDescriptionLocalization('es-ES', `Busca un documento en la biblioteca`)
    .addStringOption(option => option
        .setRequired(true)
        .setName(`text`)
        .setNameLocalization('es-ES', `texto`)
        .setDescription(`The text to search for (title, author, topic, etc)`)
        .setDescriptionLocalization('es-ES', `El texto a buscar (titulo, autor, tema, etc)`)
        .setMinLength(1)
        .setMaxLength(100)
    );
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
            await interaction.reply({ content: `Buscando...`, ephemeral: ephemeral, fetchReply: true });

            const searchText = interaction.options.getString('text', true);

            const searchResult = await librarySearch(searchText);
            if (!searchResult || searchResult.empty) {
                return interaction.editReply(`No se encontraron resultados en la biblioteca`);
            }

            return interaction.editReply(documentsReply(searchResult));
        }
    };
}) satisfies SubCommandDefinition;
