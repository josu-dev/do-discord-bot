import { Member } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DiscordAPIError, SlashCommandBuilder, userMention } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';
import { GUILD } from '../../botConfig';
import prisma from '../../db';
import { dev } from '../../enviroment';
import { log } from '../../lib/logging';


const VERIFIED_ROLE_ID = dev ? '1133933055422246914' : GUILD.ROLES.VERIFIED;

const commandData = new SlashCommandBuilder()
    .setName('verify-member')
    .setDescription('Verify a member as an student')
    .addUserOption(option => option
        .setName('member')
        .setDescription('Member to verify')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('dni')
        .setDescription('DNI of the member')
        .setMinLength(8)
        .setMaxLength(8)
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('legajo')
        .setDescription('Legajo of the member')
        .setMinLength(7)
        .setMaxLength(7)
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName('force')
        .setDescription('Force verification, even if the member already has the verified role')
        .setRequired(false)
    );


export default (() => {
    return {
        data: commandData,
        async execute({ interaction }) {
            const opts = interaction.options;
            const user = opts.getUser('member', true);
            const member = opts.getMember('member');
            const dni = opts.getString('dni', true).trim();
            const legajo = opts.getString('legajo', true).trim();
            const force = opts.getBoolean('force') ?? false;

            if (!/^\d+$/.test(dni)) {
                return interaction.reply({
                    content: `The dni must be a number`,
                    ephemeral: true,
                });
            }
            if (!/^\d{5}\/\d$/.test(legajo)) {
                return interaction.reply({
                    content: `The legajo must be in the format 12345/6`,
                    ephemeral: true,
                });
            }
            if (!member) {
                return interaction.reply({
                    content: `Member with id \`${user.id}\` not found`,
                    ephemeral: true,
                });
            }
            if (!force) {
                if (member.roles.resolve(VERIFIED_ROLE_ID)) {
                    return interaction.reply({
                        content: `Member with id \`${user.id}\` is already verified`,
                        ephemeral: true,
                    });
                }
            }

            await interaction.deferReply({
                ephemeral: true,
                fetchReply: true,
            });

            let dbMember: Member;
            try {
                dbMember = await prisma.member.create({
                    data: {
                        guild_id: interaction.guildId,
                        member_id: member.id,
                        dni: dni,
                        legajo: legajo,
                    }
                });
            }
            catch (error) {
                if (error instanceof PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        return interaction.editReply({
                            content: `A member with id \`${member.id}\` or dni \`${dni}\` or legajo \`${legajo}\` already is verified`,
                        });
                    }
                    return interaction.editReply({
                        content: `An error ocurred while trying to verify the member during the database update`
                    });
                }
                throw error;
            }

            try {
                await member.roles.add(VERIFIED_ROLE_ID);
            }
            catch (error) {
                if (error instanceof DiscordAPIError) {
                    log.error(`Manual verification on ${member.user.tag} failed, the bot couldn't assign the verified role. Payload: \nmember_id: ${member.id}\nlegajo: ${legajo}\ndni: ${dni}\nmember: ${JSON.stringify(member)}\nerror: ${JSON.stringify(error)}`);
                    return interaction.editReply({
                        content: `An error ocurred while trying to verify the member during the role assignment`
                    });
                }
                throw error;
            }

            return interaction.editReply({
                content: `Member ${userMention(member.id)} is now verified`,
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
