import { describe, expect, it } from "vitest";
import enTranslation from "../locales/en/translation.json";

import {
  getCaseStudyBySlug,
  getConsultingPackages,
  getHourlyRate,
  mapProblemToService,
} from "./consulting-catalog";
import { ENGAGEMENTS } from "./engagements";

describe("consulting-catalog", () => {
  it("quotes the pricing page's standard and partnership rates", () => {
    const rate = getHourlyRate();
    const partnership = enTranslation.engagementPages.partnership;
    expect(rate.standardEur).toBe(120);
    expect(rate.partnershipEur).toBe(90);
    expect(partnership.price).toBe(`${rate.partnershipEur} €/h`);
    expect(partnership.investNote).toContain(`${rate.standardEur} €/h`);
    expect(rate.vat).toBe("excluded");
    expect(rate.note).not.toMatch(/preferred/i);
  });

  // Donny and the WebMCP tools quote this catalog; the pricing page quotes the
  // locale files. They drifted twice (UX Sprint €8k vs €7k, 2026-07-18; four
  // packages vs ten offers and €90/h "typical", 2026-10-28), so the catalog
  // now reads the engagement data itself.
  it("lists every offer on the engagement pages with the page's price and duration", () => {
    const packages = getConsultingPackages();
    expect(packages.map((pkg) => pkg.id)).toEqual(ENGAGEMENTS.map((e) => e.packageId));
    const page = enTranslation as unknown as Record<string, unknown>;
    const lookup = (key: string) =>
      key.split(".").reduce<unknown>(
        (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
        page,
      );
    for (const [index, pkg] of packages.entries()) {
      const engagement = ENGAGEMENTS[index];
      expect(pkg.priceRangeEur, pkg.id).toBe(lookup(engagement.priceKey));
      expect(pkg.duration, pkg.id).toBe(lookup(engagement.durationKey));
      expect(pkg.url, pkg.id).toMatch(new RegExp(`/engagements/${engagement.slug}$`));
    }
  });

  it("names each offer's pricing model from its visible price", () => {
    const model = Object.fromEntries(getConsultingPackages().map((pkg) => [pkg.id, pkg.pricingModel]));
    expect(model["design-system-audit"]).toBe("fixed_scope");
    expect(model["embedded-partnership"]).toBe("hourly");
    expect(model["designops-copilot"]).toBe("monthly");
    expect(model.workshop).toBe("quoted");
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
