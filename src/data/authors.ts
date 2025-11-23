export type AuthorEntry = {
  name: string;
  slug: string;
  imageUrl?: string;
  bio?: string;
};

import petriAuthor from "../../content/authors/petri-lahdelma.json";

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

const entries: AuthorEntry[] = Object.entries(modules)
  .map(([filePath, mod]) => {
    const slug = normalizeSlug(mod, filePath);
    return {
      ...mod,
      slug,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const authorMap = new Map(entries.map((entry) => [entry.slug, entry]));

export const getAuthors = () => entries;

export const getAuthorBySlug = (slug: string | undefined | null) => {
  if (!slug) return undefined;
  return authorMap.get(slug);
};
