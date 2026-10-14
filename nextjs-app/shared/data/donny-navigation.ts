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
  // Finnish and Swedish page names, since Donny answers in the visitor's language.
  hinnoittelu: "/pricing",
  hinnat: "/pricing",
  paketit: "/pricing",
  "työt": "/work",
  "työni": "/work",
  yhteystiedot: "/contact",
  "ota yhteyttä": "/contact",
  yhteys: "/contact",
  tietoa: "/about",
  etusivu: "/",
  blogi: "/blog",
  palvelut: "/#services",
  palvelusivu: "/#services",
  priser: "/pricing",
  prissidan: "/pricing",
  arbeten: "/work",
  kontakt: "/contact",
  "om oss": "/about",
  startsida: "/",
  "tjänster": "/#services",
};

/**
 * Top-level routes that are real pages (each has app/<route>/page.tsx; a test
 * keeps this list honest). Paths outside it are not trusted as-is: the model
 * once sent "/services", a home-page section, and visitors landed on a 404.
 */
export const DONNY_PAGE_ROUTES = [
  "about",
  "accessibility",
  "ai-use",
  "blog",
  "colophon",
  "contact",
  "imprint",
  "pricing",
  "privacy-policy",
  "pseo",
  "sitemap",
  "work",
] as const;

const PAGE_ROUTES = new Set<string>(DONNY_PAGE_ROUTES);

/** Routes whose children are pages (projects, posts, programmatic SEO, DS docs). */
const NESTED_ROUTES = new Set<string>(["blog", "pseo", "work", "design-system"]);

function isKnownSitePath(path: string): boolean {
  const [pathname] = path.split("#");
  if (pathname === "/" || pathname === "") return true;
  const segments = pathname.slice(1).split("/").filter(Boolean);
  if (segments.length === 0) return true;
  if (segments.length === 1) return PAGE_ROUTES.has(segments[0]);
  return NESTED_ROUTES.has(segments[0]);
}

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
  if (/\bservices?\b|(?<![\p{L}])(palvelu|tjänst)/u.test(withoutArticle)) {
    return "/#services";
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
    if (!isSafeDonnyRoute(pathOnly.split("#")[0] ?? pathOnly)) {
      return null;
    }
    if (isKnownSitePath(pathOnly)) {
      return pathOnly;
    }
    // Unknown path: read its words as a destination ("/services" -> "services").
    const words = (pathOnly.split("#")[0] ?? "").replace(/[/_-]+/g, " ").trim();
    return words ? resolveSitePagePath(words) : null;
  }

  const sitePath = resolveSitePagePath(normalized);
  if (sitePath) {
    return sitePath;
  }

  return resolveProjectNavigationPath(input);
}
