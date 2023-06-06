import { APIEmbed, SlashCommandSubcommandBuilder, bold, hideLinkEmbed, hyperlink, italic } from 'discord.js';
import { SubCommandDefinition } from './+command';
import { addEphemeralOption } from '../../../lib/discordjs';
import { INFORMATICA } from '../+skip.config';


type LinksGroup = {
    name: string,
    links: {
        name: string,
        url: string,
        shortDesc?: string;
    }[];
};

function embedFromLinks(groups: LinksGroup[]) {
    const fields: Exclude<APIEmbed['fields'], undefined> = [];
    for (let i = 0; i < groups.length; i++) {
        const { name, links } = groups[i]!;

        fields.push({
            name: name[0]!.toUpperCase() + name.slice(1),
            value: links.reduce(
                (prev, { name, url, shortDesc }) =>
                    `${prev} ${bold(`${hyperlink(name, hideLinkEmbed(url))}`)} ${italic(shortDesc ?? ' ')}\n`,
                ''
            ),
        });
    }

    return {
        title: `Paginas oficiales de la biblioteca`,
        fields: fields,
        color: INFORMATICA.embed.embedColorInt,
        footer: {
            text: `Correo oficial: biblioteca@info.unlp.edu.ar`
        }
    };
}

const sitesReply = {
    embeds: [embedFromLinks([
        {
            name: `general`,
            links: [
                {
                    name: `Home`,
                    url: `https://biblioteca.info.unlp.edu.ar/`,
                },
                {
                    name: `Catalogo online`,
                    url: `http://catalogo.info.unlp.edu.ar/`,
                },
                {
                    name: `Formulario de consulta`,
                    url: `https://docs.google.com/forms/d/e/1FAIpQLSeXTYsk1ZTWLnEphmyeJ49DwNHXEaW3XLWh4ZsfvvxclUE9VA/viewform`,
                },
            ]
        },
        {
            name: `redes`,
            links: [
                {
                    name: `Instagram`,
                    url: `https://www.instagram.com/bibliofi_unlp/`,
                },
                {
                    name: `Twitter`,
                    url: `https://twitter.com/BiblioFI_UNLP`,
                },
                {
                    name: `Facebook`,
                    url: `https://www.facebook.com/biblioInfo`,
                }
            ]
        },
    ])],
    ephemeral: true
};


const commandData = new SlashCommandSubcommandBuilder()
    .setName(`sites`)
    .setNameLocalization(`es-ES`, `paginas`)
    .setDescription(`Official sites of the library`)
    .setDescriptionLocalization(`es-ES`, `Sitios oficiales de la biblioteca`);
addEphemeralOption(commandData);


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            sitesReply.ephemeral = ephemeral;

            return interaction.reply(sitesReply);
        }
    };
}) satisfies SubCommandDefinition;
