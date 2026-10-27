#!/usr/bin/env node
/**
 * One-time link to register an admin passkey: `npm run intake:admin-enrol`.
 *
 * Production (default): asks the Neon CLI for the intake database's direct
 * connection string (held in memory only, never written to disk or printed),
 * stores the SHA-256 of a fresh 256-bit token (valid 15 minutes) and prints
 * the link. Running it needs a Neon login with access to the intake project
 * (`npx neonctl auth`), which is what makes it the recovery path when a
 * passkey is lost (README 6a). Vercel cannot be used for this: the intake
 * variables are marked sensitive, so `vercel env pull` returns them empty.
 * Using the link emails the owner, so an unexpected enrolment is noticed.
 *
 * Sandbox: `npm run intake:admin-enrol -- --local` asks the running
 * `npm run intake:dev` server for a link instead.
 */
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";

const ENROLMENT_MINUTES = 15;
const NEONCTL = "neonctl@8.13.1";
// Not secrets: reading the project still needs a Neon login.
const NEON_PROJECT = process.env.INTAKE_NEON_PROJECT_ID || "dry-rice-95767528";
const NEON_ORG = process.env.INTAKE_NEON_ORG_ID || "org-silent-dream-93993337";
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
  try {
    const url = execFileSync(
      "npx",
      ["-y", NEONCTL, "connection-string", "--project-id", NEON_PROJECT, "--org-id", NEON_ORG],
      { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" },
    ).trim();
    return url.startsWith("postgres") ? url : null;
  } catch {
    return null;
  }
}

const url = databaseUrl();
if (!url) {
  console.error(`Could not get the intake database from Neon. Sign in with \`npx ${NEONCTL} auth\` and try again.`);
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
