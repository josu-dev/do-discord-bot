import { GuildMember, SlashCommandBuilder, roleMention, userMention } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
import { log } from '../../lib/logging';


const commandData = new SlashCommandBuilder()
    .setName(`set-role`)
    .setNameLocalization(`es-ES`, `asignar-rol`)
    .setDescription(`Adds/removes a role to a member/s`)
    .setDescriptionLocalization(`es-ES`, `Agrega/elimina un rol a un miembro/s`)
    .addRoleOption(option => option
        .setName(`role`)
        .setNameLocalization(`es-ES`, `rol`)
        .setDescription(`Role to add`)
        .setDescriptionLocalization(`es-ES`, `Rol a agregar`)
        .setRequired(true)
    )
    .addUserOption(option => option
        .setName(`member`)
        .setNameLocalization(`es-ES`, `miembro`)
        .setDescription(`Member to add the role`)
        .setDescriptionLocalization(`es-ES`, `Miembro al que agregar el rol`)
    )
    .addRoleOption(option => option
        .setName(`members_with_role`)
        .setNameLocalization(`es-ES`, `miembros_con_rol`)
        .setDescription(`Add the role to all members with this role`)
        .setDescriptionLocalization(`es-ES`, `Agregar el rol a todos los miembros con este rol`)
    )
    .addBooleanOption(option => option
        .setName(`remove`)
        .setNameLocalization(`es-ES`, `remover`)
        .setDescription(`Remove the role instead of adding it, default false`)
        .setDescriptionLocalization(`es-ES`, `Remover el rol en lugar de agregarlo, por defecto false`)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            await interaction.deferReply({ ephemeral: true, fetchReply: true });

            const isRemove = interaction.options.getBoolean('remove') ?? false;
            const roleToSet = interaction.options.getRole('role', true);
            const targetMember = interaction.options.getMember('member');
            const targetRole = interaction.options.getRole('members_with_role');

            if (!targetMember && !targetRole) {
                return interaction.editReply(
                    `You must provide a member or a role to add the role to`,
                );
            }
            if (targetMember && targetRole) {
                return interaction.editReply(
                    `You can't provide both a member and a role to add the role to`,
                );
            }

            let members: Iterable<GuildMember>;
            if (targetMember) {
                members = [targetMember];
            }
            else {
                members = interaction.guild.members.cache.filter(member => member.roles.cache.has(targetRole!.id)).values();
            }

            const promises: Promise<GuildMember>[] = [];
            for (const member of members) {
                if (isRemove) {
                    promises.push(member.roles.remove(roleToSet));
                }
                else {
                    promises.push(member.roles.add(roleToSet));
                }
            }

            const membersWithRol = await Promise.all(promises).catch(error => {
                log.error(`An error ocurred while trying to ${isRemove ? 'remove' : 'add'} the role ${roleMention(roleToSet.id)}: ${error}`);
                return undefined;
            });

            if (!membersWithRol) {
                return interaction.editReply(
                    `An error ocurred while trying to ${isRemove ? 'remove' : 'add'} the role ${roleMention(roleToSet.id)}`,
                );
            }

            return interaction.editReply(
                `Role ${roleMention(roleToSet.id)} ${isRemove ? 'removed' : 'added'} to ${membersWithRol.length} members: \n${membersWithRol.map(member => userMention(member.id)).join(', ')}`,
            );
        }
    };
}) satisfies SingleFileCommandDefinition;
