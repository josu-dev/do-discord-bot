import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';
import { SubCommandDefinition, documentTypes, customLibrarySearch, SearchOptions } from './+command';
import { documentsReply } from './search';
import { addEphemeralOption } from '../../../lib/discordjs';


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`advanced-search`)
    .setNameLocalization(`es-ES`, `busqueda-avanzada`)
    .setDescription(`Search for a document in the UNLP library with options (very sensitive to input)`)
    .setDescriptionLocalization(`es-ES`, `Busca un documento en la biblioteca de la UNLP con opciones (muy sensible a la entrada)`)
    .addStringOption(opt => opt
        .setName(`title`)
        .setNameLocalization(`es-ES`, `titulo`)
        .setDescription(`Title of the document`)
        .setDescriptionLocalization(`es-ES`, `Titulo del documento`)
    )
    .addStringOption(opt => opt
        .setName(`author`)
        .setNameLocalization(`es-ES`, `autor`)
        .setDescription(`Author of the document`)
        .setDescriptionLocalization(`es-ES`, `Autor del documento`)
    )
    .addIntegerOption(opt => opt
        .setName(`isbn`)
        .setNameLocalization(`es-ES`, `isbn`)
        .setDescription(`ISBN of the document`)
        .setDescriptionLocalization(`es-ES`, `ISBN del documento`)
    )
    .addStringOption(opt => opt
        .setName(`topic`)
        .setNameLocalization(`es-ES`, `tema`)
        .setDescription(`Topic of the document`)
        .setDescriptionLocalization(`es-ES`, `Tema del documento`)
    )
    .addBooleanOption(option => option
        .setName(`only-available`)
        .setNameLocalization('es-ES', `solo-disponible`)
        .setDescription(`Only show documents that are available in the library`)
        .setDescriptionLocalization('es-ES', `Solo mostrar documentos que esten disponibles en la biblioteca`)
    );
addEphemeralOption(commandData);

// Omitting EMPTY, SER, SEW, FOL, VID beacuse size limit of 25 choices per option (https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure)
const omitedKeys = ['EMPTY', 'SER', 'SEW', 'FOL', 'VID'] as const;
const documentOptions: APIApplicationCommandOptionChoice<string>[] = [];
for (const [key, value] of Object.entries(documentTypes)) {
    if (omitedKeys.includes(key as any)) {
        continue;
    }
    documentOptions.push({
        name: value,
        value: key
    });
}

commandData.addStringOption(opt => opt
    .setName(`document-type`)
    .setNameLocalization(`es-ES`, `tipo-documento`)
    .setDescription(`Document type of the book`)
    .setDescriptionLocalization(`es-ES`, `Tipo de documento del libro`)
    .setAutocomplete(false)
    .setChoices(...documentOptions)
);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const opt = interaction.options;
            const title = opt.getString('title') ?? undefined;
            const author = opt.getString('author') ?? undefined;
            const isbn = opt.getInteger('isbn') ?? undefined;
            const topic = opt.getString('topic') ?? undefined;
            const documentType = opt.getString('document-type') as SearchOptions['documentType'] ?? undefined;
            const onlyAvailable = opt.getBoolean('only-available') ?? undefined;
            const ephemeral = opt.getBoolean('ephemeral') ?? true;

            await interaction.reply({ content: `Buscando...`, ephemeral: ephemeral, fetchReply: true });

            const options: SearchOptions = {
                title,
                author,
                isbn,
                topic,
                documentType,
                onlyAvailable,
            };
            const searchResult = await customLibrarySearch(options);
            if (!searchResult || searchResult.empty) {
                return interaction.editReply(`No se encontraron resultados en la biblioteca`);
            }

            return interaction.editReply(documentsReply(searchResult));
        }
    };
}) satisfies SubCommandDefinition;
