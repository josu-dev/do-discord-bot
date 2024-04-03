import { bold, Invite, SlashCommandBuilder } from 'discord.js';
import { GUILD } from '../botConfig.js';
import { addEphemeralOption } from '../lib/discordjs.js';
import { SingleFileCommandDefinition } from './+type.js';


const commandData = new SlashCommandBuilder()
    .setName(`server-invite`)
    .setNameLocalization(`es-ES`, `invitacion-servidor`)
    .setDescription(`The invitation link to the server`)
    .setDescriptionLocalization(`es-ES`, `El enlace de invitación al servidor`);
addEphemeralOption(commandData);


let replyMessage = `Link de invitacion: ${bold(` https://discord.gg/${GUILD.INVITE.CODE} `)}\n\nCodigo: ${bold(GUILD.INVITE.CODE ?? 'No disponible')}\n** **`;


export default (() => {
    let inviteCode = GUILD.INVITE.CODE;

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
                replyMessage = `Link de invitacion: ${bold(` https://discord.gg/${inviteCode} `)}\n\nCodigo: ${bold(inviteCode)}\n** **`;
            }

            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

            return interaction.reply({
                content: replyMessage,
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
