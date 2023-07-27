import { SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
import type { TextItem, TextContent, PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import jsQR from "jsqr";
import * as cheerio from 'cheerio';
import { Replace } from '../../lib/utilType';


const commandData = new SlashCommandBuilder()
    .setName(`verify`)
    .setNameLocalization(`es-ES`, `verificar`)
    .setDescription(`Verifies that you are a student of the university`)
    .setDescriptionLocalization(`es-ES`, `Verifica que eres un estudiante de la universidad`)
    .addAttachmentOption(opt => opt
        .setRequired(true)
        .setName('regularity_certificate')
        .setNameLocalization(`es-ES`, `certificado_regularidad`)
        .setDescription('Regularidad certificate in PDF format')
        .setDescriptionLocalization(`es-ES`, `Certificado de regularidad en formato PDF`)
    );


const VALID_CERTIFICATE_DURATION = 4 * 60 * 60 * 1000;

const QR_IMAGE_INDEX = 1;

const VALIDATION_URL = `https://guarani-informatica.unlp.edu.ar/validador_certificados/validar`;


async function validateCertificate(code: string) {
    const response = await fetch(
        VALIDATION_URL,
        {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "content-type": "application/x-www-form-urlencoded",
            },
            "body": `codigo_valid=${code}&validar=Validar`,
            "method": "POST"
        }
    );
    if (response.status !== 200) {
        return {
            valid: false,
            status: response.status,
            text: undefined
        } as const;
    }

    const text = await response.text();

    return {
        valid: true,
        status: response.status,
        text: text
    } as const;
}


const legajoRegex = /legajo n\u00famero (\d+\/\d)/;
const dniRegex = /DNI (\d+)/;
const isRegularRegex = /El alumno es regular/;

function parseHTML(html: string) {
    const $ = cheerio.load(html);
    const script = $('body script').get()[0];
    if (!script) {
        return {
            isRegular: false,
        } as const;
    }
    const text = script.children[0];
    if (!text || !('data' in text) || typeof text.data !== 'string') {
        return {
            isRegular: false,
        } as const;
    }
    const rawData = text.data.match(/on_arrival\((.*)\);/)?.[1];
    if (!rawData) {
        return {
            isRegular: false,
        } as const;
    }
    const obj = JSON.parse(rawData);
    const htmlContent = (obj.content ?? '') as string;
    if (!isRegularRegex.test(htmlContent)) {
        return {
            isRegular: false,
        } as const;
    }

    const legajo = htmlContent.match(legajoRegex)?.[1];
    const dni = htmlContent.match(dniRegex)?.[1];

    return {
        isRegular: true,
        legajo: legajo,
        dni: dni,
    } as const;
}


// https://es.wikipedia.org/wiki/Hora_oficial_argentina#:~:text=La%20hora%20oficial%20argentina%20(HOA,2007%20vigente%20a%20la%20fecha.

const ARGENTINA_UTC_OFFSET = '-03:00' as const;

// https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone

function reconstructARGDate(rawDate: string) {
    const [date, time] = rawDate.split(' ');
    const [day, month, year] = date!.split('/');
    const [hour, minute, second] = time!.split(':');
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.000${ARGENTINA_UTC_OFFSET}`);
}


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            await interaction.deferReply({ ephemeral: true, fetchReply: true });

            const certificate = interaction.options.getAttachment('regularity_certificate', true);

            const pdf: PDFDocumentProxy = await pdfjsLib.getDocument(certificate.url).promise;

            const pdfPage = await pdf.getPage(1);

            const textContent = await pdfPage.getTextContent({ includeMarkedContent: false }) as unknown as Replace<TextContent, 'items', TextItem[]>;

            const emitionDate = reconstructARGDate(textContent.items.at(-1)?.str!).valueOf();

            if (Date.now() > (emitionDate + VALID_CERTIFICATE_DURATION)) {
                return interaction.editReply({
                    content: `Certificate expired, please request a new one and use it within 4 hours`,
                });
            }

            const operators = await pdfPage.getOperatorList();

            // this is for the paintImageXObject one, there are other ones, like the paintJpegImage which I assume should work the same way, this gives me the whole list of indexes of where an img was inserted
            const rawImgOperator: number[] = [];
            for (let i = 0; i < operators.fnArray.length; i++) {
                if (operators.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                    rawImgOperator.push(i);
                }
            }

            // now you need the filename, in this example I just picked the first one from my array, your array may be empty, but I knew for sure in page 7 there was an image... in your actual code you would use loops, such info is in the argsArray, the first arg is the filename, second arg is the width and height, but the filename will suffice here
            const filename = operators.argsArray[rawImgOperator[QR_IMAGE_INDEX]!][0];

            // now we get the object itself from page.objs using the filename
            // doesnt return a promise like object, cant be awaited
            pdfPage.objs.get(
                filename,
                async (arg: { data: Uint8ClampedArray, width: number, height: number; }) => {
                    // now you need a new clamped array because the original one, may not contain rgba data, and when you insert you want to do so in rgba form, I think that a simple check of the size of the clamped array should work, if it's 3 times the size aka width*height*3 then it's rgb and shall be converted, if it's 4 times, then it's rgba and can be used as it is; in my case it had to be converted, and I think it will be the most common case
                    const data = new Uint8ClampedArray(arg.width * arg.height * 4);
                    let k = 0;
                    let i = 0;
                    while (i < arg.data.length) {
                        data[k] = arg.data[i]!; // r
                        data[k + 1] = arg.data[i + 1]!; // g
                        data[k + 2] = arg.data[i + 2]!; // b
                        data[k + 3] = 255; // a

                        i += 3;
                        k += 4;
                    }

                    // https://github.com/cozmo/jsQR
                    const qrCode = jsQR(data, arg.width, arg.height);
                    if (!qrCode) {
                        return interaction.editReply({
                            content: `QR Code not found`,
                        });
                    }

                    const certificateCode = (qrCode.chunks.at(-1) as any).text;

                    const validationResult = await validateCertificate(certificateCode);
                    if (!validationResult.valid) {
                        return interaction.editReply({
                            content: `Error ${validationResult.status}`,
                        });
                    }

                    const parseResult = parseHTML(validationResult.text);

                    return interaction.editReply({
                        content: `Successfully verified\n\`\`\`json\n${JSON.stringify(parseResult, null, 2)}\n\`\`\``,
                    });
                }
            );
        }
    };
}) satisfies SingleFileCommandDefinition;
