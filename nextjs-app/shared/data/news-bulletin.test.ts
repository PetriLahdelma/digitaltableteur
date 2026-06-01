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
});
