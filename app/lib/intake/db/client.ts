import { Pool } from "@neondatabase/serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

/** Any Drizzle Postgres database over the intake schema (Neon in production, PGlite in tests). */
export type IntakeDb = PgDatabase<PgQueryResultHKT, typeof schema>;

let pool: Pool | null = null;
let db: IntakeDb | null = null;

/**
 * The production database. Uses the pooled WebSocket driver so the intake
 * services can run transactions (submit, code redemption). Server only.
 */
export function getIntakeDb(): IntakeDb {
  if (db) return db;
  const url = process.env.INTAKE_DATABASE_URL;
  if (!url) throw new Error("INTAKE_DATABASE_URL is not set");
  pool = new Pool({ connectionString: url });
  db = drizzle({ client: pool, schema }) as unknown as IntakeDb;
  return db;
}
