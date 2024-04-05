import "dotenv/config";
import type { Config } from "drizzle-kit";

// Path are relative to where the command is run (project root)

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    driver: "turso",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
} satisfies Config;
