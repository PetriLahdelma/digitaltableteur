import type {
  PseoCatalog,
  PseoCatalogItem,
  PseoLeafPage,
  PseoLeafPageKey,
} from "./types";

import catalog from "@/content/pseo/catalog.json";

const toLeafSlug = ({ serviceSlug, stackSlug, audienceSlug }: PseoLeafPageKey) =>
  `${serviceSlug}-${stackSlug}-${audienceSlug}`;

const titleCase = (text: string) =>
  text.replace(/\b\w/g, (match) => match.toUpperCase());

const buildLeafTitle = (
  service: PseoCatalogItem,
  stack: PseoCatalogItem,
  audience: PseoCatalogItem,
) => `${service.name} for ${audience.name} using ${stack.name}`;

const buildLeafDescription = (
  service: PseoCatalogItem,
  stack: PseoCatalogItem,
  audience: PseoCatalogItem,
) =>
  `${service.shortDescription} Tailored for ${audience.name} shipping with ${stack.name}.`;

export function getPseoCatalog(): PseoCatalog {
  return catalog as unknown as PseoCatalog;
}

export function getPseoLeafPages(): PseoLeafPage[] {
  const { services, stacks, audiences, generation } = getPseoCatalog();

  const pages: PseoLeafPage[] = [];
  for (const service of services) {
    for (const stack of stacks) {
      for (const audience of audiences) {
        const slug = toLeafSlug({
          serviceSlug: service.slug,
          stackSlug: stack.slug,
          audienceSlug: audience.slug,
        });
        pages.push({
          slug,
          title: titleCase(buildLeafTitle(service, stack, audience)),
          description: buildLeafDescription(service, stack, audience),
          service,
          stack,
          audience,
          tags: [service.slug, stack.slug, audience.slug],
        });
      }
    }
  }

  const max = generation?.maxLeafPages;
  return typeof max === "number" ? pages.slice(0, max) : pages;
}

export function getPseoLeafPageBySlug(slug: string): PseoLeafPage | undefined {
  return getPseoLeafPages().find((p) => p.slug === slug);
}

export function getPseoServiceBySlug(slug: string): PseoCatalogItem | undefined {
  return getPseoCatalog().services.find((item) => item.slug === slug);
}

export function getPseoStackBySlug(slug: string): PseoCatalogItem | undefined {
  return getPseoCatalog().stacks.find((item) => item.slug === slug);
}

export function getPseoAudienceBySlug(
  slug: string,
): PseoCatalogItem | undefined {
  return getPseoCatalog().audiences.find((item) => item.slug === slug);
}

export function getRelatedPseoLeafPages(
  page: PseoLeafPage,
  limit: number,
): PseoLeafPage[] {
  const all = getPseoLeafPages();

  const score = (candidate: PseoLeafPage): number => {
    if (candidate.slug === page.slug) return -1;

    let points = 0;
    if (candidate.service.slug === page.service.slug) points += 3;
    if (candidate.stack.slug === page.stack.slug) points += 2;
    if (candidate.audience.slug === page.audience.slug) points += 1;
    return points;
  };

  return all
    .map((candidate) => ({ candidate, points: score(candidate) }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points || a.candidate.slug.localeCompare(b.candidate.slug))
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

