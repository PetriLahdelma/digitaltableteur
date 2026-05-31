export const DEFAULT_SITE_URL = "https://www.digitaltableteur.com";

/** Canonical origin for sitemap, JSON-LD, RSS, and Open Graph URLs. */
export function getSiteUrl(): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) {
    return DEFAULT_SITE_URL;
  }

  try {
    return new URL(configuredSiteUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function toAbsoluteSiteUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }

  const siteUrl = getSiteUrl();
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
