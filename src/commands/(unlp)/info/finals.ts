import { APIApplicationCommandOptionChoice, APIEmbed, SlashCommandSubcommandBuilder, codeBlock } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { INFORMATICA } from '../+skip.config';
import { addEphemeralOption } from '../../../lib/discordjs';


type FinalField = {
    inscriptionWeek: string,
    examsWeek: string,
    observations: string;
};

function prettifyFinal(final: FinalField) {
    return codeBlock('text', `Inscripcion: ${final.inscriptionWeek}\nExamenes: ${final.examsWeek}` + (final.observations !== '' ? `\nNota: ${final.observations}` : ''));
}

const monthFinalMap = new Map([
    ['january', undefined],
    ['february', {
        name: `february`,
        nameLocalizations: {
            "es-ES": `febrero`,
        },
        fields: [{
            name: `Febrero (1º)`,
            value: prettifyFinal({
                inscriptionWeek: `30/01 al 05/02`,
                examsWeek: `06/02 al 11/02`,
                observations: ``
            })
        }, {
            name: `Febrero (2º)`,
            value: prettifyFinal({
                inscriptionWeek: `15/02 al 21/02`,
                examsWeek: `22/02 al 28/02`,
                observations: `Inicia miércoles`
            })
        }]
    }],
    ['march', {
        name: "march",
        nameLocalizations: {
            "es-ES": "marzo"
        },
        fields: [
            {
                name: `Marzo`,
                value: prettifyFinal({
                    inscriptionWeek: `06/03 al 12/03`,
                    examsWeek: `13/03 al 18/03`,
                    observations: ``

                })
            }
        ]
    }],
    ['april', {
        name: "april",
        nameLocalizations: {
            "es-ES": "abril"
        },
        fields: [
            {
                name: `Abril`,
                value: prettifyFinal({

                    inscriptionWeek: `03/04 al 09/04`,
                    examsWeek: `10/04 al 15/04`,
                    observations: ``
                })
            }
        ]
    }],
    ['may', {
        name: "may",
        nameLocalizations: {
            "es-ES": "mayo"
        },
        fields: [
            {
                name: `Mayo`,
                value: prettifyFinal({
                    inscriptionWeek: `01/05 al 07/05`,
                    examsWeek: `08/05 al 13/05`,
                    observations: ``
                })
            }
        ]
    }],
    ['june', {
        name: "june",
        nameLocalizations: {
            "es-ES": "junio"
        },
        fields: [
            {
                name: `Junio`,
                value: prettifyFinal({
                    inscriptionWeek: `29/05 al 04/06`,
                    examsWeek: `05/06 al 10/06`,
                    observations: ``

                })
            }
        ]
    }],
    ['july', {
        name: "july",
        nameLocalizations: {
            "es-ES": "julio"
        },
        fields: [
            {
                name: `Julio`,
                value: prettifyFinal({
                    inscriptionWeek: `26/06 al 02/07`,
                    examsWeek: `03/07 al 08/07`,
                    observations: ``
                })
            }
        ]
    }],
    ['august', {
        name: "august",
        nameLocalizations: {
            "es-ES": "agosto"
        },
        fields: [
            {
                name: `Agosto`,
                value: prettifyFinal({
                    inscriptionWeek: `28/07 al 03/08`,
                    examsWeek: `04/08 al 10/08`,
                    observations: `Inicia viernes`
                })
            }
        ]
    }],
    ['september', {
        name: "september",
        nameLocalizations: {
            "es-ES": "septiembre"
        },
        fields: [
            {
                name: `Septiembre`,
                value: prettifyFinal({
                    inscriptionWeek: `28/08 al 03/09`,
                    examsWeek: `04/09 al 09/09`,
                    observations: ``
                })
            }
        ]
    }],
    ['october', {
        name: "october",
        nameLocalizations: {
            "es-ES": "octubre"
        },
        fields: [
            {
                name: `Octubre`,
                value: prettifyFinal({
                    inscriptionWeek: `28/09 al 05/10`,
                    examsWeek: `06/10 al 12/10`,
                    observations: `Inicia viernes`
                })
            }
        ]
    }],
    ['november', {
        name: "november",
        nameLocalizations: {
            "es-ES": "noviembre"
        },
        fields: [
            {
                name: `Noviembre`,
                value: prettifyFinal({
                    inscriptionWeek: `30/10 al 05/11`,
                    examsWeek: `06/11 al 11/11`,
                    observations: ``
                })
            }
        ]
    }],
    ['december', {
        name: "december",
        nameLocalizations: {
            "es-ES": "diciembre"
        },
        fields: [
            {
                name: `Diciembre (1º) (*)`,
                value: prettifyFinal({
                    inscriptionWeek: `22/11 al 28/11`,
                    examsWeek: `29/11 al 05/12`,
                    observations: `Inicia miércoles`
                })
            },
            {
                name: `Diciembre (2º) (*)`,
                value: prettifyFinal({
                    inscriptionWeek: `05/12 al 11/12`,
                    examsWeek: `12/12 al 18/12`,
                    observations: `Inicia martes`
                })
            }
        ]
    }],
]);


function setEmbedDefaults(embed: APIEmbed) {
    embed.color = INFORMATICA.embed.embedColorInt;
    if (embed.title?.toLowerCase().match('diciembre')) {
        embed.footer = {
            text: `(*) Los alumnos podrán rendir la misma asignatura SÓLO en uno de los dos llamados.`
        };
    }
    return embed;
}


const allFinalsEmbed = setEmbedDefaults({
    title: `MESA DE EXÁMENES FINALES 2023`,
    fields: []
});

const monthChoices: APIApplicationCommandOptionChoice<string>[] = [];

for (const final of monthFinalMap.values()) {
    if (!final) continue;
    monthChoices.push({
        name: final.name,
        name_localizations: final.nameLocalizations,
        value: final.name
    });
    allFinalsEmbed.fields!.push(
        ...final.fields
    );
}

const allFinalsReply: { embeds: APIEmbed[]; ephemeral: boolean; } = {
    embeds: [allFinalsEmbed],
    ephemeral: true
};

const commandData = new SlashCommandSubcommandBuilder()
    .setName(`finals`)
    .setNameLocalization(`es-ES`, `finales`)
    .setDescription(`Dates for the final tables`)
    .setDescriptionLocalization(`es-ES`, `Fechas para las mesas de finales`)
    .addStringOption(opt => opt
        .setName(`month`)
        .setNameLocalization(`es-ES`, `mes`)
        .setDescription(`Month of exam table`)
        .setDescriptionLocalization(`es-ES`, `Mes de la mesa de examen`)
        .setChoices(...monthChoices)
    );
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const month = interaction.options.getString('month');
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            if (!month) {
                allFinalsReply.ephemeral = ephemeral;
                return interaction.reply(allFinalsReply);
            }

            const final = monthFinalMap.get(month);
            if (!final) {
                return interaction.reply({
                    content: `No hay finales registrados para el mes '${month}'`,
                    ephemeral: ephemeral
                });
            }

            return interaction.reply({
                embeds: [setEmbedDefaults({
                    title: `MESA DE EXÁMENES FINAL ${final.nameLocalizations['es-ES'].toUpperCase()} 2023`,
                    fields: final.fields as any
                })],
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SubCommandDefinition;
