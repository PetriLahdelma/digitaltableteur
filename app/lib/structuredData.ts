/**
 * Structured Data (JSON-LD) utilities for SEO
 *
 * Provides schema.org markup generators for improved search engine understanding
 * and rich snippet eligibility.
 *
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

import { sanitizeJsonLd } from "./sanitize";
import { getSiteUrl, toAbsoluteSiteUrl } from "./siteUrl";

function toAbsoluteUrl(url: string): string {
  return toAbsoluteSiteUrl(url);
}

export interface OrganizationSchemaOptions {
  url?: string;
  logo?: string;
  socialLinks?: string[];
  contactEmail?: string;
  contactPhone?: string;
}

/** Stable node id, so other schemas (Person.worksFor) point at this entity. */
const ORGANIZATION_ID = (siteUrl: string) => `${siteUrl}/#organization`;

/**
 * Organization schema for root layout
 * Establishes site identity and contact information
 */
export function getOrganizationSchema(
  options: OrganizationSchemaOptions = {},
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const {
    url = siteUrl,
    logo = `${siteUrl}/logo512.png`,
    socialLinks = [
      "https://www.linkedin.com/company/digitaltableteur/",
      "https://github.com/PetriLahdelma",
      "https://x.com/dtdoesdesign",
      "https://medium.com/digitaltableteur",
      "https://www.instagram.com/digitaltableteur/",
      "https://www.facebook.com/digitaltableteur",
      "https://dribbble.com/digitaltableteur",
      "https://dev.to/digitaltableteur",
    ],
    contactEmail = "mail@digitaltableteur.com",
    contactPhone = "+358 45 657 4469",
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID(siteUrl),
    name: "Digitaltableteur",
    // "Digitaltableteur" alone reads as "digital tablet" to search engines and
    // AI assistants; this field exists to tell same-named things apart.
    disambiguatingDescription: "Helsinki design-system studio",
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 512,
      height: 512,
    },
    sameAs: socialLinks,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hämeentie 8 C",
      postalCode: "00530",
      addressLocality: "Helsinki",
      addressCountry: "FI",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      telephone: contactPhone,
      contactType: "Customer Support",
      availableLanguage: ["English", "Finnish", "Swedish"],
    },
    description:
      "Digitaltableteur is a Helsinki design-system studio working with product teams since 2009: design system audits, builds and governance, UX sprints and AI-native design systems.",
    foundingDate: "2009-04-29",
    foundingLocation: {
      "@type": "Place",
      name: "Helsinki, Finland",
    },
    identifier: {
      "@type": "PropertyValue",
      propertyID: "Finnish Business ID (Y-tunnus)",
      value: "2264455-2",
    },
    areaServed: ["FI", "EU"],
    knowsAbout: [
      "Design systems",
      "Design system audits",
      "Design tokens",
      "Component libraries",
      "Accessibility",
      "DesignOps",
      "AI-native design systems",
    ],
  };
}

export interface PersonSchemaOptions {
  name?: string;
  jobTitle?: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  description?: string;
}

/**
 * Person schema for about page and author profiles
 * Establishes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 */
export function getPersonSchema(
  options: PersonSchemaOptions = {},
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const {
    name = "Petri Lahdelma",
    jobTitle = "Design Systems Specialist & DesignOps Engineer",
    url = `${siteUrl}/about`,
    image = `${siteUrl}/pete.png`,
    sameAs = [
      "https://www.linkedin.com/in/petritapanilahdelma/",
      "https://github.com/PetriLahdelma",
      "https://x.com/dtdoesdesign",
      "https://medium.com/@petritapanilahdelma",
      "https://www.instagram.com/digitaltableteur/",
    ],
    description = "Design Systems Specialist and DesignOps Engineer focusing on AI-powered design workflows and scalable component systems",
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    url,
    image: {
      "@type": "ImageObject",
      url: image,
    },
    sameAs,
    description,
    worksFor: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID(getSiteUrl()),
      name: "Digitaltableteur",
    },
    knowsAbout: [
      "Design Systems",
      "DesignOps",
      "AI-Powered Design",
      "Component Libraries",
      "React",
      "TypeScript",
      "Figma",
    ],
  };
}

export interface ArticleSchemaOptions {
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt?: string;
  slug: string;
  author: string;
  authorUrl?: string;
  mainImageUrl?: string;
  mainImageAlt?: string;
  tags?: string[];
}

/**
 * BlogPosting schema for blog articles
 * Enables rich snippets with author, date, and reading time
 */
export function getArticleSchema(
  options: ArticleSchemaOptions,
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const {
    title,
    description,
    publishedAt,
    modifiedAt,
    slug,
    author,
    authorUrl,
    mainImageUrl,
    mainImageAlt,
    tags = [],
  } = options;

  const normalizedSlug = slug.replace(/^\/+/, "").replace(/^blog\//, "");
  const articleUrl = `${siteUrl}/blog/${normalizedSlug}`;
  const imageUrl = mainImageUrl || `${siteUrl}/logo512.png`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: publishedAt,
    ...(modifiedAt && { dateModified: modifiedAt }),
    author: {
      "@type": "Person",
      name: author,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      "@type": "Organization",
      name: "Digitaltableteur",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo512.png`,
        width: 512,
        height: 512,
      },
    },
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      ...(mainImageAlt && { description: mainImageAlt }),
    },
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    ...(tags.length > 0 && { keywords: tags.join(", ") }),
    inLanguage: "en",
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface WebPageSchemaOptions {
  name: string;
  description: string;
  url: string;
  keywords?: string[];
  inLanguage?: string;
  dateModified?: string;
}

/**
 * WebPage schema for landing pages and non-blog content
 * Improves understanding for both search engines and LLMs.
 */
export function getWebPageSchema(
  options: WebPageSchemaOptions,
): Record<string, unknown> {
  const {
    name,
    description,
    url,
    keywords = [],
    inLanguage = "en",
    dateModified,
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: toAbsoluteUrl(url),
    inLanguage,
    isPartOf: {
      "@type": "WebSite",
      name: "Digitaltableteur",
      url: getSiteUrl(),
    },
    ...(dateModified && { dateModified }),
    ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage schema for answer-first content blocks.
 * Helps search engines and LLMs map direct user questions to clear answers.
 */
export function getFaqSchema(entries: FaqEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export interface ItemListEntry {
  name: string;
  url: string;
  description?: string;
}

export interface ItemListSchemaOptions {
  name: string;
  items: ItemListEntry[];
}

/**
 * ItemList schema for ordered collections such as services, work, or primary paths.
 */
export function getItemListSchema(
  options: ItemListSchemaOptions,
): Record<string, unknown> {
  const { name, items } = options;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(item.url),
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export interface CollectionPageSchemaOptions extends WebPageSchemaOptions {
  items: ItemListEntry[];
}

/**
 * CollectionPage schema for hub pages that summarize a set of resources.
 */
export function getCollectionPageSchema(
  options: CollectionPageSchemaOptions,
): Record<string, unknown> {
  const { items, ...pageOptions } = options;
  const siteUrl = getSiteUrl();
  const pageUrl = toAbsoluteUrl(pageOptions.url);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageOptions.name,
    description: pageOptions.description,
    url: pageUrl,
    inLanguage: pageOptions.inLanguage ?? "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Digitaltableteur",
      url: siteUrl,
    },
    ...(pageOptions.dateModified
      ? { dateModified: pageOptions.dateModified }
      : {}),
    ...(pageOptions.keywords && pageOptions.keywords.length > 0
      ? { keywords: pageOptions.keywords.join(", ") }
      : {}),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: toAbsoluteUrl(item.url),
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
      })),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}

export interface ContactPageSchemaOptions {
  name: string;
  description: string;
  url: string;
  email: string;
}

/**
 * ContactPage schema for the primary inquiry route.
 */
export function getContactPageSchema(
  options: ContactPageSchemaOptions,
): Record<string, unknown> {
  const { name, description, url, email } = options;
  const siteUrl = getSiteUrl();
  const pageUrl = toAbsoluteUrl(url);

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name,
    description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Digitaltableteur",
      url: siteUrl,
    },
    about: {
      "@type": "Organization",
      name: "Digitaltableteur",
      url: siteUrl,
    },
    mainEntity: {
      "@type": "Organization",
      name: "Digitaltableteur",
      email,
      url: siteUrl,
      contactPoint: {
        "@type": "ContactPoint",
        email,
        contactType: "sales",
        availableLanguage: ["English", "Finnish", "Swedish"],
      },
    },
  };
}

/**
 * BreadcrumbList schema for navigation hierarchy
 * Helps search engines understand site structure
 */
export function getBreadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
}

export interface WebSiteSchemaOptions {
  searchUrl?: string;
  potentialActions?: boolean;
}

/**
 * WebSite schema with SearchAction
 * Enables Google site search and rich search features
 */
export function getWebSiteSchema(
  options: WebSiteSchemaOptions = {},
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const { searchUrl, potentialActions = true } = options;

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Digitaltableteur",
    url: siteUrl,
    description:
      "Design Systems, AI-Powered DesignOps and product craft from Digitaltableteur",
    inLanguage: ["en", "fi", "sv"],
    publisher: {
      "@type": "Organization",
      name: "Digitaltableteur",
    },
  };

  // Add SearchAction if search functionality exists
  if (potentialActions && searchUrl) {
    const targetUrlTemplate = toAbsoluteUrl(searchUrl);

    return {
      ...baseSchema,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: targetUrlTemplate.includes("{search_term_string}")
            ? targetUrlTemplate
            : `${targetUrlTemplate}${targetUrlTemplate.includes("?") ? "&" : "?"}q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  }

  return baseSchema;
}

export interface CreativeWorkSchemaOptions {
  name: string;
  description: string;
  url: string;
  image?: string;
  dateCreated?: string;
  creator?: string;
  keywords?: string[];
}

/**
 * CreativeWork schema for portfolio items
 * Highlights design work and project details
 */
export function getCreativeWorkSchema(
  options: CreativeWorkSchemaOptions,
): Record<string, unknown> {
  const {
    name,
    description,
    url,
    image,
    dateCreated,
    creator,
    keywords = [],
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    url: toAbsoluteUrl(url),
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(image),
      },
    }),
    ...(dateCreated && { dateCreated }),
    ...(creator && {
      creator: {
        "@type": "Person",
        name: creator,
      },
    }),
    ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
    inLanguage: "en",
  };
}

export interface ServicePriceOptions {
  minPrice: number;
  maxPrice: number;
  currency: string;
  /** UN/CEFACT unit code for prices per unit of time, e.g. MON or HUR. */
  unitCode?: string;
}

export interface ServiceSchemaOptions {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  /** Visible price text, kept as the offer description. */
  priceLabel: string;
  /** Null when the offer is quoted per engagement. */
  price: ServicePriceOptions | null;
  /** Where the offer is booked or quoted. */
  offerUrl: string;
}

function getOfferSchema(options: ServiceSchemaOptions): Record<string, unknown> {
  const { price, priceLabel, offerUrl } = options;
  return {
    "@type": "Offer",
    url: toAbsoluteUrl(offerUrl),
    description: priceLabel,
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Digitaltableteur", url: getSiteUrl() },
    ...(price
      ? {
          priceCurrency: price.currency,
          priceSpecification: {
            "@type": price.unitCode ? "UnitPriceSpecification" : "PriceSpecification",
            priceCurrency: price.currency,
            minPrice: price.minPrice,
            maxPrice: price.maxPrice,
            ...(price.unitCode ? { unitCode: price.unitCode } : {}),
          },
        }
      : {}),
  };
}

/**
 * Service schema for a productized engagement with its offer. Answer engines
 * read the provider, scope, languages and price range from one entity.
 */
export function getServiceSchema(
  options: ServiceSchemaOptions,
): Record<string, unknown> {
  const url = toAbsoluteUrl(options.url);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: options.name,
    description: options.description,
    url,
    serviceType: options.serviceType,
    provider: { "@type": "Organization", name: "Digitaltableteur", url: getSiteUrl() },
    areaServed: [
      { "@type": "Country", name: "Finland" },
      { "@type": "Place", name: "Europe" },
    ],
    availableLanguage: ["English", "Finnish", "Swedish"],
    offers: getOfferSchema(options),
  };
}

/**
 * OfferCatalog schema for a pricing page that lists several services.
 */
export function getOfferCatalogSchema(
  name: string,
  url: string,
  services: ServiceSchemaOptions[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name,
    url: toAbsoluteUrl(url),
    itemListElement: services.map((service) => ({
      ...getOfferSchema(service),
      itemOffered: {
        "@type": "Service",
        "@id": `${toAbsoluteUrl(service.url)}#service`,
        name: service.name,
        url: toAbsoluteUrl(service.url),
        description: service.description,
      },
    })),
  };
}

/**
 * Safely stringify JSON-LD for script tag injection
 * Runs the sanitize-html JSON-LD helper for defense-in-depth XSS protection
 */
export function stringifyJsonLd(obj: unknown): string {
  const jsonString = JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  // Additional sanitization layer (sanitize-html)
  return sanitizeJsonLd(jsonString);
}
