#!/usr/bin/env node
/* eslint-disable no-console */
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const fsPromises = fs.promises;

const ROOT_DIR = process.cwd();
const TARGET_DIR = path.join(ROOT_DIR, "src/pages");
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ALT_MODEL = process.env.OPENAI_ALT_MODEL || "gpt-4o-mini";
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
const FORCE_MODE = process.argv.includes("--force");

if (!OPENAI_API_KEY) {
  console.error(
    "[alt-text] Missing OPENAI_API_KEY. Add it to .env.local before running this script.",
  );
  process.exit(1);
}

const IMG_TAG_REGEX = /<img\b[\s\S]*?>/g;
const ATTRIBUTE_REGEX =
  /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*({(?:[^{}]|{[^{}]*})*}|"[^"]*"|'[^']*')/g;
const PLACEHOLDER_ALT_PATTERNS = [
  /^\s*$/,
  /^\s*[.\-]\s*$/,
  /sorry[^.]+can't view or describe/i,
  /\bplaceholder\b/i,
];

function normalizeAttributeValue(rawValue) {
  const trimmed = rawValue.trim();
  const startsWithBrace = trimmed.startsWith("{") && trimmed.endsWith("}");
  const unwrap = (value) => value.slice(1, -1);

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return { kind: "literal", value: unwrap(trimmed) };
  }

  if (startsWithBrace) {
    const inner = trimmed.slice(1, -1).trim();
    if (
      (inner.startsWith('"') && inner.endsWith('"')) ||
      (inner.startsWith("'") && inner.endsWith("'"))
    ) {
      return { kind: "literal", value: inner.slice(1, -1) };
    }
    return { kind: "expression", value: inner };
  }

  return { kind: "other", value: trimmed };
}

function extractAttributes(tag) {
  const attributes = new Map();
  let match;
  while ((match = ATTRIBUTE_REGEX.exec(tag))) {
    const [fullMatch, name, rawValue] = match;
    attributes.set(name, {
      fullMatch,
      start: match.index,
      end: match.index + fullMatch.length,
      rawValue,
      normalized: normalizeAttributeValue(rawValue),
    });
  }
  return attributes;
}

function sanitizeAltText(value) {
  return value.replace(/\s+/g, " ").trim().replace(/"/g, "&quot;");
}

function shouldReplaceAlt(text) {
  if (FORCE_MODE) return true;
  const normalized = (text || "").trim();
  if (!normalized) return true;
  return PLACEHOLDER_ALT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function stripQuery(value) {
  return value.split("?")[0];
}

function resolveLiteralPath(value, fileDir) {
  if (/^https?:\/\//i.test(value)) {
    return null;
  }
  if (value.startsWith("/")) {
    const candidate = path.join(ROOT_DIR, "public", value.slice(1));
    if (fs.existsSync(candidate)) return candidate;
    return null;
  }
  const candidate = path.resolve(fileDir, value);
  if (fs.existsSync(candidate)) return candidate;
  return null;
}

function buildImportMap(content, fileDir) {
  const importRegex =
    /import\s+([\w$]+)\s+from\s+["']([^"']+\.(?:png|jpe?g|gif|webp|svg))["'];?/g;
  const map = new Map();
  let match;
  while ((match = importRegex.exec(content))) {
    const [, localName, importPath] = match;
    const resolved = path.resolve(fileDir, importPath);
    map.set(localName, resolved);
  }
  return map;
}

function resolveImagePath(srcAttr, fileDir, importMap) {
  if (!srcAttr) return null;
  const { kind, value } = srcAttr.normalized;

  if (kind === "literal") {
    return resolveLiteralPath(stripQuery(value), fileDir);
  }

  if (kind === "expression") {
    const identifierMatch = value.match(/^[A-Za-z_$][\w$]*$/);
    if (identifierMatch && importMap.has(value)) {
      return importMap.get(value);
    }
    if (value.startsWith('"') || value.startsWith("'")) {
      return resolveLiteralPath(
        stripQuery(value.slice(1, -1)),
        fileDir,
      );
    }
  }

  return null;
}

async function generateAltText(imagePath, contextHint) {
  const buffer = await fsPromises.readFile(imagePath);
  const mimeType = getMimeType(imagePath);
  const base64 = buffer.toString("base64");
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_ALT_MODEL,
      max_tokens: 120,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You craft concise, vivid alternative text (<18 words) for web images. Avoid filler such as 'image of'.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Describe the image for screen reader users. ${
                contextHint ? `Context: ${contextHint}` : ""
              }`,
            },
            {
              type: "input_image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI request failed (${response.status}): ${await response.text()}`,
    );
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content ?? "";
  if (Array.isArray(content)) {
    content = content
      .map((part) => part.text || "")
      .join(" ")
      .trim();
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenAI response did not include alt text");
  }

  return sanitizeAltText(content);
}

async function maybeUpdateImageTag(tag, filePath, importMap, fileDir) {
  const attributes = extractAttributes(tag);
  const srcAttr = attributes.get("src");

  if (!srcAttr) {
    return { updatedTag: tag, changed: false };
  }

  const imagePath = resolveImagePath(srcAttr, fileDir, importMap);
  if (!imagePath) {
    console.warn(
      `[alt-text] Skipping tag in ${path.relative(
        ROOT_DIR,
        filePath,
      )}: unable to resolve image source.`,
    );
    return { updatedTag: tag, changed: false };
  }

  const ext = path.extname(imagePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return { updatedTag: tag, changed: false };
  }

  const altAttr = attributes.get("alt");
  const existingAlt =
    altAttr && altAttr.normalized.kind === "literal"
      ? altAttr.normalized.value
      : "";

  if (altAttr && altAttr.normalized.kind === "expression" && !FORCE_MODE) {
    return { updatedTag: tag, changed: false };
  }

  if (!shouldReplaceAlt(existingAlt)) {
    return { updatedTag: tag, changed: false };
  }

  const contextHint = `${path.relative(
    ROOT_DIR,
    filePath,
  )} references ${path.basename(imagePath)}`;

  let altText;
  try {
    altText = await generateAltText(imagePath, contextHint);
  } catch (error) {
    console.error(
      `[alt-text] Failed to create alt text for ${path.basename(
        imagePath,
      )}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { updatedTag: tag, changed: false };
  }

  let updatedTag = tag;
  if (altAttr) {
    updatedTag =
      tag.slice(0, altAttr.start) +
      `alt="${altText}"` +
      tag.slice(altAttr.end);
  } else {
    const insertionPoint = tag.endsWith("/>")
      ? tag.lastIndexOf("/>")
      : tag.lastIndexOf(">");
    updatedTag =
      tag.slice(0, insertionPoint) +
      ` alt="${altText}"` +
      tag.slice(insertionPoint);
  }

  console.log(
    `[alt-text] ${path.relative(ROOT_DIR, filePath)} → ${
      path.basename(imagePath)
    }`,
  );

  return { updatedTag, changed: true };
}

async function processFile(filePath) {
  const fileDir = path.dirname(filePath);
  let content = await fsPromises.readFile(filePath, "utf8");
  const importMap = buildImportMap(content, fileDir);
  const matches = [...content.matchAll(IMG_TAG_REGEX)];
  if (!matches.length) return;

  let cursor = 0;
  let mutated = false;
  let nextContent = "";

  for (const match of matches) {
    const [tag] = match;
    const start = match.index;
    nextContent += content.slice(cursor, start);
    const { updatedTag, changed } = await maybeUpdateImageTag(
      tag,
      filePath,
      importMap,
      fileDir,
    );
    nextContent += updatedTag;
    cursor = start + tag.length;
    mutated = mutated || changed;
  }

  nextContent += content.slice(cursor);
  if (mutated) {
    await fsPromises.writeFile(filePath, nextContent, "utf8");
  }
}

function collectTsxFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsxFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

(async () => {
  const files = collectTsxFiles(TARGET_DIR);
  for (const file of files) {
    await processFile(file);
  }
})();
