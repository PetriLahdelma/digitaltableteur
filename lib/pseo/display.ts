import type { PseoCatalogItem } from "./types";

/** Known product names that must not be title-cased incorrectly (e.g. Next.Js). */
const PRESERVED_TOKENS: Record<string, string> = {
  nextjs: "Next.js",
  typescript: "TypeScript",
  storybook: "Storybook",
  figma: "Figma",
  react: "React",
};

export function getStackDisplayName(item: PseoCatalogItem): string {
  return item.displayName ?? PRESERVED_TOKENS[item.slug] ?? item.name;
}

export function getServiceDisplayName(item: PseoCatalogItem): string {
  return item.displayName ?? item.name;
}

export function getAudienceDisplayName(item: PseoCatalogItem): string {
  return item.displayName ?? item.name;
}

export function buildLeafTitle(
  service: PseoCatalogItem,
  stack: PseoCatalogItem,
  audience: PseoCatalogItem,
): string {
  return `${getServiceDisplayName(service)} for ${getAudienceDisplayName(audience)} using ${getStackDisplayName(stack)}`;
}

export function buildLeafDescription(
  service: PseoCatalogItem,
  stack: PseoCatalogItem,
  audience: PseoCatalogItem,
): string {
  return `${service.shortDescription} Tailored for ${getAudienceDisplayName(audience)} shipping with ${getStackDisplayName(stack)}.`;
}
