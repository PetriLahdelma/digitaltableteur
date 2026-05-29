#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, "content");
const sourceDirs = [
  { dir: path.join(contentRoot, "posts"), kind: "post" },
  { dir: path.join(contentRoot, "drafts"), kind: "draft" },
];
const outFile = path.join(
  repoRoot,
  "nextjs-app",
  "shared",
  "data",
  "blogManifest.ts",
);

const showUnpublishedPosts =
  process.env.SHOW_UNPUBLISHED_POSTS === "true" ||
  process.env.NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS === "true";

const draftPattern = /^\s*draft:\s*true\s*$/im;
const unpublishedStatusPattern =
  /^\s*status:\s*["']?(draft|unpublished)["']?\s*$/im;
const scheduledStatusPattern = /^\s*status:\s*["']?scheduled["']?\s*$/im;
const publishedAtPattern = /^\s*publishedAt:\s*["']?([^"'\n]+)["']?\s*$/im;
const slugPattern = /^\s*slug:\s*["']?([^"'\n]+)["']?\s*$/im;

const getFrontmatter = (raw) => {
  if (!raw.startsWith("---")) return "";
  const end = raw.indexOf("\n---", 3);
  return end >= 0 ? raw.slice(0, end + 4) : raw;
};

const isFutureDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
};

const isPublishablePost = (raw, kind) => {
  const frontmatter = getFrontmatter(raw);

  if (showUnpublishedPosts) return true;

  if (
    draftPattern.test(frontmatter) ||
    unpublishedStatusPattern.test(frontmatter)
  ) {
    return false;
  }

  const scheduled = scheduledStatusPattern.test(frontmatter);
  if (kind === "draft" && !scheduled) return false;

  const publishedAt = frontmatter.match(publishedAtPattern)?.[1];
  if (scheduled && !publishedAt) return false;

  return kind === "draft" || scheduled
    ? true
    : !publishedAt || !isFutureDate(publishedAt);
};

const getSlug = (raw, filePath) => {
  const frontmatter = getFrontmatter(raw);
  return (
    frontmatter.match(slugPattern)?.[1] ??
    path.basename(filePath).replace(/\.mdx?$/, "")
  );
};

const getImportPath = (filePath) => {
  const relativePath = path
    .relative(path.dirname(outFile), filePath)
    .replace(/\\/g, "/");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
};

const collectMdxFiles = async ({ dir, kind }) => {
  const files = [];

  const walk = async (currentDir) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const filePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(filePath);
        continue;
      }

      if (!entry.name.endsWith(".mdx")) continue;

      const raw = await fs.readFile(filePath, "utf8");
      if (isPublishablePost(raw, kind)) {
        files.push({
          filePath,
          slug: getSlug(raw, filePath),
        });
      }
    }
  };

  try {
    await walk(dir);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  return files;
};

async function manifestIsUpToDate() {
  if (process.env.FORCE_BLOG_MANIFEST === "1") return false;
  try {
    const [outStat, scriptStat] = await Promise.all([
      fs.stat(outFile),
      fs.stat(path.join(repoRoot, "scripts/generate-blog-manifest.mjs")),
    ]);
    if (outStat.mtimeMs < scriptStat.mtimeMs) return false;

    const currentFiles = (await Promise.all(sourceDirs.map(collectMdxFiles)))
      .flat()
      .sort((a, b) => a.slug.localeCompare(b.slug));
    const currentSlugs = currentFiles.map(({ slug }) => slug).join("\0");
    const existingContent = await fs.readFile(outFile, "utf8");
    const existingSlugs = [...existingContent.matchAll(/slug: "([^"]+)"/g)]
      .map((match) => match[1])
      .sort()
      .join("\0");
    if (currentSlugs !== existingSlugs) return false;

    let newestContentMtime = 0;
    const walkMtime = async (dir) => {
      let entries;
      try {
        const dirStat = await fs.stat(dir);
        newestContentMtime = Math.max(newestContentMtime, dirStat.mtimeMs);
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch (error) {
        if (error?.code === "ENOENT") return;
        throw error;
      }
      for (const entry of entries) {
        const filePath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walkMtime(filePath);
          continue;
        }
        if (!/\.mdx?$/i.test(entry.name)) continue;
        const stat = await fs.stat(filePath);
        newestContentMtime = Math.max(newestContentMtime, stat.mtimeMs);
      }
    };
    for (const { dir } of sourceDirs) {
      await walkMtime(dir);
    }
    return outStat.mtimeMs >= newestContentMtime;
  } catch {
    return false;
  }
}

async function main() {
  try {
    if (await manifestIsUpToDate()) {
      console.log(
        `Skipping blog manifest (up to date): ${path.relative(repoRoot, outFile)}`,
      );
      return;
    }

    await fs.mkdir(path.dirname(outFile), { recursive: true });

    const mdxFiles = (await Promise.all(sourceDirs.map(collectMdxFiles)))
      .flat()
      .sort((a, b) => a.slug.localeCompare(b.slug));

    const importLines = [];
    const entryLines = [];

    mdxFiles.forEach(({ filePath, slug }, idx) => {
      const importName = `Post${idx}`;
      const frontmatterImportName = `${importName}Frontmatter`;
      const relImport = getImportPath(filePath);
      importLines.push(
        `import ${importName}, {\n  frontmatter as ${frontmatterImportName},\n} from "${relImport}";`,
      );
      entryLines.push(
        `  {\n    slug: "${slug}",\n    Component: ${importName} as unknown as import("react").ComponentType,\n    frontmatter: ${frontmatterImportName},\n  },`,
      );
    });

    const content = `// AUTO-GENERATED by scripts/generate-blog-manifest.mjs
// Do not edit manually.
${importLines.join("\n")}\n\nexport type BlogManifestEntry = {
  slug: string;
  Component: import("react").ComponentType;
  frontmatter?: {
    title?: string;
    excerpt?: string;
    readTime?: string;
    publishedAt?: string;
    intendedPublishedAt?: string;
    draft?: boolean;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    legacyUrl?: string;
    authorName?: string;
    authorSlug?: string;
    mainImageUrl?: string;
    mainImageAlt?: string;
    mainImageCaption?: string;
    tags?: string[];
    modifiedAt?: string;
  };
};

export const blogManifest: BlogManifestEntry[] = [
${entryLines.join("\n")}
];
`;

    await fs.writeFile(outFile, content, "utf8");
    console.log(
      `Generated manifest with ${mdxFiles.length} posts -> ${path.relative(repoRoot, outFile)}`,
    );
  } catch (err) {
    console.error("Failed to generate blog manifest:", err);
    // Write an empty manifest to keep builds working
    const fallback = "export const blogManifest = [] as const;\n";
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, fallback, "utf8");
    process.exitCode = 0;
  }
}

main();
