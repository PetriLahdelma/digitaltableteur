// Author registry. Originally implemented with `import.meta.glob(...)` so a new
// author could be added by dropping a JSON file in `content/authors/`. That
// indirection routed the call through a `globFn` variable, which Vite's
// static-analysis pass cannot rewrite — `import.meta.glob` only works as a
// literal call expression. The fallback object was what actually ran in both
// bundlers (Vitest emitted an error on the indirect form; Next.js's webpack
// never had `import.meta.glob` to begin with), so the dynamic discovery was
// dead code wrapped in a broken try.
//
// Replaced 2026-05-26 with an explicit, type-safe import map. New authors
// land via a JSON file + a one-line registration here. If the file count
// grows past ~5, replace with a build-time manifest similar to
// scripts/generate-blog-manifest.mjs (which uses real fs walking at
// prebuild time and emits JSON the runtime can `import` statically).

import petriAuthor from "../../../content/authors/petri-lahdelma.json";

export type AuthorEntry = {
  name: string;
  slug: string;
  imageUrl?: string;
  bio?: string;
};

type AuthorSource = {
  slug: string;
  filePath: string;
  data: AuthorEntry;
};

const SOURCES: AuthorSource[] = [
  {
    slug: "petri-lahdelma",
    filePath: "content/authors/petri-lahdelma.json",
    data: petriAuthor as AuthorEntry,
  },
];

const normalizeSlug = (entry: AuthorEntry, fallback: string) =>
  entry.slug?.length ? entry.slug : fallback;

const entries: AuthorEntry[] = SOURCES.map(({ slug, data }) => ({
  ...data,
  slug: normalizeSlug(data, slug),
})).sort((a, b) => a.name.localeCompare(b.name));

const authorMap = new Map(entries.map((entry) => [entry.slug, entry]));

export const getAuthors = () => entries;

export const getAuthorBySlug = (slug: string | undefined | null) => {
  if (!slug) return undefined;
  return authorMap.get(slug);
};
