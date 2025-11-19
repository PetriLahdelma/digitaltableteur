#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const crypto = require("node:crypto");

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "sanity-output");
const INPUT_FILE = path.join(OUTPUT_DIR, "parsed-posts.json");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "sanity-documents.json");
const OUTPUT_NDJSON = path.join(OUTPUT_DIR, "sanity-documents.ndjson");

function ensureSource() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(
      'Parsed posts not found. Run "npm run sanity:parse-posts" before converting.',
    );
  }
}

function parseDate(value) {
  if (!value) return undefined;
  const parts = value.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts.map((segment) => Number(segment));
    const iso = new Date(Date.UTC(year, month - 1, day));
    return iso.toISOString();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function slugify(value) {
  if (!value) return "digitaltableteur";
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "digitaltableteur"
  );
}

function normalizeBody(body = []) {
  return body.map((block) => {
    if (!block._key) {
      return { ...block, _key: crypto.randomUUID() };
    }
    return block;
  });
}

function toSanityDocument(post) {
  const publishedAt = parseDate(post.meta.date);
  const slug = post.slug || post.meta.link.replace(/^\/blog\//, "");
  const authorName = (post.author?.name || "Digitaltableteur").trim();
  const authorSlug = slugify(authorName);
  return {
    _id: `post.${slug}`,
    _type: "post",
    title: post.meta.title,
    slug: {
      _type: "slug",
      current: slug,
    },
    readTime: post.meta.readTime,
    excerpt: post.meta.lead,
    publishedAt,
    author: {
      _type: "reference",
      _ref: `author.${authorSlug}`,
    },
    _migration: {
      authorName,
      authorSlug,
    },
    legacy: {
      url: `https://digitaltableteur.com${post.meta.link}`,
    },
    seo: post.seo,
    tags: [],
    body: normalizeBody(post.body),
  };
}

function writeOutputs(documents) {
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(documents, null, 2), "utf8");
  fs.writeFileSync(
    OUTPUT_NDJSON,
    documents.map((doc) => JSON.stringify(doc)).join("\n"),
    "utf8",
  );
}

function main() {
  try {
    ensureSource();
    const parsed = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
    const documents = parsed.map((post) => toSanityDocument(post));
    writeOutputs(documents);
    console.log(
      `Converted ${documents.length} documents into ${path.relative(
        ROOT_DIR,
        OUTPUT_DIR,
      )}`,
    );
  } catch (error) {
    console.error("[sanity-migration] Failed to convert posts.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
