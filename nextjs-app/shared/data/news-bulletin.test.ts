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

  // Pins the live slot copy. Figma 310:898 and 310:897 lag behind: slot 1
  // still shows the summer-2026 bandwidth line and slot 2 the Rhythmguard
  // 2.0 release; slot 3 tracks the design.
  it("pins the bulletin slot copy (310:899)", () => {
    expect(NEWS_BULLETIN_ITEMS[0]?.body).toBe("Now booking for Q1–Q2");
    expect(NEWS_BULLETIN_ITEMS[1]?.body).toBe("Plausible accessibility");
    expect(NEWS_BULLETIN_ITEMS[2]?.body).toBe("2026 State of Digital Accessibility");
  });
});
