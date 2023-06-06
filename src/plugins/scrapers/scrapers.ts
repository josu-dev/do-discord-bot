import { GuildBasedChannel, Message, hideLinkEmbed, hyperlink } from 'discord.js';
import { NOTIFICATIONS } from './config';
import { BillboardScraper } from './gestiondocente/billboardScraper';
import { ExtendedClient } from '../../core/client';
import { TaskSchedulerTrait } from '../../globalTypes';


const billboardNotificacionsChannel = process.env.enviromentIsDev === 'true' ? '1081266737019900045' : '1075770845487710298';

const billboard = new BillboardScraper();


function idFromBillboardMessage(message?: Message<true>) {
    if (!message || !message.embeds[0]) return undefined;

    const { title, footer } = message.embeds[0];
    const cathedra = title?.split('|')[0]?.trim();
    const creationDate = footer?.text?.split('-')[1]?.trim();
    return !cathedra || !creationDate ? undefined : cathedra + creationDate;
}

async function fetchLastMessageId(channel: GuildBasedChannel) {
    if (!channel.isTextBased()) return undefined;
    const lastMessage = (await channel.messages.fetch({ limit: 1 }).then(messages => messages.first()).catch((e) => { console.error(e); return undefined; }));
    return idFromBillboardMessage(lastMessage);
}


export async function initializeScrapers(client: ExtendedClient): Promise<void> {
    billboard.onUpdate(async (messages) => {
        const channel = client.guilds.cache.get(process.env.guildId!)?.channels.cache.get(billboardNotificacionsChannel);
        if (!channel?.isTextBased()) return;

        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i]!;
            if (message.canceled) continue;

            await channel.send({
                embeds: [{
                    author: {
                        name: `Cartelera | Gestion Docente`,
                        icon_url: `https://www.info.unlp.edu.ar/wp-content/uploads/2019/07/logoo-300x300.jpg`,
                        url: `https://gestiondocente.info.unlp.edu.ar/cartelera/#form[materia]=&`,
                    },
                    title: `${message.cathedra} | ${message.title}`,
                    description: message.content,
                    fields: message.attachments.map((attachment, index) => ({
                        name: `Adjunto ${index + 1}`,
                        value: hyperlink(attachment.name, hideLinkEmbed(attachment.publicUrl ?? 'error con el link'))
                    })),
                    footer: {
                        text: `${message.author} - ${message.creationDate}`
                    },
                    color: NOTIFICATIONS.gestiondocente.embedColorInt,
                }]
            });
        }
    });

    client.on('ready', async (client) => {
        const channel = client.guilds.cache.get(process.env.guildId!)?.channels.cache.get(billboardNotificacionsChannel);
        let id: string | undefined;
        if (channel) {
            id = await fetchLastMessageId(channel);
        }
        billboard.start(id);
    });

    client.scheduleTask({
        name: 'scrap-gestiondocente',
        callback: billboard.update.bind(billboard),
        interval: 20 * 60 * 1000,
        args: [],
    });
}


export type NotificationListener<T extends Record<string, any> = {}> = (content: T) => void;

export interface NotifierTrait {
    update(): Promise<void>;
    start(): Promise<void>;
    end(): Promise<void>;
    onUpdate(listener: NotificationListener): void;
}

export interface NotifierTrait {
    scheduleTask<C extends (...args: A) => void, A extends any[]>(taskManager: TaskSchedulerTrait<C, A>): void;
}
