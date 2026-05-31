import { describe, expect, it } from "vitest";

import { getSiteUrl, toAbsoluteSiteUrl } from "@/app/lib/siteUrl";

describe("siteUrl", () => {
  it("normalizes configured site URLs to origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.digitaltableteur.com/blog/";
    expect(getSiteUrl()).toBe("https://www.digitaltableteur.com");
    expect(toAbsoluteSiteUrl("/blog")).toBe("https://www.digitaltableteur.com/blog");
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
});
