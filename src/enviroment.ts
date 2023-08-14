export const dev = process.env.RUNNING_ENVIROMENT === "development";


if (!process.env.BOT_TOKEN) {
    throw new Error("Required environment variable BOT_TOKEN is not set");
}
export const botToken = process.env.BOT_TOKEN;

if (!process.env.APPLICATION_ID) {
    throw new Error("Required environment variable APPLICATION_ID is not set");
}
export const applicationId = process.env.APPLICATION_ID;

if (!process.env.BOT_OWNER_ID) {
    console.warn("Warning: BOT_OWNER_ID is not set, could cause side effects");
}
export const botOwnerId = process.env.BOT_OWNER_ID;


if (!process.env.GUILD_ID) {
    throw new Error("Required environment variable GUILD_ID is not set");
}
export const guildId = process.env.GUILD_ID;

if (!process.env.GUILD_INVITE_CODE) {
    console.warn("Warning: GUILD_INVITE is not set, could cause side effects");
}
export const guildInviteCode = process.env.GUILD_INVITE_CODE;


export default {
    dev,
    botToken,
    applicationId,
    botOwnerId,
    guildId,
    guildInviteCode
};
