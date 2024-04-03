import { SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type.js';


export default (() => {
    const NICKNAME_INDICATOR = '!AFK ';
    const ACTIONS_REASON = 'By AFK mode';

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
            if (!member.voice.channel) {
                return interaction.reply({
                    content: 'Debes estar conectado a un canal de voz para usar el modo AFK',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

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

                await member.setNickname(displayName, ACTIONS_REASON);
            }

            await member.voice.setMute(afkMode, ACTIONS_REASON);

            const message = afkMode ? `Modo AFK activado 😉` : `Modo AFK desactivado 😉`;

            return interaction.editReply({
                content: message
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
