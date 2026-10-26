#!/usr/bin/env node
/**
 * Local intake sandbox: `npm run intake:dev`.
 *
 * Starts `next dev` on port 3002 with a file-backed PGlite database in
 * .intake-dev/, development-only keys and mail printed to the console, so
 * the client flow can be walked end to end without Neon, Resend or any
 * production secret. Create an invite with:
 *
 *   curl -s localhost:3002/api/intake/dev/invite -H 'content-type: application/json' \
 *     -H 'origin: http://localhost:3002' \
 *     -d '{"email":"you@example.test","name":"Test","questionnaireId":"client-brand-discovery","locale":"en"}'
 *
 * The invite link and sign-in codes appear in this terminal.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const port = process.env.PORT || "3002";
const dir = join(process.cwd(), ".intake-dev");
mkdirSync(dir, { recursive: true });

const keysFile = join(dir, "keys.json");
if (!existsSync(keysFile)) {
  const keys = { data: `dev1:${randomBytes(32).toString("base64")}`, hmac: randomBytes(32).toString("base64") };
  writeFileSync(keysFile, JSON.stringify(keys), { mode: 0o600 });
}
const keys = JSON.parse(readFileSync(keysFile, "utf8"));

const child = spawn("npx", ["next", "dev", "--port", port], {
  stdio: "inherit",
  env: {
    ...process.env,
    INTAKE_DATABASE_DATABASE_URL: `pglite:${join(dir, "db")}`,
    INTAKE_DATA_KEYS: keys.data,
    INTAKE_HMAC_KEY: keys.hmac,
    INTAKE_MAIL: "console",
    INTAKE_ORIGIN: `http://localhost:${port}`,
  },
});
child.on("exit", (code) => process.exit(code ?? 0));
