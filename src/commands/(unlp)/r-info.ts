import { bold, codeBlock, InteractionReplyOptions, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';


const commandData = new SlashCommandBuilder()
    .setName('r-info')
    .setDescription('Commands related to r-Info language')
    .setDescriptionLocalization('es-ES', 'Comandos relacionados al lenguaje r-Info')
    .addSubcommand(cmd => cmd
        .setName('help')
        .setNameLocalization('es-ES', 'ayuda')
        .setDescription('Help for r-Info commands')
        .setDescriptionLocalization('es-ES', 'Ayuda para los comandos de r-Info')
    )
    .addSubcommand(cmd => cmd
        .setName('explain')
        .setNameLocalization('es-ES', 'explicar')
        .setDescription('Explanation of what is r-Info')
        .setDescriptionLocalization('es-ES', 'Explicacion de que es r-Info')
    )
    .addSubcommand(cmd => cmd
        .setName('syntax')
        .setNameLocalization('es-ES', 'sintaxis')
        .setDescription('Syntax of r-Info')
        .setDescriptionLocalization('es-ES', 'Sintaxis de r-Info')
    )
    .addSubcommand(cmd => cmd
        .setName('web')
        .setDescription('UNOFFICIAL web IDE for r-Info')
        .setDescriptionLocalization('es-ES', 'IDE web NO OFICIAL para r-Info')
    )
    .addSubcommand(cmd => cmd
        .setName('docs')
        .setDescription('UNOFFICIAL documentation for r-Info')
        .setDescriptionLocalization('es-ES', 'Documentacion NO OFICIAL para r-Info')
    )
    .addSubcommand(cmd => cmd
        .setName('extension')
        .setDescription('UNOFFICIAL VS Code | Codium extension for r-Info')
        .setDescriptionLocalization('es-ES', 'Extension NO OFICIAL para VS Code | Codium para r-Info')
    )
    .addSubcommand(cmd => cmd
        .setName('highlight')
        .setNameLocalization('es-ES', 'resaltar')
        .setDescription('Highlight the r-Info syntax of the attached text')
        .setDescriptionLocalization('es-ES', 'Resalta la sintaxis de r-Info del texto adjuntado')
    );


const rInfoSintax = [
    {
        "name": "operator",
        "displayName": "Operador",
        "keyWords": ["/", ":=", "~", "[|]", "&", "<>", " > ", " < ", "= ", "[+]", "-", "[*]"],
        "color": "#BED6FF"
    },
    {
        "name": "control",
        "displayName": "Control",
        "keyWords": ["sino", "si", "mientras ", "repetir "],
        "color": "#d197d9"
    },
    {
        "name": "section",
        "displayName": "Seccion",
        "keyWords": ["programa", "procesos", "variables", "areas", "robots", "comenzar", "fin"],
        "color": "#D35151"
    },
    {
        "name": "literalValues",
        "displayName": "Valores literales",
        "keyWords": ["V", "F"],
        "color": "#7fb347"
    },
    {
        "name": "function",
        "displayName": "Funcion",
        "keyWords": [
            "HayFlorEnLaEsquina", "HayPapelEnLaEsquina", "HayFlorEnLaBolsa", "HayPapelEnLaBolsa", "PosAv", "PosCa",
            "Pos", "mover", "derecha", "tomarFlor", "tomarPapel", "depositarFlor", "depositarPapel", "AsignarArea",
            "Iniciar", "Informar", "Random", "EnviarMensaje", "RecibirMensaje", "BloquearEsquina", "LiberarEsquina"],
        "color": "#dcdcaa"
    },
    {
        "name": "valueType",
        "displayName": "Tipos de datos",
        "keyWords": ["boolean", "numero", "AreaC", "AreaPC", "AreaP", "proceso", "robot"],
        "color": "#5EB0F5"
    },
    {
        "name": "parameterModifier",
        "displayName": "Modificadores de parametros",
        "keyWords": ["ES ", "E "],
        "color": "#4892F5"
    },
    {
        "name": "commentary",
        "displayName": "Comentario",
        "keyWords": ["[{]", "[}]"],
        "color": "#608b4e"
    }
] as const;

function commandQuote(command: string, subCommand: string | string[]): string {
    if (typeof subCommand === 'string')
        return bold(command + ' ' + subCommand);
    return bold(command) + ' [ ' + subCommand.map(c => bold(c)).join(' | ') + ' ]';
}

const helpMessage = `${bold('Ayuda')}
El comando r-info es una funcionalidad para mejorar la experiencia del lenguage r-Info. Estas son las funcionalidades:

${commandQuote('/r-info', ['help', 'ayuda'])}: Explica los comandos r-info.

${commandQuote('/r-info', 'explain')}: Una descripcion de que es y de que consta el lenguage r-Info.

${commandQuote('/r-info', ['syntax', 'sintaxis'])}: Apunte de la sintaxis que confarma al lenguage r-Info

${commandQuote('/r-info', 'web')}: IDE web para R-Info cortesia de *Los Compañeros*.    

${commandQuote('/r-info', 'docs')}: Documentacion del lenguaje R-Info cortesia de *Los Compañeros*.

${commandQuote('/r-info', 'extension')}: Extension para VS Code | Codium cortesia de *La Fuente*.

${commandQuote('/r-info', ['highlight', 'resaltar'])}: A partir del texto adjuntado genera una imagen con la sintaxis de R-Info resaltada.
`;

const EMBED_COLOR = 16_727_808;

const constantResponse = {
    help: {
        embeds: [{
            description: helpMessage,
            color: EMBED_COLOR,
        }],
        ephemeral: true
    },
    explain: {
        embeds: [{
            title: bold('Explicacion: r-Info'),
            description: `
                RobotScript es un lenguaje de programación donde se aprende conceptos básicos sobre como se constituye un programa y como se escribe uno, esto lo hace de manera sencilla ( con instrucciones y datos elementales o básicos en idioma español ) y didacticamente al ser un robot o varios, ubicado dentro de un mapa, el que realiza el algoritmo creado por programador.

                Este entorno ofrece la posibilidad de ademas de aprender lo ya mencionado también tiene la capacidad de trabajar con el paradigma de programación concurrente, ya que puede coexistir mas de un robot en el mismo mapa, de manera que el programa tendrá que estar preparado para esto si se usa mas de un robot.
                
                Sobre el mapa donde interactuan los robots este es una matriz de 100 filas y 100 columnas que simula una ciudad, llamándose calles a las filas y avenidas a las columnas. El extremo inferior izquierdo es la avenida 1, calle 1 y el extremo superior derecho es la avenida 100, calle 100.
                `,
            color: EMBED_COLOR,
        }],
        ephemeral: true
    },
    syntax: {
        embeds: [{
            title: `El lenguage r-Info tiene la siguiente sintaxis:`,
            fields: rInfoSintax.map(
                category => ({
                    name: category.displayName,
                    value: codeBlock(
                        category.keyWords
                            .map(keyWord => keyWord.replaceAll('[', '').replaceAll(']', ''))
                            .join(' ')
                    )
                })),
            color: EMBED_COLOR,
        }],
        ephemeral: true
    },
    web: {
        content: `Pagina para utilizar el entorno R-Info de manera online (no autirizada ni avalada por la facultad), cortesia de Los Compañeros\nhttps://j-josu.github.io/RobotScript/`,
        ephemeral: true
    },
    docs: {
        content: `Pagina con la documentacion sobre el lenguaje (no autirizada ni avalada por la facultad), cortesia de Los Compañeros\nhttps://j-josu.github.io/RobotScript/docs/language/`,
        ephemeral: true
    },
    extension: {
        content: `Extensión de Formato de Lenguaje R-Info para vs-cod y codium (versión libre y recomendada del mismo), cortesia de La Fuente\nhttps://github.com/laFuenteUNLP/lf-rinfo`,
        ephemeral: true
    },
} satisfies Record<string, InteractionReplyOptions>;


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const subcommand = interaction.options.getSubcommand(true);
            if (subcommand in constantResponse) {
                return interaction.reply(constantResponse[subcommand as keyof typeof constantResponse]);
            }

            if (subcommand === 'highlight') {
                const opt = interaction.options;
                const codeInput = opt.getString('code');

                return interaction.reply({
                    content: `Subcommand 'highlight' of command r-info has not been implemented yet`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: `unhandled subcommand '${subcommand}' of command r-info notify to an administrator or moderator`
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
