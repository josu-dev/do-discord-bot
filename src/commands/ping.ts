import { inlineCode, SlashCommandBuilder } from 'discord.js';
import { dev } from '../enviroment.js';
import { log } from '../lib/logging.js';
import { SingleFileCommandDefinition } from './+type.js';


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Measures latency in ms')
            .setDescriptionLocalization('es-ES', 'Mide la latencia en ms')
            .addSubcommand(cmd => cmd
                .setName('server-bot')
                .setNameLocalization('en-US', 'servidor-bot')
                .setDescription('Latency from the server to the bot')
                .setDescriptionLocalization('es-ES', 'Latencia desde el servidor al bot')
            )
            .addSubcommand(cmd => cmd
                .setName('server-bot-server')
                .setNameLocalization('en-US', 'servidor-bot-servidor')
                .setDescription('Latency from the server to the bot and back to the server')
                .setDescriptionLocalization('es-ES', 'Latencia desde el servidor al bot y de vuelta al servidor')
            )
        ,
        async execute({ client, interaction }) {
            dev && log.info(`User '${interaction.member.displayName}' pinged`);

            if (interaction.options.getSubcommand() === 'server-bot') {
                return interaction.reply(inlineCode(`Latency server -> bot: ${client.ws.ping}ms`));
            }

            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
            return interaction.editReply(inlineCode(`Latency server -> bot -> server: ${sent.createdTimestamp - interaction.createdTimestamp}ms`));
        }
    };
}) satisfies SingleFileCommandDefinition;
