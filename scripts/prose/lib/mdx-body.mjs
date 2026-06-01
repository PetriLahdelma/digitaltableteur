import { readFileSync, writeFileSync } from "node:fs";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

export function splitMdx(source) {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: "", body: source, hadFrontmatter: false };
  }
  return {
    frontmatter: match[0],
    body: source.slice(match[0].length),
    hadFrontmatter: true,
  };
}

export function joinMdx(frontmatter, body) {
  return frontmatter + body;
}

/**
 * Strip fenced code and MDX component lines from slop checks (still check headings/prose).
 */
export function proseOnlyForCheck(body) {
  const lines = body.split("\n");
  const out = [];
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^<\w/.test(line.trim())) continue;
    out.push(line);
  }

  return out.join("\n");
}

export function readMdxFile(filePath) {
  return readFileSync(filePath, "utf8");
}

export function writeMdxFile(filePath, content) {
  writeFileSync(filePath, content, "utf8");
}
