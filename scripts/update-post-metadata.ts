import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Frontmatter = {
  title?: string;
  slug?: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  intendedPublishedAt?: string;
  draft?: boolean;
  status?: string;
  modifiedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  legacyUrl?: string;
  authorName?: string;
  authorSlug?: string;
  mainImageUrl?: string;
  mainImageAlt?: string;
  mainImageCaption?: string;
  tags?: string[];
};

type PostMeta = Required<Pick<Frontmatter, "title" | "slug">> &
  Omit<Frontmatter, "title" | "slug">;

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const DRAFTS_DIR = path.join(ROOT, "content", "drafts");
const OUTPUTS = [
  // Next.js App Router (production)
  path.join(ROOT, "app", "blog", "postMetadata.ts"),
];

const SHOW_UNPUBLISHED_POSTS =
  process.env.SHOW_UNPUBLISHED_POSTS === "true" ||
  process.env.NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS === "true";

const isBundledPost = (post: PostMeta, kind: "post" | "draft") => {
  if (SHOW_UNPUBLISHED_POSTS) return true;
  if (post.draft || post.status === "draft" || post.status === "unpublished") {
    return false;
  }

  if (kind === "draft") {
    return post.status === "scheduled" && Boolean(post.publishedAt);
  }

  return true;
};

const readFrontmatter = (filePath: string): PostMeta => {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const fm = data as Frontmatter;
  const fileSlug = path.basename(filePath).replace(/\.mdx?$/, "");
  return {
    title: fm.title ?? fileSlug,
    slug: fm.slug ?? fileSlug,
    excerpt: fm.excerpt,
    readTime: fm.readTime,
    publishedAt: fm.publishedAt,
    intendedPublishedAt: fm.intendedPublishedAt,
    draft: fm.draft,
    status: fm.status,
    modifiedAt: fm.modifiedAt,
    seoTitle: fm.seoTitle,
    seoDescription: fm.seoDescription,
    legacyUrl: fm.legacyUrl,
    authorName: fm.authorName,
    authorSlug: fm.authorSlug,
    mainImageUrl: fm.mainImageUrl,
    mainImageAlt: fm.mainImageAlt,
    mainImageCaption: fm.mainImageCaption,
    tags: fm.tags,
  };
};

const formatValue = (value: unknown) => JSON.stringify(value);

const formatPost = (post: PostMeta) => {
  const entries = Object.entries(post).filter(
    ([key, value]) => value !== undefined && key !== "intendedPublishedAt",
  );
  const lines = entries.map(
    ([key, value]) => `    ${key}: ${formatValue(value)},`,
  );
  return ["  {", ...lines, "  }"].join("\n");
};

const collectPostFiles = (dir: string, kind: "post" | "draft") => {
  if (!fs.existsSync(dir)) return [];

  const files: string[] = [];
  const walk = (currentDir: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const filePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
        continue;
      }

      if (entry.name.endsWith(".mdx")) {
        files.push(filePath);
      }
    }
  };

  walk(dir);

  return files.map(readFrontmatter).filter((post) => isBundledPost(post, kind));
};

const newestMtime = (dirs: string[]) => {
  let newest = 0;
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    newest = Math.max(newest, fs.statSync(dir).mtimeMs);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
        continue;
      }
      if (!/\.mdx?$/i.test(entry.name)) continue;
      newest = Math.max(newest, fs.statSync(filePath).mtimeMs);
    }
  };
  for (const dir of dirs) walk(dir);
  return newest;
};

const collectBundledSlugs = () =>
  [
    ...collectPostFiles(POSTS_DIR, "post"),
    ...collectPostFiles(DRAFTS_DIR, "draft"),
  ]
    .map((post) => post.slug)
    .sort()
    .join("\0");

const readOutputSlugs = (outputPath: string) =>
  [...fs.readFileSync(outputPath, "utf8").matchAll(/slug: "([^"]+)"/g)]
    .map((match) => match[1])
    .sort()
    .join("\0");

const metadataIsUpToDate = () => {
  if (process.env.FORCE_POST_METADATA === "1") return false;
  try {
    const scriptMtime = fs.statSync(__filename).mtimeMs;
    const currentSlugs = collectBundledSlugs();
    const slugsMatch = OUTPUTS.every(
      (outputPath) => readOutputSlugs(outputPath) === currentSlugs,
    );
    if (!slugsMatch) return false;

    const contentMtime = newestMtime([POSTS_DIR, DRAFTS_DIR]);
    return OUTPUTS.every((outputPath) => {
      const outStat = fs.statSync(outputPath);
      return (
        outStat.mtimeMs >= contentMtime && outStat.mtimeMs >= scriptMtime
      );
    });
  } catch {
    return false;
  }
};

const generate = () => {
  if (metadataIsUpToDate()) {
    console.log("Skipping post metadata (up to date).");
    return;
  }

  const posts = [
    ...collectPostFiles(POSTS_DIR, "post"),
    ...collectPostFiles(DRAFTS_DIR, "draft"),
  ].sort((a, b) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });

  const fileContent = `// Auto-generated by scripts/update-post-metadata.ts. Do not edit manually.
import {
  isPostVisible,
  shouldShowUnpublishedPosts,
} from "@/lib/blog/postVisibility";

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  intendedPublishedAt?: string;
  draft?: boolean;
  status?: string;
  modifiedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  legacyUrl?: string;
  authorName?: string;
  authorSlug?: string;
  mainImageUrl?: string;
  mainImageAlt?: string;
  mainImageCaption?: string;
  tags?: string[];
};

export const allPosts: BlogPostMeta[] = [
${posts.map(formatPost).join(",\n")}
];

export const getVisiblePosts = (options?: { showUnpublished?: boolean }) =>
  allPosts.filter((post) =>
    isPostVisible(post, options?.showUnpublished ?? shouldShowUnpublishedPosts()),
  );

export const getPostMetaBySlug = (
  slug?: string | null,
  options?: { showUnpublished?: boolean },
) =>
  slug
    ? getVisiblePosts(options).find((post) => post.slug === slug)
    : undefined;
`;

  for (const outputPath of OUTPUTS) {
    fs.writeFileSync(outputPath, fileContent, "utf8");
    console.log(
      `Wrote ${posts.length} posts to ${path.relative(ROOT, outputPath)}`,
    );
  }
};

generate();
