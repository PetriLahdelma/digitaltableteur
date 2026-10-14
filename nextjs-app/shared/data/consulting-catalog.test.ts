import { describe, expect, it } from "vitest";
import enTranslation from "../locales/en/translation.json";

import {
  getCaseStudyBySlug,
  getConsultingPackages,
  getHourlyRate,
  mapProblemToService,
} from "./consulting-catalog";

describe("consulting-catalog", () => {
  it("exposes hourly rate €90 typical, €90–150 range", () => {
    const rate = getHourlyRate();
    expect(rate.typicalEur).toBe(90);
    expect(rate.rangeEur.min).toBe(90);
    expect(rate.rangeEur.max).toBe(150);
    expect(rate.currency).toBe("EUR");
  });

  it("lists three fixed packages from €7k", () => {
    const packages = getConsultingPackages();
    expect(packages).toHaveLength(3);
    expect(packages[0]?.name).toBe("UX Sprint");
    expect(packages[0]?.priceRangeEur).toMatch(/€7/);
  });

  // Donny and the WebMCP tools quote this catalog; the pricing page quotes the
  // locale files. UX Sprint drifted (€8k here vs €7k on the page, 2026-07-18).
  it("matches the pricing page's package prices and durations", () => {
    const pageKeyById: Record<string, number> = {
      "design-system-lift-off": 1,
      "ai-ready-designops": 2,
      "ux-sprint": 3,
    };
    for (const pkg of getConsultingPackages()) {
      const n = pageKeyById[pkg.id];
      expect(n, pkg.id).toBeDefined();
      const page = enTranslation as Record<string, string>;
      expect(pkg.priceRangeEur, pkg.id).toBe(page[`pricingPackage${n}Price`]);
      expect(pkg.duration, pkg.id).toBe(page[`pricingPackage${n}Duration`]);
    }
  });

  it("finds case study by slug", () => {
    const study = getCaseStudyBySlug("dsharp-design-system");
    expect(study?.title).toContain("DSharp");
    expect(study?.url).toContain("/work/dsharp-design-system");
  });

  it("maps token problems to design tokens service", () => {
    const fit = mapProblemToService("We need dark mode and design tokens");
    expect(fit.service.slug).toBe("design-tokens-setup");
    expect(fit.confidence).toBe("high");
  });

  it("maps vague problems to audit with medium confidence", () => {
    const fit = mapProblemToService("We need help with our product");
    expect(fit.confidence).toBe("medium");
    expect(fit.service.slug).toBe("design-system-audit");
  });
});
