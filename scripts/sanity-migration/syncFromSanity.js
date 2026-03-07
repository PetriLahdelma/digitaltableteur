#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@sanity/client");
const imageUrlBuilder = require("@sanity/image-url");
const blocksToMarkdown = require("@sanity/block-content-to-markdown");
const matter = require("gray-matter");

const ROOT_DIR = process.cwd();
const envLocal = path.join(ROOT_DIR, ".env.local");
require("dotenv").config();
if (fs.existsSync(envLocal)) {
  require("dotenv").config({ path: envLocal, override: false });
}

const CONTENT_DIR = path.join(ROOT_DIR, "content/posts");
const AUTHORS_DIR = path.join(ROOT_DIR, "content/authors");
const ARCHIVE_DIR = path.join(ROOT_DIR, "content/archive");
const REDIRECTS_FILE = path.join(ROOT_DIR, "public/_redirects");

function assertEnv() {
  if (!process.env.SANITY_PROJECT_ID) {
    throw new Error("SANITY_PROJECT_ID is not defined");
  }
  if (!process.env.SANITY_DATASET) {
    throw new Error("SANITY_DATASET is not defined");
  }
  if (!process.env.SANITY_TOKEN) {
    throw new Error("SANITY_TOKEN is not defined");
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function toQuotedFrontmatterValue(value) {
  return JSON.stringify(String(value));
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttribute(value) {
  return escapeHtmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSafeEmbedUrl(value) {
  try {
    const parsed = new URL(String(value));
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function toSafeProviderName(value) {
  const sanitized = String(value || "embed")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return sanitized || "embed";
}

function toSafeFileNameSegment(value) {
  const normalized = slugify(String(value || ""));
  return normalized || null;
}

function atomicWriteFile(filePath, content) {
  const directory = path.dirname(filePath);
  ensureDir(directory);
  const tempPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${crypto.randomUUID()}.tmp`,
  );

  try {
    fs.writeFileSync(tempPath, content, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

function buildFrontmatter(post, existing = {}) {
  const mappings = {
    title: post.title,
    slug: post.slug?.current,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
    excerpt: post.excerpt,
    legacyUrl: post.legacy?.url,
    seoTitle: post.seo?.title,
    seoDescription: post.seo?.description,
    authorName: post.author?.name,
    authorSlug: post.author?.slug?.current || post.authorSlug,
    mainImageUrl: post.mainImageUrl,
    mainImageAlt: post.mainImageAlt,
    mainImageCaption: post.mainImageCaption,
  };
  const merged = { ...existing };
  Object.entries(mappings).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  });
  const preferredOrder = [
    "title",
    "slug",
    "publishedAt",
    "readTime",
    "excerpt",
    "legacyUrl",
    "seoTitle",
    "seoDescription",
    "authorName",
    "authorSlug",
  ];
  const orderedKeys = [
    ...preferredOrder.filter((key) => merged[key] !== undefined),
    ...Object.keys(merged)
      .filter((key) => !preferredOrder.includes(key))
      .sort(),
  ].filter((key, index, array) => array.indexOf(key) === index);
  const lines = ["---"];
  orderedKeys.forEach((key) => {
    const value = merged[key];
    if (value === undefined || value === null || value === "") return;
    lines.push(`${key}: ${toQuotedFrontmatterValue(value)}`);
  });
  lines.push("---", "");
  return `${lines.join("\n")}\n`;
}

function slugify(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildCodeFence(code, language) {
  const matches = code.match(/`+/g) || [];
  const longest = matches.reduce(
    (max, run) => Math.max(max, run.length),
    0,
  );
  const fence = "`".repeat(Math.max(3, longest + 1));
  const safeLanguage = typeof language === "string"
    ? language.replace(/`/g, "").trim()
    : "";
  return `\n${fence}${safeLanguage}\n${code}\n${fence}\n`;
}

function buildMarkdown(body, urlBuilder) {
  if (!Array.isArray(body)) return "";
  let markdown = blocksToMarkdown(body, {
    serializers: {
      types: {
        image: ({ node }) => {
          if (!node?.asset?._ref) return "";
          const url = urlBuilder.image(node).width(1600).url();
          const alt = node.alt ? node.alt.replace(/]/g, "\\]") : "";
          // Wrap image and figcaption in figure tags to prevent hydration errors
          // MDX auto-wraps content in <p> tags, but <figcaption> cannot be a child of <p>
          if (node.caption) {
            return `<figure>\n\n![${alt}](${url})\n\n<figcaption>${escapeHtmlText(node.caption)}</figcaption>\n\n</figure>`;
          }
          return `![${alt}](${url})`;
        },
        embed: ({ node }) => {
          if (!node?.url) return "";
          const provider = toSafeProviderName(node.provider);
          const url = toSafeEmbedUrl(node.url);
          if (!url) return "";
          return `\n<Embed provider="${escapeHtmlAttribute(provider)}" url="${escapeHtmlAttribute(url)}" />\n`;
        },
        code: ({ node }) => {
          if (!node?.code) return "";
          const language = node.language ? node.language : "";
          return buildCodeFence(node.code, language);
        },
        divider: () => "\n---\n",
      },
    },
  }).trim();

  // Fix malformed HTML tags and attributes in multiple passes
  // Pass 1: Fix missing space after tag name (e.g., <iframewidth -> <iframe width)
  markdown = markdown.replace(
    /<(iframe|div|span|img|video|audio|embed)([a-z]+=")/gi,
    "<$1 $2",
  );

  // Pass 2: Fix missing spaces between attributes ending with " and next attribute
  markdown = markdown.replace(/(="[^"]*")([a-z]+=")/gi, "$1 $2");

  // Pass 3: Fix missing spaces between attributes ending with " and next attribute (catch stragglers)
  markdown = markdown.replace(/(")(\w+=")/g, "$1 $2");

  // Pass 4: Fix boolean attributes without spaces (e.g., allowFullScreen immediately after ")
  markdown = markdown.replace(/(")(allow[A-Z]\w+)/g, "$1 $2");

  return markdown;
}

function writePostFile(post, markdown) {
  ensureDir(CONTENT_DIR);
  const slug = post.slug?.current;
  if (!slug) {
    console.warn(`[sanity-sync] Skipping post without slug (${post._id}).`);
    return null;
  }
  const safeSlug = toSafeFileNameSegment(slug);
  if (!safeSlug) {
    console.warn(`[sanity-sync] Skipping post with unsafe slug (${post._id}).`);
    return null;
  }
  const filePath = path.join(CONTENT_DIR, `${safeSlug}.mdx`);
  let existingData = {};
  if (fs.existsSync(filePath)) {
    try {
      const parsed = matter.read(filePath);
      existingData = parsed.data ?? {};
    } catch (error) {
      console.warn(
        `[sanity-sync] Failed to parse existing frontmatter for ${slug}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  const frontmatter = buildFrontmatter(post, existingData);
  atomicWriteFile(filePath, `${frontmatter}${markdown}\n`);
  return filePath;
}

function writeAuthorFile(author, urlBuilder) {
  ensureDir(AUTHORS_DIR);
  const slug = toSafeFileNameSegment(author.slug?.current || author.name || "");
  if (!slug) {
    console.warn(`[sanity-sync] Skipping author without slug (${author._id}).`);
    return null;
  }
  const imageUrl = author.image?.asset
    ? urlBuilder.image(author.image).width(400).height(400).fit("crop").url()
    : undefined;
  const bioMarkdown = buildMarkdown(author.bio || [], urlBuilder);
  const payload = {
    name: author.name,
    slug,
    imageUrl,
    bio: bioMarkdown,
  };
  const filePath = path.join(AUTHORS_DIR, `${slug}.json`);
  atomicWriteFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
  return filePath;
}

function pruneOrphans(validSlugs) {
  if (!fs.existsSync(CONTENT_DIR)) return;
  const archiveTarget = path.join(ARCHIVE_DIR, "posts");
  ensureDir(archiveTarget);
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"));
  files.forEach((file) => {
    const slug = file.replace(/\.mdx$/, "");
    if (!validSlugs.has(slug)) {
      const source = path.join(CONTENT_DIR, file);
      const target = path.join(archiveTarget, `${slug}-${Date.now()}.mdx`);
      fs.renameSync(source, target);
      console.log(`[sanity-sync] Archived ${file}`);
    }
  });
}

function buildRedirects(posts) {
  ensureDir(path.dirname(REDIRECTS_FILE));
  const entries = posts
    .map((post) => {
      const url = post.legacy?.url;
      if (!url) return null;
      try {
        const parsed = new URL(url);
        const from = parsed.pathname.replace(/\/$/, "") || "/";
        const to = `/blog/${post.slug?.current}`;
        if (!to) return null;
        return `${from}  ${to}  301`;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (!entries.length) return;
  atomicWriteFile(REDIRECTS_FILE, `${entries.join("\n")}\n`);
  console.log(
    `[sanity-sync] Wrote ${entries.length} redirects to ${path.relative(
      ROOT_DIR,
      REDIRECTS_FILE,
    )}`,
  );
}

async function main() {
  try {
    assertEnv();

    // Support single post export via --slug argument
    const targetSlug = process.argv
      .find((arg) => arg.startsWith("--slug="))
      ?.split("=")[1];
    if (targetSlug) {
      console.log(`[sanity-sync] Syncing single post with slug: ${targetSlug}`);
    }

    const client = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      token: process.env.SANITY_TOKEN,
      apiVersion: "2023-10-01",
      useCdn: false,
    });
    const builder = imageUrlBuilder(client);

    // Build query with optional slug filter
    const query = targetSlug
      ? `*[_type == "post" && slug.current == "${targetSlug}"]{
        _id,
        title,
        slug,
        "readTime": coalesce(readTime, readtime),
        excerpt,
        publishedAt,
        body,
        legacy,
        seo,
        author->{name, slug},
        mainImage{
          alt,
          caption,
          asset
        }
      }`
      : `*[_type == "post"]{
        _id,
        title,
        slug,
        "readTime": coalesce(readTime, readtime),
        excerpt,
        publishedAt,
        body,
        legacy,
        seo,
        author->{name, slug},
        mainImage{
          alt,
          caption,
          asset
        }
      }`;

    const posts = await client.fetch(query);
    const authors = await client.fetch(
      `*[_type == "author"]{
        _id,
        name,
        slug,
        image{
          asset
        },
        bio
      }`,
    );
    if (!posts.length) {
      if (targetSlug) {
        console.log(`[sanity-sync] No post found with slug: ${targetSlug}`);
      } else {
        console.log("[sanity-sync] No posts found in Sanity dataset.");
      }
      return;
    }

    const writtenSlugs = new Set();
    posts.forEach((post) => {
      const slug = post.slug?.current || slugify(post.title || "");
      if (!slug) {
        console.warn(`[sanity-sync] Skipping post without slug (${post._id}).`);
        return;
      }
      const mainImageUrl = post.mainImage?.asset?._ref
        ? builder.image(post.mainImage).width(1600).url()
        : undefined;
      const enrichedPost = {
        ...post,
        slug: { current: slug },
        mainImageUrl,
        mainImageAlt: post.mainImage?.alt,
        mainImageCaption: post.mainImage?.caption,
      };
      const markdown = buildMarkdown(post.body || [], builder);
      const filePath = writePostFile(enrichedPost, markdown);
      if (filePath) {
        writtenSlugs.add(slug);
        console.log(`[sanity-sync] Wrote ${path.relative(ROOT_DIR, filePath)}`);
      }
    });

    // Only prune orphans when syncing all posts (not when targeting a single post)
    if (!targetSlug) {
      pruneOrphans(writtenSlugs);
    }

    // Skip author sync when targeting a single post
    let writtenAuthors = 0;
    if (!targetSlug && authors.length) {
      authors.forEach((author) => {
        const filePath = writeAuthorFile(author, builder);
        if (filePath) {
          writtenAuthors += 1;
          console.log(
            `[sanity-sync] Wrote ${path.relative(ROOT_DIR, filePath)}`,
          );
        }
      });
    }

    // Only build redirects when syncing all posts
    if (!targetSlug) {
      buildRedirects(posts);
    }

    console.log(
      `[sanity-sync] Synced ${writtenSlugs.size} posts and ${writtenAuthors} authors from Sanity.`,
    );
  } catch (error) {
    console.error("[sanity-sync] Failed to sync posts from Sanity.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
