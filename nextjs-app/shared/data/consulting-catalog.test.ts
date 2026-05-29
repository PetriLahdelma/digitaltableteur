import { describe, expect, it } from "vitest";

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

  it("lists three fixed packages from €8k", () => {
    const packages = getConsultingPackages();
    expect(packages).toHaveLength(3);
    expect(packages[0]?.name).toBe("UX Sprint");
    expect(packages[0]?.priceRangeEur).toMatch(/€8/);
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
