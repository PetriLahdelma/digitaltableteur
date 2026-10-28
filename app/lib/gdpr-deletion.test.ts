import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";

import {
  confirmDeletion,
  hashDeletionToken,
  issueDeletionLink,
  normalizeEmail,
} from "./gdpr-deletion";

type Row = Record<string, unknown>;

/**
 * Just enough of a MongoDB Db for the deletion flow: equality filters,
 * `$gt` on dates and the case-insensitive collation the module uses.
 */
function fakeDb(seed: Record<string, Row[]> = {}) {
  const data: Record<string, Row[]> = structuredClone(seed);
  const rows = (name: string) => (data[name] ??= []);
  const matches = (row: Row, filter: Row, caseless: boolean) =>
    Object.entries(filter).every(([key, want]) => {
      const have = row[key];
      if (want && typeof want === "object" && "$gt" in want) {
        return (have as Date) > ((want as { $gt: Date }).$gt);
      }
      if (caseless && typeof have === "string" && typeof want === "string") {
        return have.toLowerCase() === want.toLowerCase();
      }
      return have === want;
    });
  const db = {
    collection: (name: string) => ({
      createIndex: vi.fn(async () => "index"),
      insertOne: vi.fn(async (doc: Row) => {
        rows(name).push(doc);
        return { insertedId: rows(name).length };
      }),
      findOne: vi.fn(async (filter: Row, options?: { collation?: unknown }) =>
        rows(name).find((row) => matches(row, filter, Boolean(options?.collation))) ?? null,
      ),
      findOneAndDelete: vi.fn(async (filter: Row) => {
        const index = rows(name).findIndex((row) => matches(row, filter, false));
        return index === -1 ? null : rows(name).splice(index, 1)[0];
      }),
      deleteMany: vi.fn(async (filter: Row, options?: { collation?: unknown }) => {
        const before = rows(name).length;
        data[name] = rows(name).filter((row) => !matches(row, filter, Boolean(options?.collation)));
        return { deletedCount: before - data[name].length };
      }),
    }),
  };
  return { db: db as unknown as Db, data };
}

const NOW = new Date("2026-10-29T08:00:00Z");

describe("issueDeletionLink", () => {
  let sent: { to: string[]; text: string; subject: string }[];

  beforeEach(() => {
    sent = [];
    vi.stubEnv("RESEND_API_KEY", "test_key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      sent.push(JSON.parse(String(init?.body)));
      return new Response("{}", { status: 200 });
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("mails nothing and stores no token when no data exists", async () => {
    const { db, data } = fakeDb();
    expect(await issueDeletionLink(db, "nobody@example.com", "en", NOW)).toBe(false);
    expect(sent).toHaveLength(0);
    expect(data.deletion_tokens ?? []).toHaveLength(0);
  });

  it("finds data whatever its case and mails a one-time link on the canonical origin", async () => {
    const { db, data } = fakeDb({ contacts: [{ email: "Person@Example.com" }] });
    const email = normalizeEmail("  PERSON@example.com ");

    expect(await issueDeletionLink(db, email, "fi", NOW)).toBe(true);

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toEqual(["person@example.com"]);
    expect(sent[0].subject).toBe("Vahvista tietojesi poistaminen");
    const link = sent[0].text.match(/https:\/\/\S+/)?.[0] ?? "";
    expect(link).toMatch(/^https:\/\/www\.digitaltableteur\.com\/privacy-policy\/delete#t=[A-Za-z0-9_-]{43}$/);

    const token = link.split("#t=")[1];
    const stored = data.deletion_tokens[0];
    expect(stored.tokenHash).toBe(hashDeletionToken(token));
    expect(JSON.stringify(stored)).not.toContain(token);
    expect((stored.expiresAt as Date).getTime() - NOW.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});

describe("confirmDeletion", () => {
  const token = "a".repeat(43);
  const seed = () => ({
    contacts: [
      { email: "Person@Example.com", message: "first" },
      { email: "person@example.com", message: "second" },
      { email: "other@example.com", message: "keep" },
    ],
    donny_leads: [{ email: "PERSON@example.com" }],
    deletion_tokens: [
      {
        tokenHash: hashDeletionToken(token),
        email: "person@example.com",
        expiresAt: new Date(NOW.getTime() + 60_000),
      },
    ],
  });

  it("rejects an unknown token and deletes nothing", async () => {
    const { db, data } = fakeDb(seed());
    expect(await confirmDeletion(db, "b".repeat(43), "203.0.113.0", NOW)).toEqual({ status: "invalid" });
    expect(data.contacts).toHaveLength(3);
  });

  it("rejects an expired token", async () => {
    const { db, data } = fakeDb(seed());
    const later = new Date(NOW.getTime() + 120_000);
    expect(await confirmDeletion(db, token, "203.0.113.0", later)).toEqual({ status: "invalid" });
    expect(data.contacts).toHaveLength(3);
  });

  it("deletes every record for the address, ignoring case, and spends the token", async () => {
    const { db, data } = fakeDb(seed());

    expect(await confirmDeletion(db, token, "203.0.113.0", NOW)).toEqual({ status: "deleted", deletedCount: 3 });

    expect(data.contacts).toEqual([{ email: "other@example.com", message: "keep" }]);
    expect(data.donny_leads).toHaveLength(0);
    expect(data.deletion_tokens).toHaveLength(0);
    expect(data.deletion_requests[0]).toMatchObject({
      email: "person@example.com",
      requestIp: "203.0.113.0",
      deletedCount: 3,
      status: "completed",
    });
    expect(await confirmDeletion(db, token, "203.0.113.0", NOW)).toEqual({ status: "invalid" });
  });
});
