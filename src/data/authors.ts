export type AuthorEntry = {
  name: string;
  slug: string;
  imageUrl?: string | { default: string } | { src: string };
  bio?: string;
};

import petriAuthor from "../../content/authors/petri-lahdelma.json";
import peteVaultBoy from "../assets/images/pete-vault-boy.jpg";

/**
 * Converts a slug to a display name by capitalizing words.
 * Examples: "user-name" → "User Name", "john-doe" → "John Doe"
 */
export const slugToName = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const globFn =
  typeof import.meta !== "undefined" && (import.meta as any).glob
    ? ((import.meta as any).glob as <T>(
        pattern: string,
        opts: any,
      ) => Record<string, T>)
    : undefined;

const modules = globFn?.<AuthorEntry>("../../content/authors/*.json", {
  eager: true,
}) || {
  "../../content/authors/petri-lahdelma.json": petriAuthor as AuthorEntry,
};

const normalizeSlug = (entry: AuthorEntry, filePath: string) => {
  if (entry.slug) return entry.slug;
  const fileName = filePath.split("/").pop() ?? "";
  return fileName.replace(/\.json$/, "");
};

const normalizeName = (entry: AuthorEntry, slug: string) => {
  // If name exists in the JSON, use it
  if (entry.name) return entry.name;
  // Otherwise, generate from slug for Sanity.io compatibility
  return slugToName(slug);
};

const entries: AuthorEntry[] = Object.entries(modules)
  .map(([filePath, mod]) => {
    const slug = normalizeSlug(mod, filePath);
    const name = normalizeName(mod, slug);
    const entry: AuthorEntry = {
      ...mod,
      slug,
      name,
    };
    // Override imageUrl with imported asset for specific authors
    if (slug === "petri-lahdelma") {
      entry.imageUrl = peteVaultBoy;
    }
    return entry;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const authorMap = new Map(entries.map((entry) => [entry.slug, entry]));

export const getAuthors = () => entries;

export const getAuthorBySlug = (slug: string | undefined | null) => {
  if (!slug) return undefined;
  return authorMap.get(slug);
};
