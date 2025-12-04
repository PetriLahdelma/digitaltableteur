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

const SITE_URL = "https://www.digitaltableteur.com";

export interface OrganizationSchemaOptions {
  url?: string;
  logo?: string;
  socialLinks?: string[];
  contactEmail?: string;
}

/**
 * Organization schema for root layout
 * Establishes site identity and contact information
 */
export function getOrganizationSchema(
  options: OrganizationSchemaOptions = {},
): Record<string, unknown> {
  const {
    url = SITE_URL,
    logo = `${SITE_URL}/logo512.png`,
    socialLinks = [
      "https://github.com/PetriLahdelma",
      // Add more social profiles as they become available
    ],
    contactEmail = "mail@digitaltableteur.com",
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Digitaltableteur",
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 512,
      height: 512,
    },
    sameAs: socialLinks,
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      contactType: "Customer Support",
      availableLanguage: ["English", "Finnish", "Swedish"],
    },
    description:
      "Design Systems & AI-Powered DesignOps studio specializing in scalable design operations and intelligent automation",
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
  const {
    name = "Petri Lahdelma",
    jobTitle = "Design Systems Specialist & DesignOps Engineer",
    url = `${SITE_URL}/about`,
    image = `${SITE_URL}/pete.png`,
    sameAs = [
      "https://github.com/PetriLahdelma",
      // Add LinkedIn, Twitter, etc.
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

  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const imageUrl = mainImageUrl || `${SITE_URL}/logo512.png`;

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
        url: `${SITE_URL}/logo512.png`,
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
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
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
  const { searchUrl, potentialActions = true } = options;

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Digitaltableteur",
    url: SITE_URL,
    description:
      "Design Systems, AI-Powered DesignOps, and product craft from Digitaltableteur",
    inLanguage: ["en", "fi", "sv"],
    publisher: {
      "@type": "Organization",
      name: "Digitaltableteur",
    },
  };

  // Add SearchAction if search functionality exists
  if (potentialActions && searchUrl) {
    return {
      ...baseSchema,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}${searchUrl}?q={search_term_string}`,
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
    url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image.startsWith("http") ? image : `${SITE_URL}${image}`,
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

/**
 * Safely stringify JSON-LD for script tag injection
 * Uses DOMPurify for defense-in-depth XSS protection
 */
export function stringifyJsonLd(obj: Record<string, unknown>): string {
  const jsonString = JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  // Additional sanitization layer with DOMPurify
  return sanitizeJsonLd(jsonString);
}
