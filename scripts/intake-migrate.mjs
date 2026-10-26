/**
 * Applies the intake database migrations during Vercel production builds.
 *
 * The connection string is injected by the Neon integration as a sensitive
 * variable, so it never leaves Vercel. Skipped outside production builds and
 * when the variable is absent (local builds, previews). A failure is logged
 * loudly but does not fail the deploy: the rest of the site must not be held
 * hostage by the intake database, and intake routes check the schema before
 * serving.
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
  console.error("[intake-migrate] FAILED, intake stays unavailable until the next successful deploy:", error instanceof Error ? error.message : error);
} finally {
  await pool.end();
}
