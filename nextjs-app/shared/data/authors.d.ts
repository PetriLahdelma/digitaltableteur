export type AuthorEntry = {
    name: string;
    slug: string;
    imageUrl?: string;
    /** Purpose-written meta/page description; falls back to a truncated bio. */
    description?: string;
    /** Public contact email; rendered as a mailto link on the author page. */
    email?: string;
    /** Role/title shown under the name in the byline (e.g. "Founder, CEO"). */
    role?: string;
    bio?: string;
};
export declare const getAuthors: () => AuthorEntry[];
export declare const getAuthorBySlug: (slug: string | undefined | null) => AuthorEntry | undefined;
//# sourceMappingURL=authors.d.ts.map