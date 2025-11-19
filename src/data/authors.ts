export type AuthorEntry = {
  name: string;
  slug: string;
  imageUrl?: string;
  bio?: string;
};

const modules = import.meta.glob<AuthorEntry>("../../content/authors/*.json", {
  eager: true,
});

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
