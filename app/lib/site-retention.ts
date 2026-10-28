import { ObjectId, type Db } from "mongodb";

/** Contact form submissions and chat leads: 2 years (privacy policy). */
export const CONTACT_RETENTION_DAYS = 730;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The cutoff is read from each record's ObjectId, which MongoDB stamps when
 * the record is inserted. It is server-owned and present on every document,
 * including the early submissions that have no createdAt field (the old
 * cleanup compared the client-sent `time` string with a Date and matched
 * nothing).
 */
export function retentionCutoff(now: Date): ObjectId {
  const cutoffMs = now.getTime() - CONTACT_RETENTION_DAYS * DAY_MS;
  return ObjectId.createFromTime(Math.floor(cutoffMs / 1000));
}

export type SitePurgeResult = Readonly<{
  contacts: number;
  donnyLeads: number;
}>;

/** Deletes contact submissions and chat leads past their retention window. */
export async function purgeExpiredSiteData(
  db: Db,
  now: Date = new Date(),
): Promise<SitePurgeResult> {
  const filter = { _id: { $lt: retentionCutoff(now) } };
  const contacts = await db.collection("contacts").deleteMany(filter);
  const donnyLeads = await db.collection("donny_leads").deleteMany(filter);
  return {
    contacts: contacts.deletedCount,
    donnyLeads: donnyLeads.deletedCount,
  };
}

/** Counts what purgeExpiredSiteData would delete (for dry runs). */
export async function countExpiredSiteData(
  db: Db,
  now: Date = new Date(),
): Promise<SitePurgeResult> {
  const filter = { _id: { $lt: retentionCutoff(now) } };
  return {
    contacts: await db.collection("contacts").countDocuments(filter),
    donnyLeads: await db.collection("donny_leads").countDocuments(filter),
  };
}
