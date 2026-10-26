import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { IntakeDb } from "./client";
import * as schema from "./schema";

/**
 * Local development only: a file-backed PGlite database, so the whole intake
 * flow can be walked in a browser without touching Neon or production keys.
 *
 * The modules load through a runtime-computed specifier, which the bundler
 * and the file tracer cannot follow: PGlite (a devDependency with a WASM
 * build) never lands in a production function.
 */
const load = (specifier: string) => import(/* webpackIgnore: true */ /* turbopackIgnore: true */ specifier);

const MIGRATIONS = join(process.cwd(), "app", "lib", "intake", "db", "migrations");

type DevGlobal = typeof globalThis & { __intakeDevDb?: Promise<IntakeDb> };

export function devIntakeDb(dataDir: string): Promise<IntakeDb> {
  if (process.env.NODE_ENV === "production") throw new Error("The PGlite intake database is for local development only");
  const global = globalThis as DevGlobal;
  global.__intakeDevDb ??= (async () => {
    const [{ PGlite }, { drizzle }] = await Promise.all([load(["@electric-sql", "pglite"].join("/")), load(["drizzle-orm", "pglite"].join("/"))]);
    const fresh = !existsSync(dataDir);
    const pg = new PGlite(dataDir);
    if (fresh) {
      for (const file of readdirSync(MIGRATIONS).filter((name) => name.endsWith(".sql")).sort()) {
        for (const statement of readFileSync(join(MIGRATIONS, file), "utf8").split("--> statement-breakpoint")) {
          if (statement.trim()) await pg.exec(statement);
        }
      }
    }
    return drizzle({ client: pg, schema }) as IntakeDb;
  })();
  return global.__intakeDevDb;
}
