// Replace with './+type' as the path when copying
import { EventDefinition } from './type';


export default (() => {
    return {
        once: false,
        name: `guildMemberAdd`,
        description: `Gives a default rol to a new member when agrees the server rules`,
        async response(client, member) {
            console.log(`New member:\n  id:${member.id}\n  tag:${member.user.tag}`);
        }
    };
}) satisfies EventDefinition<'guildMemberAdd'>;
