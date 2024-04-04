import { SlashCommandBuilder } from 'discord.js';
import { MultiFileCommandDefinition, SubCommandDefinitionFrom } from '../../+type.js';
export { customLibrarySearch, documentTypes, librarySearch } from '../../../plugins/scrapers/bibliofi/libraryScraper.js';
export type { SearchOptions, SearchResult } from '../../../plugins/scrapers/bibliofi/libraryScraper.js';

const baseCommand = (() => {
    return {
        data: new SlashCommandBuilder()
            .setName(`bibliofi`)
            .setDescription(`Commands related to the library of the Facultad de Informatica - UNLP`)
            .setDescriptionLocalization('es-ES', `Commandos relacionados a la biblioteca de la Facultad de Informatica - UNLP`)
        ,
    };
}) satisfies MultiFileCommandDefinition;

export type SubCommandDefinition = SubCommandDefinitionFrom<typeof baseCommand>;

export default baseCommand;
