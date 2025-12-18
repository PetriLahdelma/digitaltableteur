import { describe, it, expect } from "vitest";
import {
  getOrganizationSchema,
  getPersonSchema,
  getBreadcrumbSchema,
  getWebSiteSchema,
  getArticleSchema,
} from "./structuredData";

describe("structuredData", () => {
  describe("getOrganizationSchema", () => {
    it("returns valid Organization schema", () => {
      const schema = getOrganizationSchema();
      expect(schema["@type"]).toBe("Organization");
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema.name).toBe("Digitaltableteur");
    });

    it("includes contact information", () => {
      const schema = getOrganizationSchema() as any;
      expect(schema.contactPoint).toBeDefined();
      expect(schema.contactPoint.email).toBeDefined();
    });

    it("includes social links", () => {
      const schema = getOrganizationSchema();
      expect(Array.isArray(schema.sameAs)).toBe(true);
    });

    it("accepts custom options", () => {
      const schema = getOrganizationSchema({
        contactEmail: "custom@example.com",
      }) as any;
      expect(schema.contactPoint.email).toBe("custom@example.com");
    });
  });

  describe("getPersonSchema", () => {
    it("returns valid Person schema", () => {
      const schema = getPersonSchema();
      expect(schema["@type"]).toBe("Person");
      expect(schema["@context"]).toBe("https://schema.org");
    });

    it("includes job title", () => {
      const schema = getPersonSchema();
      expect(schema.jobTitle).toBeDefined();
    });

    it("accepts custom options", () => {
      const schema = getPersonSchema({
        name: "Custom Name",
        jobTitle: "Custom Title",
      });
      expect(schema.name).toBe("Custom Name");
      expect(schema.jobTitle).toBe("Custom Title");
    });
  });

  describe("getBreadcrumbSchema", () => {
    it("returns valid BreadcrumbList schema", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
      ];
      const schema = getBreadcrumbSchema(items);
      expect(schema["@type"]).toBe("BreadcrumbList");
      const itemList = schema.itemListElement as any[];
      expect(itemList).toHaveLength(2);
    });

    it("assigns correct positions", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "About", url: "/about" },
      ];
      const schema = getBreadcrumbSchema(items);
      const itemList = schema.itemListElement as any[];
      expect(itemList[0].position).toBe(1);
      expect(itemList[1].position).toBe(2);
    });
  });

  describe("getWebSiteSchema", () => {
    it("returns valid WebSite schema", () => {
      const schema = getWebSiteSchema();
      expect(schema["@type"]).toBe("WebSite");
      expect(schema.name).toBe("Digitaltableteur");
    });

    it("includes search action when searchUrl provided", () => {
      const schema = getWebSiteSchema({
        searchUrl: "/search?q={search_term_string}",
      }) as any;
      expect(schema.potentialAction).toBeDefined();
    });
  });

  describe("getArticleSchema", () => {
    it("returns valid Article schema", () => {
      const schema = getArticleSchema({
        title: "Test Article",
        description: "Test description",
        slug: "/blog/test",
        publishedAt: "2024-01-01",
        author: "Test Author",
      });
      expect(schema["@type"]).toBe("BlogPosting");
      expect(schema.headline).toBe("Test Article");
    });

    it("includes author information", () => {
      const schema = getArticleSchema({
        title: "Test",
        description: "Test",
        slug: "/test",
        publishedAt: "2024-01-01",
        author: "John Doe",
      }) as any;
      expect(schema.author).toBeDefined();
      expect(schema.author.name).toBe("John Doe");
    });

    it("includes modified date when provided", () => {
      const schema = getArticleSchema({
        title: "Test",
        description: "Test",
        slug: "/test",
        publishedAt: "2024-01-01",
        modifiedAt: "2024-01-02",
        author: "Test",
      });
      expect(schema.dateModified).toBe("2024-01-02");
    });
  });
});
