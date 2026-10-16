/**
 * Markdown versions of blog posts for AI agents, built from the MDX source.
 * Served at /blog/<slug>/markdown (and at the post URL for Accept:
 * text/markdown or a .md suffix, through the proxy) and inlined in
 * llms-full.txt. Read at build time; next.config traces content/ into the
 * routes so revalidation finds the files too.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import type { BlogPostMeta } from "@/app/blog/postMetadata";

const CONTENT_DIRS = ["content/posts", "content/drafts"];

type StageDef = { id: string; label: string; phrase?: string };
type PhaseDef = { label: string; stages: string[] };
type StageItem = {
  title: string;
  tag?: string;
  lead?: string;
  description?: string;
  stages: string[];
};

let sourceIndex: Map<string, string> | null = null;

function listMdx(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return listMdx(full);
    return name.endsWith(".mdx") ? [full] : [];
  });
}

function frontmatterSlug(source: string): string | undefined {
  const fm = source.replace(/\r\n?/g, "\n").match(/^---\n([\s\S]*?)\n---/);
  return fm?.[1].match(/^slug:\s*"?([^"\n]+)"?\s*$/m)?.[1];
}

/** slug → absolute MDX path, from content/posts and content/drafts. */
function getSourceIndex(): Map<string, string> {
  if (sourceIndex) return sourceIndex;
  const index = new Map<string, string>();
  for (const dir of CONTENT_DIRS) {
    for (const file of listMdx(path.join(process.cwd(), dir))) {
      const slug = frontmatterSlug(readFileSync(file, "utf8"));
      if (slug && !index.has(slug)) index.set(slug, file);
    }
  }
  sourceIndex = index;
  return index;
}

export function readPostSource(slug: string): string | null {
  const file = getSourceIndex().get(slug);
  return file ? readFileSync(file, "utf8") : null;
}

function absolute(url: string, baseUrl: string): string {
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
}

function stripTags(html: string): string {
  return html
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Turns a plain JS array literal (unquoted keys, double-quoted strings,
 * trailing commas) into JSON without evaluating it. Anything richer than
 * that fails JSON.parse and the block is skipped.
 */
export function literalToJson(literal: string): string {
  let out = "";
  let inString = false;
  for (let i = 0; i < literal.length; i += 1) {
    const ch = literal[i];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += literal[i + 1] ?? "";
        i += 1;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }
    if (ch === "\"") {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "," && /^\s*[\]}]/.test(literal.slice(i + 1))) continue;
    const key = literal.slice(i).match(/^([A-Za-z_$][\w$]*)(\s*):/);
    if (key && !/[\w$]/.test(literal[i - 1] ?? "")) {
      out += `"${key[1]}"${key[2]}:`;
      i += key[0].length - 1;
      continue;
    }
    out += ch;
  }
  return out;
}

const FENCE = /^\s*(```|~~~)/;
// Placeholder delimiter for masked fences; a private-use code point that
// never appears in authored prose.
const FENCE_MARK = "\uE000";
const FENCE_TOKEN = new RegExp(`${FENCE_MARK}(\\d+)${FENCE_MARK}`, "g");

/** Replaces fenced code with placeholders so prose-level passes skip it. */
function maskFences(text: string): { masked: string; restore: (t: string) => string } {
  const blocks: string[] = [];
  const masked = text.replace(/^[ \t]*(```|~~~)[^\n]*\n[\s\S]*?^[ \t]*\1[^\n]*$/gm, (block) => {
    blocks.push(block);
    return `${FENCE_MARK}${blocks.length - 1}${FENCE_MARK}`;
  });
  const restore = (t: string) =>
    t.replace(FENCE_TOKEN, (_m, n: string) => blocks[Number(n)]);
  return { masked, restore };
}

/** Reads `export const name = [...];` blocks written as plain literals. */
function readExports(body: string): {
  rest: string;
  values: Record<string, unknown>;
} {
  const values: Record<string, unknown> = {};
  const rest = body.replace(
    /^export const (\w+) = (\[[\s\S]*?^\]);\s*$/gm,
    (_match, name: string, literal: string) => {
      try {
        values[name] = JSON.parse(literalToJson(literal));
      } catch {
        values[name] = undefined;
      }
      return "";
    },
  );
  return { rest, values };
}

function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** Mirrors StageList: the first stage places an entry, later ones recur. */
function renderStageList(
  attrs: string,
  values: Record<string, unknown>,
): string {
  const ref = (key: string) => attrs.match(new RegExp(`${key}=\\{(\\w+)\\}`))?.[1];
  const items = values[ref("items") ?? ""] as StageItem[] | undefined;
  const stages = values[ref("stages") ?? ""] as StageDef[] | undefined;
  const phases = values[ref("phases") ?? ""] as PhaseDef[] | undefined;
  if (!items?.length || !stages?.length) return "";
  const byId = new Map(stages.map((stage) => [stage.id, stage]));
  const order = stages.map((stage) => stage.id);
  const line = (item: StageItem) => {
    const [first, ...later] = item.stages;
    const meta = [byId.get(first)?.label ?? first, item.tag].filter(Boolean).join(", ");
    const again = later.map((id) => byId.get(id)?.phrase ?? byId.get(id)?.label ?? id);
    return [
      `- **${item.title}** (${meta}).`,
      item.lead ? `Call: ${item.lead}.` : "",
      item.description ?? "",
      again.length ? `Again at ${joinWithAnd(again)}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  };
  const groups = phases?.length ? phases : [{ label: "", stages: order }];
  return groups
    .map((phase) => {
      const rows = items
        .filter((item) => phase.stages.includes(item.stages[0]))
        .sort((x, y) => order.indexOf(x.stages[0]) - order.indexOf(y.stages[0]))
        .map(line);
      if (rows.length === 0) return "";
      return `${phase.label ? `### ${phase.label}\n\n` : ""}${rows.join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

/** Converts the MDX body (frontmatter removed) to plain Markdown. */
export function mdxToMarkdown(body: string, baseUrl: string): string {
  const { masked, restore } = maskFences(body.replace(/\r\n?/g, "\n"));
  const stripped = readExports(masked.replace(/^import .*$/gm, ""));
  const rest = restore(stripped.rest);
  const values = stripped.values;
  const out: string[] = [];
  const lines = rest.split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (FENCE.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (/^<\/?(ArticleFigure|figure)\b[^>]*>$/.test(trimmed)) continue;
    const img = trimmed.match(/^<img\s[^>]*src="([^"]+)"[^>]*\/?>$/);
    if (img) {
      const alt = trimmed.match(/alt="([^"]*)"/)?.[1] ?? "";
      out.push(`![${alt}](${absolute(img[1], baseUrl)})`);
      continue;
    }
    const caption = trimmed.match(/^<figcaption>([\s\S]*)<\/figcaption>$/);
    if (caption) {
      out.push(`*${stripTags(caption[1])}*`);
      continue;
    }
    const stageList = trimmed.match(/^<StageList\s([\s\S]*?)\/>$/);
    if (stageList) {
      out.push(renderStageList(stageList[1], values));
      continue;
    }
    if (/^<Embed\b/.test(trimmed)) {
      // Multi-line self-closing component: collect until "/>".
      let block = trimmed;
      while (!/\/>\s*$/.test(block) && i + 1 < lines.length) {
        i += 1;
        block += ` ${lines[i].trim()}`;
      }
      const embed = block.match(/url="([^"]+)"/)?.[1];
      const title = block.match(/title="([^"]+)"/)?.[1] ?? "Embedded video";
      // Player addresses are for iframes; link the watch page instead.
      const url = embed?.replace(
        /^https:\/\/www\.youtube\.com\/embed\/([\w-]+).*$/,
        "https://www.youtube.com/watch?v=$1",
      );
      if (url) out.push(`[${title}](${url})`);
      continue;
    }
    out.push(
      line
        // Root-relative links and images (with or without a title) become
        // absolute; protocol-relative URLs are left alone.
        .replace(
          /\]\((\/(?!\/)[^)\s]*)(\s+"[^"]*")?\)/g,
          (_m, href: string, title = "") => `](${absolute(href, baseUrl)}${title})`,
        ),
    );
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Full Markdown document for one post: title, summary, facts and body. */
export function buildPostMarkdown(
  post: BlogPostMeta,
  baseUrl: string,
  headingLevel = 1,
): string | null {
  const source = readPostSource(post.slug);
  if (!source) return null;
  const body = source.replace(/\r\n?/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "");
  let markdown = mdxToMarkdown(body, baseUrl);
  if (headingLevel > 1) {
    const shift = "#".repeat(headingLevel - 1);
    let fence = false;
    markdown = markdown
      .split("\n")
      .map((line) => {
        if (FENCE.test(line)) fence = !fence;
        return !fence && /^#{1,5} /.test(line) ? `${shift}${line}` : line;
      })
      .join("\n");
  }
  const h = "#".repeat(headingLevel);
  const facts = [
    `- URL: ${baseUrl}/blog/${post.slug}`,
    post.authorName ? `- Author: ${post.authorName}` : "",
    post.publishedAt ? `- Published: ${post.publishedAt.slice(0, 10)}` : "",
    post.readTime ? `- Read time: ${post.readTime}` : "",
  ].filter(Boolean);
  const hero = post.mainImageUrl
    ? `![${post.mainImageAlt ?? ""}](${absolute(post.mainImageUrl, baseUrl)})`
    : "";
  return [
    `${h} ${post.title}`,
    "",
    post.excerpt ? `> ${post.excerpt}` : "",
    "",
    ...facts,
    "",
    hero,
    "",
    markdown,
    "",
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");
}
