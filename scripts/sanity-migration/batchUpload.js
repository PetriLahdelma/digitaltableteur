#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { createClient: createSanityClient } = require("@sanity/client");
const crypto = require("node:crypto");

const ROOT_DIR = process.cwd();
const envLocal = path.join(ROOT_DIR, ".env.local");
require("dotenv").config();
if (fs.existsSync(envLocal)) {
  require("dotenv").config({ path: envLocal, override: false });
}

const INPUT_FILE = path.join(ROOT_DIR, "sanity-output", "sanity-documents.json");

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

function createClient() {
  assertEnv();
  return createSanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    apiVersion: "2023-10-01",
    useCdn: false,
  });
}

function readDocuments() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(
      `Sanity documents not found at ${path.relative(ROOT_DIR, INPUT_FILE)}. Run "npm run sanity:convert" first.`,
    );
  }
  return JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
}

async function attachAssets(node, client, cache) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of node) {
      // eslint-disable-next-line no-await-in-loop
      await attachAssets(item, client, cache);
    }
    return;
  }

  if (
    node._type === "image" &&
    node.assetPath &&
    fs.existsSync(node.assetPath)
  ) {
    if (!cache.has(node.assetPath)) {
      const stream = fs.createReadStream(node.assetPath);
      // eslint-disable-next-line no-await-in-loop
      const asset = await client.assets.upload("image", stream, {
        filename: path.basename(node.assetPath),
      });
      cache.set(node.assetPath, asset._id);
    }
    node.asset = { _type: "reference", _ref: cache.get(node.assetPath) };
    delete node.assetPath;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(node)) {
    // eslint-disable-next-line no-await-in-loop
    await attachAssets(node[key], client, cache);
  }
}

function slugify(value) {
  if (!value) return "digitaltableteur";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "digitaltableteur";
}

function collectAuthors(documents) {
  const authors = new Map();
  documents.forEach((doc) => {
    const migration = doc._migration || {};
    const name = migration.authorName || "Digitaltableteur";
    const slug = migration.authorSlug || slugify(name);
    if (!authors.has(slug)) {
      authors.set(slug, { slug, name });
    }
  });
  return Array.from(authors.values());
}

async function ensureAuthors(documents, client) {
  const authors = collectAuthors(documents);
  // eslint-disable-next-line no-restricted-syntax
  for (const author of authors) {
    const doc = {
      _id: `author.${author.slug}`,
      _type: "author",
      name: author.name,
      slug: { _type: "slug", current: author.slug },
    };
    // eslint-disable-next-line no-await-in-loop
    await client.createIfNotExists(doc);
  }
}

async function uploadDocuments(documents, client) {
  const assetCache = new Map();
  await ensureAuthors(documents, client);
  // eslint-disable-next-line no-restricted-syntax
  for (const doc of documents) {
    const cloned = JSON.parse(JSON.stringify(doc));
    delete cloned._migration;
    // eslint-disable-next-line no-await-in-loop
    await attachAssets(cloned, client, assetCache);
    if (!cloned.body) cloned.body = [];
    cloned.body = cloned.body.map((block) => {
      if (!block._key) {
        return { ...block, _key: crypto.randomUUID() };
      }
      return block;
    });
    // eslint-disable-next-line no-await-in-loop
    await client.createOrReplace(cloned);
    console.log(`Uploaded ${cloned._id}`);
  }
}

async function main() {
  try {
    const client = createClient();
    const documents = readDocuments();
    await uploadDocuments(documents, client);
    console.log("Sanity upload complete.");
  } catch (error) {
    console.error("[sanity-migration] Failed to upload documents.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
