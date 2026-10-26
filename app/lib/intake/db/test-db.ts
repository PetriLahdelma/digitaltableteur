import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import type { IntakeDb } from "./client";
import * as schema from "./schema";

const MIGRATIONS = join(process.cwd(), "app", "lib", "intake", "db", "migrations");

/** A fresh in-process Postgres with the real intake migrations applied. Tests only. */
export async function createTestIntakeDb(): Promise<{ db: IntakeDb; pg: PGlite }> {
  const pg = new PGlite();
  for (const file of readdirSync(MIGRATIONS).filter((name) => name.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(join(MIGRATIONS, file), "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  return { db: drizzle({ client: pg, schema }) as unknown as IntakeDb, pg };
}
