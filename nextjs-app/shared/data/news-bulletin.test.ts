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

  it("matches Figma slot copy (310:899)", () => {
    expect(NEWS_BULLETIN_ITEMS[0]?.body).toBe(
      "Bandwidth during summertime, 2026",
    );
    expect(NEWS_BULLETIN_ITEMS[1]?.body).toBe("Rhythmguard 2.0 out now");
    expect(NEWS_BULLETIN_ITEMS[2]?.body).toBe("Check out the DSharp Case Study");
  });
});
