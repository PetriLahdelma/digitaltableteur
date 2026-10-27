#!/usr/bin/env node
/**
 * One-time link to register an admin passkey: `npm run intake:admin-enrol`.
 *
 * Production (default): pulls the production variables with the Vercel CLI
 * into a private temp file, reads only the intake database URL, deletes the
 * file, stores the SHA-256 of a fresh 256-bit token (valid 15 minutes) and
 * prints the link. Running it needs Vercel access to the project, which is
 * what makes it the recovery path when a passkey is lost (README 6a).
 *
 * Sandbox: `npm run intake:admin-enrol -- --local` asks the running
 * `npm run intake:dev` server for a link instead.
 */
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ENROLMENT_MINUTES = 15;
const SCOPE = "petri-lahdelmas-projects";
const ORIGIN = process.env.INTAKE_ORIGIN || "https://www.digitaltableteur.com";

if (process.argv.includes("--local")) {
  const port = process.env.PORT || "3002";
  const response = await fetch(`http://localhost:${port}/api/intake/dev/admin-enrol`, {
    method: "POST",
    headers: { origin: `http://localhost:${port}`, "content-type": "application/json" },
    body: "{}",
  }).catch(() => null);
  if (!response?.ok) {
    console.error(`No sandbox answered on port ${port}. Start it with npm run intake:dev.`);
    process.exit(1);
  }
  const { link } = await response.json();
  console.log(`Open within ${ENROLMENT_MINUTES} minutes:\n\n  ${link}\n`);
  process.exit(0);
}

function databaseUrl() {
  const dir = mkdtempSync(join(tmpdir(), "intake-enrol-"));
  const file = join(dir, "production.env");
  try {
    execFileSync("vercel", ["env", "pull", file, "--environment=production", "--yes", "--scope", SCOPE], { stdio: ["ignore", "ignore", "inherit"] });
    const line = readFileSync(file, "utf8")
      .split("\n")
      .find((entry) => entry.startsWith("INTAKE_DATABASE_DATABASE_URL_UNPOOLED="));
    return line?.slice(line.indexOf("=") + 1).replace(/^"|"$/g, "") || null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const url = databaseUrl();
if (!url) {
  console.error("INTAKE_DATABASE_DATABASE_URL_UNPOOLED is not set on Vercel production.");
  process.exit(1);
}

const { Pool } = await import("@neondatabase/serverless");
const pool = new Pool({ connectionString: url });
const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token, "utf8").digest("hex");
const expiresAt = new Date(Date.now() + ENROLMENT_MINUTES * 60 * 1000);
try {
  await pool.query("insert into intake_admin_enrolments (token_hash, expires_at) values ($1, $2)", [tokenHash, expiresAt]);
  await pool.query("insert into intake_audit_log (actor, action) values ('system', 'admin.enrolment.create')");
} finally {
  await pool.end();
}
console.log(`Open within ${ENROLMENT_MINUTES} minutes, on the device the passkey is for:\n\n  ${ORIGIN}/intake/admin/enrol#t=${token}\n`);
