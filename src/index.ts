import * as dotenv from "dotenv";
dotenv.config();

import { CustomClient } from './core';
import { log } from './lib/logging';
import { initializeScrapers } from './plugins/scrapers';


const client = new CustomClient();

function exit() {
    client.destroy();
    log.core(`Terminated discord bot succesfully`);
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
//     .then(() => console['log']('Successfully deleted all guild commands.'))
//     .catch(console['error']);
// // for global commands
// rest.put(Routes.applicationCommands(applicationId), { body: [] })
//     .then(() => console['log']('Successfully deleted all application commands.'))
//     .catch(console['error']);
