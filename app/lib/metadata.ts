import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

// Default Open Graph image - now uses auto-generated OG images (1200x630)
// Individual routes have their own opengraph-image.tsx files
const DEFAULT_OG_IMAGE = `${siteUrl}/opengraph-image`;

export interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

/**
 * Generate standardized Next.js metadata with proper Open Graph images
 * Addresses Ahrefs audit issues:
 * - Missing Open Graph images
 * - Inconsistent metadata structure
 * - Social sharing optimization
 */
export function generatePageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: GenerateMetadataParams): Metadata {
  const url = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = title.includes("Digitaltableteur")
    ? title
    : `${title} | Digitaltableteur`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      title: fullTitle,
      description,
      url,
      siteName: "Digitaltableteur",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && publishedTime
        ? {
            publishedTime,
            modifiedTime,
            authors: authors || ["Petri Lahdelma"],
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
  };

  return metadata;
}

/**
 * Quick metadata generation for simple pages
 */
export function simpleMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return generatePageMetadata({
    title,
    description,
    path,
  });
}

/**
 * Article/blog post metadata
 */
export function articleMetadata({
  title,
  description,
  path,
  ogImage,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: Omit<GenerateMetadataParams, "type">): Metadata {
  return generatePageMetadata({
    title,
    description,
    path,
    ogImage,
    type: "article",
    publishedTime,
    modifiedTime,
    authors,
    tags,
  });
}
