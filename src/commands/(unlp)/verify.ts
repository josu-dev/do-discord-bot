import { Member } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DiscordAPIError, SlashCommandBuilder } from 'discord.js';
import jsQR from "jsqr";
import { OPS, VerbosityLevel, getDocument } from 'pdfjs-dist';
import type { PDFDocumentProxy, TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { z } from 'zod';
import { SingleFileCommandDefinition } from '../+type';
import { GUILD } from '../../botConfig';
import prisma from '../../db';
import { dev } from '../../enviroment';
import { log } from '../../lib/logging';
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


const ARGENTINA_UTC_OFFSET = '-03:00' as const;

const VALID_CERTIFICATE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

const CERTIFICATE_IMAGE_QUANTITY = 2;

const QR_IMAGE_INDEX = 1;

// OLD VALIDATION_URL_RE
// const VALIDATION_URL_RE = new RegExp(`^https?://(www[.])?guarani-informatica.unlp.edu.ar/validador_certificados/\\d+\\s*$`);

// NEW VALIDATION_URL_RE
const VALIDATION_URL_RE = new RegExp(`^https?://(www[.])?autogestion.guarani.unlp.edu.ar/validador_certificados/\\d+/\\d+\\s*$`);

const VERIFIED_ROLE_ID = dev ? '1133933055422246914' : GUILD.ROLES.VERIFIED;


const pdfDateRE = /^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})([+\-]\d{2})?'(\d{2})'$/;

function parsePDFDate(pdfDate: string) {
    const match = pdfDateRE.exec(pdfDate);
    if (!match) {
        return undefined;
    }
    const [, year, month, day, hour, minute, second, offset, offsetMinutes] = match as unknown as [string, string, string, string, string, string, string, string, string];
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.000${offset}:${offsetMinutes}`);
}

const metadataDateSchema = z.string().transform((value, ctx) => {
    value = value.trim();
    if (!value.length) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid date format`,
            path: [],
        });
        return z.NEVER;
    }
    const date = parsePDFDate(value);
    if (!date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid date format`,
            path: [],
        });
        return z.NEVER;
    }
    return date;
});

const metadataSchema = z.object({
    info: z.object({
        ModDate: metadataDateSchema.optional(),
        CreationDate: metadataDateSchema.optional(),
    }).optional(),
});

async function getMetadata(pdf: PDFDocumentProxy) {
    const metadata = await pdf.getMetadata();
    const result = metadataSchema.safeParse(metadata);
    if (!result.success) {
        log.warn(`Malformed metadata: ${JSON.stringify(metadata)}`);
        return undefined;
    }
    if (!result.data.info) {
        log.warn(`Malformed metadata, expected info: ${JSON.stringify(metadata)}`);
        return undefined;
    }
    if (!result.data.info.ModDate && !result.data.info.CreationDate) {
        log.warn(`Malformed metadata, expected ModDate or CreationDate: ${JSON.stringify(metadata)}`);
        return undefined;
    }
    return result.data.info;
}


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            if (interaction.member.roles.resolve(VERIFIED_ROLE_ID)) {
                return interaction.reply({
                    content: `Ya estas verificado, no puedes verificarte de nuevo`,
                    ephemeral: true,
                });
            }

            await interaction.deferReply({ ephemeral: true, fetchReply: true });

            const certificate = interaction.options.getAttachment('regularity_certificate', true);

            log.info(`${interaction.member.displayName} started verification process.\n  Context:\n    member_id: ${interaction.member.id}\n    certificate_url: ${certificate.url}`);

            if (!certificate.url.endsWith('.pdf')) {
                return interaction.editReply({
                    content: `Formato de certificado invalido, debe ser PDF`,
                });
            }

            let pdf: PDFDocumentProxy;
            try {
                pdf = await getDocument({
                    url: certificate.url,
                    verbosity: VerbosityLevel.ERRORS
                }).promise;
            }
            catch (error) {
                return interaction.editReply({
                    content: `Ocurrio un error al procesar el certificado adjuntado`,
                });
            }

            const metadata = await getMetadata(pdf);
            if (!metadata) {
                return interaction.editReply({
                    content: `El certificado no cumple con el formato esperado`,
                });
            }

            const { CreationDate, ModDate } = metadata;
            if (!CreationDate && !ModDate) {
                return interaction.editReply({
                    content: `El certificado no cumple con el formato esperado`,
                });
            }

            const emitionDate = (CreationDate ?? ModDate)!.valueOf();

            if (Date.now() > (emitionDate + VALID_CERTIFICATE_DURATION)) {
                return interaction.editReply({
                    content: `El certificado adjuntado ya no es valido, intente con uno mas reciente`,
                });
            }

            const pdfPage = await pdf.getPage(1);

            const textContent = await pdfPage.getTextContent({ includeMarkedContent: false }) as unknown as Replace<TextContent, 'items', TextItem[]>;
            const text = textContent.items.map(item => item.str).join('\n');
            const textDNI = text.match(/DNI (\d{8})/i)?.[1];
            const textLegajo = text.match(/legajo Nro: (\d{5}\/\d)/i)?.[1];

            if (!textDNI || !textLegajo) {
                return interaction.editReply({
                    content: `El certificado no cumple con el formato esperado`,
                });
            }

            const operators = await pdfPage.getOperatorList();

            // this is for the paintImageXObject one, there are other ones, like the paintJpegImage which I assume should work the same way, this gives me the whole list of indexes of where an img was inserted
            const rawImgOperator: number[] = [];
            for (let i = 0; i < operators.fnArray.length; i++) {
                if (operators.fnArray[i] === OPS.paintImageXObject) {
                    rawImgOperator.push(i);
                }
            }

            if (rawImgOperator.length !== CERTIFICATE_IMAGE_QUANTITY) {
                return interaction.editReply({
                    content: `El certificado no cumple con el formato esperado`,
                });
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
                    const qrCode = jsQR(data, arg.width, arg.height, {});
                    if (!qrCode) {
                        return interaction.editReply({
                            content: `El certificado no cumple con el formato esperado`,
                        });
                    }

                    if (!VALIDATION_URL_RE.test(qrCode.data)) {
                        return interaction.editReply({
                            content: `El certificado no cumple con el formato esperado`,
                        });
                    }

                    const urlParts = qrCode.data.split('/');
                    const qrDNI = urlParts.at(-2)?.trim();
                    const qrCertificateCode = urlParts.at(-1)?.trim();
                    if (!qrDNI || !qrCertificateCode) {
                        log.info(`${interaction.member.user.tag} tried to verify with a certificate that doesn't have a dni or certificate code in the qr code. Payload: \nmember_id: ${interaction.member.id}\ncertificate_url: ${certificate.url}\nqr_code: ${qrCode.data}`);
                        return interaction.editReply({
                            content: `El certificado no cumple con el formato esperado`,
                        });
                    }

                    if (qrDNI !== textDNI) {
                        log.info(`${interaction.member.user.tag} tried to verify with an invalid certificate. Payload: \nmember_id: ${interaction.member.id}\ncertificate_url: ${certificate.url}\nqr_dni: ${qrDNI}\ntext_dni: ${textDNI}`);
                        return interaction.editReply({
                            content: `El certificado no cumple con el formato esperado`,
                        });
                    }

                    let member: Member;
                    try {
                        member = await prisma.member.create({
                            data: {
                                guild_id: interaction.guildId,
                                member_id: interaction.member.id,
                                legajo: textLegajo,
                                dni: textDNI,
                            }
                        });
                    }
                    catch (error) {
                        if (error instanceof PrismaClientKnownRequestError) {
                            if (error.code === 'P2002') {
                                return interaction.editReply({
                                    content: `Ya estas verificado o tus credenciales ya fueron usadas, contacta a un administrador si crees que esto es un error`,
                                });
                            }
                            return interaction.editReply({
                                content: `Ocurrio un error con la db al verificar tu cuenta, intenta nuevamente mas tarde`,
                            });
                        }
                        throw error;
                    }

                    try {
                        await interaction.member.roles.add(VERIFIED_ROLE_ID);
                    }
                    catch (error) {
                        if (error instanceof DiscordAPIError) {
                            log.error(`${interaction.member.user.tag} tried to verify but the bot couldn't assign the verified role. Payload: \nmember_id: ${interaction.member.id}\ncertificate_url: ${certificate.url}\nlegajo: ${textLegajo}\ndni: ${textDNI}\nmember: ${JSON.stringify(member)}\nerror: ${JSON.stringify(error)}`);
                            return interaction.editReply({
                                content: `Ocurrio un error al asignarte el rol verificado, contacta a un administrador y dale el siguiente id: '${member.id}' para que te lo asigne manualmente `,
                            });
                        }
                        throw error;
                    }

                    return interaction.editReply({
                        content: `Te has verificado exitosamente`,
                    });
                }
            );
        }
    };
}) satisfies SingleFileCommandDefinition;
