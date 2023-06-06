import { bold, Invite, SlashCommandBuilder } from 'discord.js';
import { InteractionReply, SingleFileCommandDefinition } from './+type';
import { addEphemeralOption } from '../lib/discordjs';
import { CLIENT, GUILD } from '../globalConfigs';


const commandData = new SlashCommandBuilder()
    .setName(`server-invite`)
    .setNameLocalization(`es-ES`, `invitacion-servidor`)
    .setDescription(`The invitation link to the server`)
    .setDescriptionLocalization(`es-ES`, `El enlace de invitación al servidor`);
addEphemeralOption(commandData);

const reply = {
    embeds: [{
        color: GUILD.EMBED.COLOR_INT,
        description: `Link de invitacion: ${bold(GUILD.INVITE.URL)}\n\nCodigo: **${bold(GUILD.INVITE.CODE)}**`,
        title: `Invitacion al Servidor`,
        thumbnail: {
            url: ``
        }
    }],
    ephemeral: true as boolean
} satisfies InteractionReply;


export default (() => {
    let inviteCode: string | undefined = CLIENT.SINGLE_GUILD ? GUILD.INVITE.CODE : undefined;
    return {
        data: commandData,
        async execute({ interaction }) {
            if (!inviteCode) {
                const invites = await interaction.guild.invites.fetch();
                let valid: Invite | undefined;
                let minTimeStamp = Date.now();
                for (const invite of invites.values()) {
                    if (invite.temporary || invite.maxAge !== 0 || invite.maxUses !== 0 || invite.createdTimestamp! > minTimeStamp) {
                        continue;
                    }
                    minTimeStamp = invite.createdTimestamp!;
                    valid = invite;
                }
                if (!valid) {
                    return interaction.reply({
                        content: `No hay invitaciones registradas en el servidor`,
                        ephemeral: true
                    });
                }
                inviteCode = valid.code;
                reply.embeds[0].description = `Link de invitacion: ${bold(`https://discord.gg/${inviteCode}`)}\n\nCodigo: **${bold(inviteCode)}**`;
            }

            reply.ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            const guildIconURL = interaction.guild.iconURL();
            if (guildIconURL) {
                reply.embeds[0].thumbnail.url = guildIconURL;
            }

            return interaction.reply(reply);
        }
    };
}) satisfies SingleFileCommandDefinition;
