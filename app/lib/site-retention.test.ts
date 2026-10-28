import { ObjectId, type Db } from "mongodb";
import { describe, expect, it, vi } from "vitest";

import { CONTACT_RETENTION_DAYS, purgeExpiredSiteData, retentionCutoff } from "./site-retention";

describe("site retention", () => {
  const now = new Date("2026-10-29T08:00:00Z");

  it("cuts off at the ObjectId stamped two years before now", () => {
    const cutoff = retentionCutoff(now).getTimestamp().getTime();
    expect(now.getTime() - cutoff).toBe(CONTACT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    // A record inserted a day before the cutoff sorts below it; one a day after does not.
    const dayMs = 24 * 60 * 60 * 1000;
    const older = ObjectId.createFromTime((cutoff - dayMs) / 1000);
    const newer = ObjectId.createFromTime((cutoff + dayMs) / 1000);
    expect(older.toHexString() < retentionCutoff(now).toHexString()).toBe(true);
    expect(newer.toHexString() < retentionCutoff(now).toHexString()).toBe(false);
  });

  it("purges contacts and chat leads by server-owned insert time, never the client time field", async () => {
    const filters: Record<string, unknown> = {};
    const db = {
      collection: (name: string) => ({
        deleteMany: vi.fn(async (filter: unknown) => {
          filters[name] = filter;
          return { deletedCount: name === "contacts" ? 3 : 1 };
        }),
      }),
    } as unknown as Db;

    expect(await purgeExpiredSiteData(db, now)).toEqual({ contacts: 3, donnyLeads: 1 });
    for (const name of ["contacts", "donny_leads"]) {
      expect(filters[name]).toEqual({ _id: { $lt: retentionCutoff(now) } });
      expect(JSON.stringify(filters[name])).not.toContain("time");
    }
  });
});
