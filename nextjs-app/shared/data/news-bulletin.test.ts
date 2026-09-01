import { describe, expect, it } from "vitest";
import {
  NEWS_BULLETIN_ITEMS,
  NEWS_BULLETIN_SLOT_COUNT,
  assertNewsBulletinCount,
} from "./news-bulletin";

describe("news-bulletin data", () => {
  it("exports exactly three items", () => {
    expect(NEWS_BULLETIN_ITEMS).toHaveLength(NEWS_BULLETIN_SLOT_COUNT);
    assertNewsBulletinCount();
  });

  it("uses unique ids", () => {
    const ids = NEWS_BULLETIN_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Slot 1 intentionally diverges from Figma 310:898 until that node is
  // updated: the summer-2026 bandwidth line is stale, replaced by the 2027
  // booking signal. Slots 2 and 3 still track the design.
  it("matches Figma slot copy (310:899)", () => {
    expect(NEWS_BULLETIN_ITEMS[0]?.body).toBe("Now booking for Q1–Q2");
    expect(NEWS_BULLETIN_ITEMS[1]?.body).toBe("Rhythmguard 2.0 out now");
    expect(NEWS_BULLETIN_ITEMS[2]?.body).toBe("2026 State of Digital Accessibility");
  });
});
