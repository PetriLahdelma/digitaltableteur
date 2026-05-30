import { isSafeDonnyRoute } from "./donny-site-actions";
import { resolveProjectNavigationPath } from "./projects";

/** Strip leading navigation verbs from free-text destination queries. */
export const DONNY_NAV_PHRASE_PREFIX =
  /^(?:please\s+)?(?:(?:can you|could you)\s+)?(?:navigate(?:\s+me)?\s+to|open|show\s+me|go\s+to|take\s+me\s+to|view)\s+(?:the\s+)?/i;

export function normalizeDonnyNavigationQuery(input: string): string {
  return input.trim().replace(DONNY_NAV_PHRASE_PREFIX, "").trim();
}

const SITE_PAGE_ALIASES: Record<string, string> = {
  pricing: "/pricing",
  prices: "/pricing",
  price: "/pricing",
  packages: "/pricing",
  "service packages": "/pricing",
  "pricing page": "/pricing",
  work: "/work",
  portfolio: "/work",
  projects: "/work",
  "case studies": "/work",
  contact: "/contact",
  "contact us": "/contact",
  "contact page": "/contact",
  home: "/",
  homepage: "/",
  about: "/about",
  blog: "/blog",
  services: "/#services",
};

function stripLeadingArticle(value: string): string {
  return value.replace(/^the\s+/i, "").trim();
}

function resolveSitePagePath(normalized: string): string | null {
  const lower = normalized.toLowerCase();
  const withoutArticle = stripLeadingArticle(lower);

  if (SITE_PAGE_ALIASES[lower]) return SITE_PAGE_ALIASES[lower];
  if (SITE_PAGE_ALIASES[withoutArticle]) return SITE_PAGE_ALIASES[withoutArticle];

  if (/\b(pric(e|ing)|packages?|costs?)\b/.test(withoutArticle)) {
    return "/pricing";
  }
  if (/\b(portfolio|case studies?)\b/.test(withoutArticle)) {
    return "/work";
  }
  if (/\bcontact\b/.test(withoutArticle)) {
    return "/contact";
  }

  return null;
}

/**
 * Resolve navigation queries to internal routes — site pages first, then projects.
 */
export function resolveDonnyNavigationPath(input: string): string | null {
  const normalized = normalizeDonnyNavigationQuery(input);
  if (!normalized) return null;

  if (normalized.startsWith("/") && !normalized.startsWith("//")) {
    const pathOnly = normalized.split("?")[0] ?? normalized;
    if (isSafeDonnyRoute(pathOnly.split("#")[0] ?? pathOnly)) {
      return pathOnly;
    }
    return null;
  }

  const sitePath = resolveSitePagePath(normalized);
  if (sitePath) {
    return sitePath;
  }

  return resolveProjectNavigationPath(input);
}
