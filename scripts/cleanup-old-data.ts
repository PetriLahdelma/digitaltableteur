/**
 * Data retention cleanup, run by hand. Production runs the same purge daily
 * through /api/cron/site-retention (vercel.json); this script is for a manual
 * run or a dry run against a database.
 *
 *   npm run gdpr:cleanup:dry   # counts only
 *   npm run gdpr:cleanup       # deletes
 *
 * Logs counts only: no emails or other personal data.
 */

import { MongoClient } from "mongodb";

import {
  CONTACT_RETENTION_DAYS,
  countExpiredSiteData,
  purgeExpiredSiteData,
} from "../app/lib/site-retention";

const DRY_RUN = process.env.DRY_RUN === "true";

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not configured");

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    console.log(`Retention: ${CONTACT_RETENTION_DAYS} days. Mode: ${DRY_RUN ? "dry run" : "delete"}.`);
    const result = DRY_RUN ? await countExpiredSiteData(db) : await purgeExpiredSiteData(db);
    console.log(
      `${DRY_RUN ? "Would delete" : "Deleted"}: ${result.contacts} contact submissions, ${result.donnyLeads} chat leads.`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Cleanup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
