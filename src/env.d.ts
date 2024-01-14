declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TS_NODE_DEV: string | undefined;
            RUNNING_ENVIROMENT: 'development' | 'production' | (string & {}) | undefined;

            BOT_TOKEN: string | undefined;
            APPLICATION_ID: string | undefined;
            BOT_OWNER_ID: string | undefined;

            GUILD_ID: string | undefined;
            GUILD_INVITE_CODE: string | undefined;

            LOG_LEVEL: string | undefined;
        }
    }
}

export { };
