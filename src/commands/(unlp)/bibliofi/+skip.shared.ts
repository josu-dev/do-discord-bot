import { APIEmbed, bold, hideLinkEmbed, hyperlink, italic } from 'discord.js';
import { INFORMATICA } from '../+skip.config';


export function setEmbedDefaults(embed: APIEmbed) {
    embed.color = INFORMATICA.embed.embedColorInt;
    return embed;
}

export type LinksGroup = {
    name: string,
    links: {
        name: string,
        url: string,
        shortDesc?: string;
    }[];
};

export function embedFromLinksGroups(title: string, groups: LinksGroup[]) {
    const fields: Exclude<APIEmbed['fields'], undefined> = [];
    for (let i = 0; i < groups.length; i++) {
        const { name, links } = groups[i]!;

        fields.push({
            name: name[0]!.toUpperCase() + name.slice(1),
            value: links.reduce(
                (prev, { name, url, shortDesc }) =>
                    `${prev}  ${bold(`${hyperlink(name, hideLinkEmbed(url))}`)}\n${italic(shortDesc ?? '')}\n`,
                ''
            ) + (i < (groups.length - 1) ? italic('\n ') : ''),
        });
    }

    return setEmbedDefaults({
        title: title,
        fields: fields
    });
}
