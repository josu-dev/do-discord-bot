import { GUILD } from '../botConfig';
import { log } from '../lib/logging';
import type { EventDefinition } from './+type';


export default (() => {
    return {
        once: false,
        name: `guildMemberUpdate`,
        description: `Gives a default rol to a new member when agrees the server rules`,
        async response(client, oldMember, newMember) {
            if (oldMember.user.bot) {
                return;
            }

            if (!oldMember.pending || newMember.pending) {
                return;
            }

            newMember = await newMember.roles.add(GUILD.NEW_MEMBER.ROLES);

            log.info(`Succesfully given initial role to member:\n  id:${newMember.id}\n  tag:${newMember.user.tag}`);
        }
    };
}) satisfies EventDefinition<'guildMemberUpdate'>;
