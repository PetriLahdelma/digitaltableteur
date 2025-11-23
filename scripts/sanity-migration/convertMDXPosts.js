#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { randomUUID } = require("node:crypto");

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUTPUT_DIR = path.join(process.cwd(), "sanity-output");
const OUTPUT_NDJSON = path.join(OUTPUT_DIR, "mdx-posts.ndjson");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function convertMDXToSanityBlocks(content) {
  const blocks = [];
  const lines = content.split("\n");
  let currentBlock = null;

  for (const line of lines) {
    // Headings
    if (line.startsWith("## ")) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        _type: "block",
        _key: randomUUID(),
        style: "h2",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: randomUUID(),
            marks: [],
            text: line.replace(/^## /, ""),
          },
        ],
      };
    } else if (line.startsWith("### ")) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        _type: "block",
        _key: randomUUID(),
        style: "h3",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: randomUUID(),
            marks: [],
            text: line.replace(/^### /, ""),
          },
        ],
      };
    } else if (line.startsWith("> ")) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        _type: "block",
        _key: randomUUID(),
        style: "blockquote",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: randomUUID(),
            marks: [],
            text: line.replace(/^> /, ""),
          },
        ],
      };
    } else if (line.trim() === "") {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    } else if (line.trim()) {
      // Regular paragraph
      if (!currentBlock || currentBlock.style !== "normal") {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          _type: "block",
          _key: randomUUID(),
          style: "normal",
          markDefs: [],
          children: [],
        };
      }
      currentBlock.children.push({
        _type: "span",
        _key: randomUUID(),
        marks: [],
        text: line,
      });
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  // Add divider and Share/Similar Reads sections at the end
  blocks.push({ _type: "divider", _key: randomUUID() });
  blocks.push({
    _type: "block",
    _key: randomUUID(),
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: randomUUID(), marks: [], text: "Share" }],
  });
  blocks.push({
    _type: "block",
    _key: randomUUID(),
    style: "h2",
    markDefs: [],
    children: [
      { _type: "span", _key: randomUUID(), marks: [], text: "Similar Reads" },
    ],
  });

  return blocks;
}

function convertMDXToSanity(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter, content } = matter(fileContent);

  const slug = frontmatter.slug || path.basename(filePath, ".mdx");
  const authorSlug = frontmatter.authorSlug || "petri-lahdelma";

  return {
    _id: `post.${slug}`,
    _type: "post",
    title: frontmatter.title,
    slug: {
      _type: "slug",
      current: slug,
    },
    readTime: frontmatter.readTime || "5 min read",
    excerpt: frontmatter.excerpt || "",
    publishedAt: frontmatter.publishedAt,
    author: {
      _type: "reference",
      _ref: `author.${authorSlug}`,
    },
    _migration: {
      authorName: frontmatter.authorName || "Petri Lahdelma",
      authorSlug: authorSlug,
    },
    legacy: {
      url: `https://digitaltableteur.com/blog/${slug}`,
    },
    seo: {
      title: `${frontmatter.title} | Digitaltableteur`,
      description: frontmatter.excerpt || "",
    },
    tags: [],
    body: convertMDXToSanityBlocks(content),
  };
}

function main() {
  try {
    ensureDir(OUTPUT_DIR);

    const files = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".mdx"));

    const documents = files.map((file) =>
      convertMDXToSanity(path.join(POSTS_DIR, file)),
    );

    fs.writeFileSync(
      OUTPUT_NDJSON,
      documents.map((doc) => JSON.stringify(doc)).join("\n"),
      "utf8",
    );

    console.log(`✓ Converted ${documents.length} MDX posts to Sanity format`);
    console.log(`✓ Output: ${OUTPUT_NDJSON}`);
    console.log(
      `\nNext: cd digitaltableteur-blog && npx sanity dataset import ../sanity-output/mdx-posts.ndjson production --replace`,
    );
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
