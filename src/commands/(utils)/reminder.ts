import { italic, SlashCommandBuilder, userMention } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('reminder')
            .setNameLocalization('es-ES', 'recordatorio')
            .setDescription('Estable un mensaje para ser recordado pasado el lapso indicado')
            .addIntegerOption(opt => opt
                .setRequired(true)
                .setName('hs')
                .setDescription('Hours')
                .setDescriptionLocalization('es-ES', 'Horas')
                .setMinValue(0)
                .setMaxValue(60)
            )
            .addIntegerOption(opt => opt
                .setRequired(true)
                .setName('min')
                .setDescription('Minutes')
                .setDescriptionLocalization('es-ES', 'Minutos')
                .setMinValue(0)
                .setMaxValue(60)
            )
            .addIntegerOption(opt => opt
                .setRequired(true)
                .setName('sec')
                .setNameLocalization('es-ES', 'seg')
                .setDescription('Seconds')
                .setDescriptionLocalization('es-ES', 'Segundos')
                .setMinValue(0)
                .setMaxValue(60)
            )
            .addStringOption(opt => opt
                .setRequired(true)
                .setName('message')
                .setNameLocalization('es-ES', 'mensaje')
                .setDescription('Message to be remembered')
                .setDescriptionLocalization('es-ES', 'Mensaje a ser recordado')
                .setMinLength(4)
                .setMaxLength(511)
            )
        ,
        async execute({ client, interaction }) {
            const opt = interaction.options;
            const hs = opt.getInteger('hs', true);
            const min = opt.getInteger('min', true);
            const sec = opt.getInteger('sec', true);
            const message = opt.getString('message', true);
            const timeout = hs * 3_600_000 + min * 60_000 + sec * 1000;

            if (!hs && !min && !sec)
                return interaction.reply({
                    content: `No se puede crear un recordatorio con lapso de tiempo 0`,
                    ephemeral: true,
                });

            client.programTask({
                name: interaction.member.id + Date.now(),
                callback: () => interaction.channel?.send({
                    content: `${italic(userMention(interaction.member.id) + ', su recordatorio:')}\n${message}`,
                }),
                ms: timeout,
                args: []
            });

            return interaction.reply({
                content: `Se programo el recordatorio para dentro de ${(hs > 0 ? hs + 'hs ' : '') + (min > 0 ? min + 'min ' : '') + (sec > 0 ? sec + 's' : '')}`,
                ephemeral: true,
            });
        },
        permissions: []
    };
}) satisfies SingleFileCommandDefinition;
