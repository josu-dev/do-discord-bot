import { SlashCommandBuilder } from 'discord.js';
import { SingleFileCommandDefinition } from '../+type.js';
import { checkBillboardEndpoint } from '../../plugins/scrapers/index.js';


export default (() => {
    return {
        data: new SlashCommandBuilder()
            .setName(`check-billboard`)
            .setDescription(`Checks if connection to billboard is ok`)
            .addBooleanOption(opt => opt
                .setName(`ephemeral`)
                .setDescription(`Sets the response as ephemeral, default true`)
            )
        ,
        async execute({ interaction }) {
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
            const result = await checkBillboardEndpoint();

            return interaction.reply({
                content: result.up ?
                    `The connection to the billboard is ok` :
                    result.threw ?
                        `Unexpected exeption, message: ${result.errorMessage}` :
                        `The billboard is pussibly down, request status: ${result.status}`,
                ephemeral: ephemeral
            });
        }
    };
}) satisfies SingleFileCommandDefinition;
