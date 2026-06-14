import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load Next.js-style env files (.env.local takes precedence over .env).
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
