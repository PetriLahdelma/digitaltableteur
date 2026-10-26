import { defineConfig } from "drizzle-kit";

/** Intake database migrations: `npx drizzle-kit generate --config drizzle.intake.config.ts`. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./app/lib/intake/db/schema.ts",
  out: "./app/lib/intake/db/migrations",
  dbCredentials: { url: process.env.INTAKE_DATABASE_DATABASE_URL_UNPOOLED ?? "" },
  strict: true,
});
