import { SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('afk')
            .setDescription('Adds or removes "AFK" to the beginning of your name and mutes or unmutes you from the server')
            .setDescriptionLocalization('es-ES', 'Agrega o quita "AFK" al principio de tu nombre y te silencia o te des-silencia del servidor')
            .addBooleanOption(option => option
                .setName('state')
                .setDescription('Whether to activate or deactivate the afk mode')
                .setDescriptionLocalization('es-ES', 'Si activar o desactivar el modo afk')
            )
        ,
        async execute({ interaction }) {
            const { member } = interaction;
            if (!member.voice.channel)
                return interaction.reply({
                    content: 'Debes estar conectado a un canal de voz para usar el modo AFK',
                    ephemeral: true
                });

            const NICKNAME_INDICATOR = '!AFK ';

            const afkMode = interaction.options.getBoolean('state') ?? !member.voice.serverMute;

            if (interaction.guild.ownerId !== member.user.id) {
                let displayName = member.displayName;
                if (afkMode) {
                    if (!displayName.startsWith(NICKNAME_INDICATOR))
                        displayName = NICKNAME_INDICATOR + displayName;
                }
                else if (displayName.startsWith(NICKNAME_INDICATOR)) {
                    displayName = displayName.slice(NICKNAME_INDICATOR.length - 1);
                }

                member.setNickname(displayName);
            }

            await member.voice.setMute(afkMode, 'por modo afk');

            const message = afkMode ? `Modo AFK activado ;)` : `Modo AFK desactivado ;)`;

            return interaction.reply({
                content: message,
                ephemeral: true
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
