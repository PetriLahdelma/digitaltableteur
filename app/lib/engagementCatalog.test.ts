import { describe, expect, it } from "vitest";

import { ENGAGEMENTS } from "@/nextjs-app/shared/data/engagements";
import {
  formatEngagementMarkdown,
  getEngagementEntries,
  parseEngagementPrice,
  toServiceSchemaOptions,
} from "./engagementCatalog";
import { getOfferCatalogSchema, getServiceSchema } from "./structuredData";

describe("engagement catalog", () => {
  it("reads every visible price format", () => {
    expect(parseEngagementPrice("€7–14k")).toEqual({ minPrice: 7000, maxPrice: 14000, currency: "EUR" });
    expect(parseEngagementPrice("€5–8k / mo")).toEqual({
      minPrice: 5000,
      maxPrice: 8000,
      currency: "EUR",
      unitCode: "MON",
    });
    expect(parseEngagementPrice("90 €/h")).toEqual({
      minPrice: 90,
      maxPrice: 90,
      currency: "EUR",
      unitCode: "HUR",
    });
    expect(parseEngagementPrice("Quoted per workshop")).toBeNull();
  });

  it("has one entry per offer page with a name, price label and duration", () => {
    const entries = getEngagementEntries();
    expect(entries.map((entry) => entry.config.slug)).toEqual(ENGAGEMENTS.map((e) => e.slug));
    for (const entry of entries) {
      expect(entry.name, entry.config.id).not.toBe("");
      expect(entry.priceLabel, entry.config.id).not.toBe("");
      expect(entry.durationLabel, entry.config.id).not.toBe("");
    }
  });

  it("only leaves the quoted workshop without a machine-readable price", () => {
    const unpriced = getEngagementEntries()
      .filter((entry) => entry.price === null)
      .map((entry) => entry.config.id);
    expect(unpriced).toEqual(["workshop"]);
  });

  it("builds a Service with an offer for each engagement", () => {
    for (const entry of getEngagementEntries()) {
      const schema = getServiceSchema(toServiceSchemaOptions(entry)) as Record<string, any>;
      expect(schema["@type"]).toBe("Service");
      expect(schema["@id"]).toMatch(new RegExp(`${entry.path}#service$`));
      expect(schema.offers.description).toBe(entry.priceLabel);
      if (entry.price) {
        expect(schema.offers.priceSpecification.minPrice).toBe(entry.price.minPrice);
        expect(schema.offers.priceSpecification.maxPrice).toBe(entry.price.maxPrice);
      } else {
        expect(schema.offers.priceSpecification).toBeUndefined();
      }
    }
  });

  it("lists every engagement in the pricing OfferCatalog", () => {
    const entries = getEngagementEntries();
    const catalog = getOfferCatalogSchema("Engagements", "/pricing", entries.map(toServiceSchemaOptions)) as Record<string, any>;
    expect(catalog.itemListElement).toHaveLength(entries.length);
  });

  it("writes a markdown brief with price, scope and FAQ", () => {
    const [entry] = getEngagementEntries();
    const markdown = formatEngagementMarkdown(entry, "https://example.com");
    expect(markdown).toContain(`# ${entry.name}`);
    expect(markdown).toContain(`- Price: ${entry.priceLabel}`);
    expect(markdown).toContain(entry.copy.scope);
    expect(markdown).toContain(entry.copy.faq[0].question);
  });
});
