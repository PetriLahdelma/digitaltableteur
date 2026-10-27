import { getIntakeDb } from "../db/client";
import { devIntakeDb } from "../db/dev-db";
import { parseDataKeys, parseHmacKey } from "../security/keys";
import type { IntakeContext, Mailer } from "./context";
import { consoleMailer, resendMailer } from "./mail";

/**
 * The server wiring for intake routes: keys, database and mail transport
 * from the environment. Production keys exist only as sensitive Vercel
 * variables (docs/intake/README.md, environment variables).
 */

const DEV_DB_PREFIX = "pglite:";

/** Origin for links in emails. INTAKE_ORIGIN lets the local dev server point links at itself. */
export function intakeOrigin(): string {
  const configured = process.env.INTAKE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "https://www.digitaltableteur.com";
  return configured.replace(/\/$/, "");
}

let keys: Pick<IntakeContext, "ring" | "hmacKey"> | null = null;

export async function intakeContext(): Promise<IntakeContext> {
  keys ??= { ring: parseDataKeys(process.env.INTAKE_DATA_KEYS), hmacKey: parseHmacKey(process.env.INTAKE_HMAC_KEY) };
  const url = process.env.INTAKE_DATABASE_DATABASE_URL ?? "";
  const db = url.startsWith(DEV_DB_PREFIX) ? await devIntakeDb(url.slice(DEV_DB_PREFIX.length)) : getIntakeDb();
  return { db, ...keys, origin: intakeOrigin(), now: () => new Date() };
}

export function intakeMailer(): Mailer {
  const devMail = process.env.NODE_ENV !== "production" ? process.env.INTAKE_MAIL : undefined;
  if (devMail === "console") return consoleMailer;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = resendMailer(apiKey, process.env.INTAKE_EMAIL_FROM || "Digitaltableteur <intake@digitaltableteur.com>");
  // The local sandbox sends real mail and also prints it, so a slow inbox never blocks a test.
  if (devMail === "resend+console")
    return {
      async send(mail) {
        await consoleMailer.send(mail);
        await resend.send(mail);
      },
    };
  return resend;
}

/**
 * True when this deployment has the intake's keys and database: production
 * (sensitive Vercel variables) and `npm run intake:dev`. A plain `npm run dev`
 * has neither, and the intake then does not exist (404), as before launch.
 */
export function isIntakeConfigured(): boolean {
  return Boolean(process.env.INTAKE_DATA_KEYS && process.env.INTAKE_HMAC_KEY && process.env.INTAKE_DATABASE_DATABASE_URL);
}

/** True only for the local PGlite setup started by `npm run intake:dev`. */
export function isIntakeDevMode(): boolean {
  return process.env.NODE_ENV === "development" && (process.env.INTAKE_DATABASE_DATABASE_URL ?? "").startsWith(DEV_DB_PREFIX);
}
