declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TS_NODE_DEV: string | undefined;
            enviromentIsDev: string;
            enviromentIsProd: string;

            botToken: string;
            applicationId: string;

            guildId: string;
        }
    }
}

export { };
