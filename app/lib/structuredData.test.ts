import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getOrganizationSchema,
  getPersonSchema,
  getBreadcrumbSchema,
  getWebSiteSchema,
  getArticleSchema,
  getWebPageSchema,
  getFaqSchema,
  getItemListSchema,
  getContactPageSchema,
  getCollectionPageSchema,
} from "./structuredData";

describe("structuredData", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  describe("getWebPageSchema", () => {
    it("returns valid WebPage schema", () => {
      const schema = getWebPageSchema({
        name: "Test Page",
        description: "Test description",
        url: "/test",
      });
      expect(schema["@type"]).toBe("WebPage");
      expect(schema.name).toBe("Test Page");
    });

    it("includes keywords when provided", () => {
      const schema = getWebPageSchema({
        name: "Test Page",
        description: "Test description",
        url: "/test",
        keywords: ["a", "b"],
      }) as any;
      expect(schema.keywords).toContain("a");
    });
  });

  describe("getFaqSchema", () => {
    it("returns valid FAQPage schema", () => {
      const schema = getFaqSchema([
        {
          question: "What does Digitaltableteur do?",
          answer:
            "Digitaltableteur helps teams with design systems and AI-powered design workflows.",
        },
      ]) as any;

      expect(schema["@type"]).toBe("FAQPage");
      expect(schema.mainEntity).toHaveLength(1);
      expect(schema.mainEntity[0].acceptedAnswer.text).toContain(
        "design systems",
      );
    });
  });

  describe("getItemListSchema", () => {
    it("returns valid ItemList schema", () => {
      const schema = getItemListSchema({
        name: "Primary services",
        items: [
          {
            name: "Design systems consulting",
            url: "/services/design-systems",
          },
          { name: "AI-powered design workflows", url: "/services/ai-design" },
        ],
      }) as any;

      expect(schema["@type"]).toBe("ItemList");
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
    });
  });

  describe("getContactPageSchema", () => {
    it("returns valid ContactPage schema", () => {
      const schema = getContactPageSchema({
        name: "Contact Digitaltableteur",
        description: "Get in touch for design systems consulting.",
        url: "/contact",
        email: "mail@digitaltableteur.com",
      }) as any;

      expect(schema["@type"]).toBe("ContactPage");
      expect(schema.mainEntity.contactPoint.email).toBe(
        "mail@digitaltableteur.com",
      );
    });
  });

  describe("getCollectionPageSchema", () => {
    it("returns valid CollectionPage schema", () => {
      const schema = getCollectionPageSchema({
        name: "Work",
        description: "Selected client work.",
        url: "/work",
        items: [{ name: "KnobSmith Audio", url: "/work/knobsmith-audio" }],
      }) as any;

      expect(schema["@type"]).toBe("CollectionPage");
      expect(schema.mainEntity.itemListElement).toHaveLength(1);
      expect(schema.mainEntity.itemListElement[0].url).toBe(
        "https://www.digitaltableteur.com/work/knobsmith-audio",
      );
    });

    it("uses the configured site origin for relative URLs", () => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.digitaltableteur.com/path");

      const schema = getCollectionPageSchema({
        name: "Work",
        description: "Preview collection page",
        url: "/work",
        items: [{ name: "Preview item", url: "/work/preview-item" }],
      }) as any;

      expect(schema.url).toBe("https://preview.digitaltableteur.com/work");
      expect(schema.isPartOf.url).toBe("https://preview.digitaltableteur.com");
      expect(schema.mainEntity.itemListElement[0].url).toBe(
        "https://preview.digitaltableteur.com/work/preview-item",
      );
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
