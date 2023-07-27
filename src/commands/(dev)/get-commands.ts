import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type';


// In order to stringuify the object must replace/implement toJSON of bigint object
// 
// (key, value) =>
// typeof value === 'bigint'
//     ? value.toString()
//     : value
// 
// @ts-expect-error
BigInt.prototype.toJSON = function () {
    return this.toString();
};


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName('get-commands')
            .setNameLocalization('es-ES', 'obtener-comandos')
            .setDescription('Get all commands in json format')
            .setDescriptionLocalization('es-ES', 'Obtiene todos los comandos en formato json')
        ,
        async execute({ client, interaction }) {
            await interaction.deferReply({ ephemeral: true, fetchReply: true });
            return interaction.editReply({
                content: 'succesfully sended the commands',
                files: [
                    new AttachmentBuilder(
                        Buffer.from(JSON.stringify(client.commands, null, 2), "utf-8"),
                        {
                            name: `commands.json`,
                            description: 'All commands to'
                        }
                    )
                ]
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
