/**
 * Applies the intake database migrations during Vercel production builds.
 *
 * The connection string is injected by the Neon integration as a sensitive
 * variable, so it never leaves Vercel. Skipped outside production builds and
 * when the variable is absent (local builds, previews). A failure fails the
 * build: new code against the old schema would break every intake route,
 * while a failed build leaves the previous deployment (and its matching
 * schema) serving. Drizzle applies all pending migrations in one
 * transaction, so a failure leaves the schema as it was.
 */
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

const url = process.env.INTAKE_DATABASE_DATABASE_URL_UNPOOLED;
const isProductionBuild = process.env.VERCEL_ENV === "production";

if (!isProductionBuild || !url) {
  console.log(`[intake-migrate] skipped (${isProductionBuild ? "no database URL" : `VERCEL_ENV=${process.env.VERCEL_ENV ?? "local"}`})`);
  process.exit(0);
}

const pool = new Pool({ connectionString: url });
try {
  await migrate(drizzle({ client: pool }), { migrationsFolder: "app/lib/intake/db/migrations" });
  console.log("[intake-migrate] migrations applied");
} catch (error) {
  console.error("[intake-migrate] FAILED, the build stops and the previous deployment keeps serving:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
