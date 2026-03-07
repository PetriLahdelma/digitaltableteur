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

function slugify(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
          const caption = node.caption
            ? `\n<figcaption>${escapeHtmlText(node.caption)}</figcaption>`
            : "";
          return `![${alt}](${url})${caption}`;
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
    console.warn(`[draft-sync] Skipping post without slug (${post._id}).`);
    return null;
  }
  const safeSlug = toSafeFileNameSegment(slug);
  if (!safeSlug) {
    console.warn(`[draft-sync] Skipping post with unsafe slug (${post._id}).`);
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
        `[draft-sync] Failed to parse existing frontmatter for ${slug}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  const frontmatter = buildFrontmatter(post, existingData);
  atomicWriteFile(filePath, `${frontmatter}${markdown}\n`);
  return filePath;
}

async function main() {
  try {
    assertEnv();

    // Get document ID from command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error("Usage: node syncDraftById.js <document-id>");
      console.error(
        "Example: node syncDraftById.js e016b7cf-9dd9-4c72-b172-761186a1a188",
      );
      console.error(
        "Example: node syncDraftById.js drafts.e016b7cf-9dd9-4c72-b172-761186a1a188",
      );
      process.exit(1);
    }

    const inputId = args[0];
    console.log(`[draft-sync] Looking for document: ${inputId}`);

    const client = createClient({
      projectId: process.env.SANITY_PROJECT_ID.replace(/["']/g, ""),
      dataset: process.env.SANITY_DATASET.replace(/["']/g, ""),
      token: process.env.SANITY_TOKEN?.replace(/["']/g, ""),
      apiVersion: "2024-01-01",
      useCdn: false,
      perspective: "previewDrafts", // This ensures we get draft versions
    });
    const builder = imageUrlBuilder(client);

    // Try both with and without 'drafts.' prefix
    const idsToTry = [
      inputId,
      inputId.startsWith("drafts.")
        ? inputId.replace("drafts.", "")
        : `drafts.${inputId}`,
    ];

    console.log(`[draft-sync] Trying IDs: ${idsToTry.join(", ")}`);

    let post = null;
    let foundId = null;

    for (const id of idsToTry) {
      const query = `*[_id == $id][0]{
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

      const result = await client.fetch(query, { id });
      if (result) {
        post = result;
        foundId = id;
        break;
      }
    }

    if (!post) {
      console.error(
        `[draft-sync] Document not found with any of these IDs: ${idsToTry.join(", ")}`,
      );
      console.log("\n[draft-sync] Available documents in dataset:");

      const allDocs = await client.fetch(
        `*[_type == "post"]{ _id, title, slug, publishedAt } | order(_updatedAt desc)[0...20]`,
      );
      allDocs.forEach((doc) => {
        console.log(
          `  - ${doc._id}: "${doc.title}" (${doc.slug?.current || "no slug"})`,
        );
      });

      process.exit(1);
    }

    console.log(`[draft-sync] Found document: ${foundId}`);
    console.log(`  Title: ${post.title}`);
    console.log(`  Slug: ${post.slug?.current || "No slug"}`);
    console.log(`  Published: ${post.publishedAt || "Not published"}`);

    const slug = post.slug?.current || slugify(post.title || "");
    if (!slug) {
      console.error(
        `[draft-sync] Cannot generate slug for document ${foundId}`,
      );
      process.exit(1);
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
      console.log(
        `[draft-sync] ✅ Successfully wrote ${path.relative(ROOT_DIR, filePath)}`,
      );
      console.log(
        `[draft-sync] File size: ${fs.statSync(filePath).size} bytes`,
      );
    } else {
      console.error(`[draft-sync] Failed to write post file`);
      process.exit(1);
    }
  } catch (error) {
    console.error("[draft-sync] Failed to sync draft from Sanity.");
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  }
}

main();
