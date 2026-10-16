import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";
import { getPseoLeafPages } from "@/lib/pseo/catalog";
import { isPseoLeafIndexable } from "@/lib/pseo/indexing";

describe("sitemap", () => {
  it("lists only pSEO leaves approved for indexing", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const page of getPseoLeafPages()) {
      const listed = urls.some((url) => url.endsWith(`/pseo/${page.slug}`));
      // A noindex page in the sitemap contradicts itself (Ahrefs: error).
      expect(listed).toBe(isPseoLeafIndexable(page.slug));
    }
  });

  it("leaves the work-in-progress case studies out", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const slug of ["intrum", "tulli", "raw-view"]) {
      expect(urls.some((url) => url.endsWith(`/work/${slug}`))).toBe(false);
    }
  });

  it("lists every engagement offer page", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const slug of [
      "design-system-audit",
      "design-system-lift-off",
      "ai-ready-ops",
      "embedded-partnership",
    ]) {
      expect(urls.some((url) => url.endsWith(`/engagements/${slug}`))).toBe(true);
    }
  });
});
