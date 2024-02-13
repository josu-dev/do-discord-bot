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
    console["warn"]("[WARN] Enviroment variable BOT_OWNER_ID is not set, could cause side effects");
}
export const botOwnerId = process.env.BOT_OWNER_ID;


if (!process.env.GUILD_ID) {
    throw new Error("Required environment variable GUILD_ID is not set");
}
export const guildId = process.env.GUILD_ID;

if (!process.env.GUILD_INVITE_CODE) {
    console["warn"]("[WARN] Enviroment variable GUILD_INVITE is not set, could cause side effects");
}
export const guildInviteCode = process.env.GUILD_INVITE_CODE;


let _logLevel = 2;
if (!process.env.LOG_LEVEL) {
    console["warn"]("[WARN] Enviroment variable LOG_LEVEL is not set, defaulting to error level");
}
else {
    _logLevel = parseInt(process.env.LOG_LEVEL);
    if (isNaN(_logLevel) || _logLevel < -1) {
        console["warn"]("[WARN] LOG_LEVEL is not a valid number, defaulting to error level");
        _logLevel = 2;
    }
}
export const logLevel = _logLevel;


export default {
    dev,
    botToken,
    applicationId,
    botOwnerId,
    guildId,
    guildInviteCode,
    logLevel
};
