import * as dotenv from "dotenv";
dotenv.config();

import { CustomClient } from './core';
import { logWithTime } from './lib';
import { initializeScrapers } from './plugins/scrapers';


const client = new CustomClient();

function exit() {
    if (!client) {
        logWithTime(`unexpected invalid/nonexistent client when terminating discord bot`);
        process.exit(1);
    }
    client.destroy();
    logWithTime(`terminated discord bot`);
    process.exit(0);
}

process.on('SIGINT', exit);
process.on('SIGTERM', exit);

(async () => {
    await client.start();
    await initializeScrapers(client);
})();


export { };

// // To delete commands?
// import { REST, Routes } from 'discord.js';
// import { applicationId, botToken, guildId } from './enviroment';

// const rest = new REST({ version: '10' }).setToken(botToken);
// rest.put(Routes.applicationGuildCommands(applicationId, guildId), { body: [] })
//     .then(() => console.log('Successfully deleted all guild commands.'))
//     .catch(console.error);
// // for global commands
// rest.put(Routes.applicationCommands(applicationId), { body: [] })
//     .then(() => console.log('Successfully deleted all application commands.'))
//     .catch(console.error);
