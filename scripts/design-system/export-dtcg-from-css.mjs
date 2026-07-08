#!/usr/bin/env node
/**
 * Export DTCG JSON from production token-catalog.json (not _wip-scaffold).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = resolve(__dirname, "../../nextjs-app/shared/foundations/token-catalog.json");
const OUT_DIR = resolve(__dirname, "../../nextjs-app/shared/foundations/tokens/production");

const SCHEMA = "https://design-tokens.github.io/community-group/format/";

function cssVarToPath(name) {
  return name.replace(/^--/, "").split("-");
}

function hasTokenValue(node) {
  return node && typeof node === "object" && "$value" in node;
}

function tokenChildren(node) {
  return Object.entries(node ?? {}).filter(([key, value]) => !key.startsWith("$") && value && typeof value === "object");
}

function nestToken(tree, path, leaf) {
  const [head, ...rest] = path;
  if (!rest.length) {
    if (tree[head] && !hasTokenValue(tree[head])) {
      if (tree[head].DEFAULT) {
        throw new Error(`DTCG path collision at ${path.join(".")}.DEFAULT`);
      }
      tree[head].DEFAULT = leaf;
      return;
    }
    if (tree[head] && hasTokenValue(tree[head])) {
      throw new Error(`Duplicate DTCG token path ${path.join(".")}`);
    }
    tree[head] = leaf;
    return;
  }
  if (hasTokenValue(tree[head])) {
    tree[head] = { DEFAULT: tree[head] };
  } else {
    tree[head] ??= {};
  }
  nestToken(tree[head], rest, leaf);
}

function countLeaves(node) {
  if (hasTokenValue(node)) return 1;
  return tokenChildren(node).reduce((sum, [, child]) => sum + countLeaves(child), 0);
}

function isColorLikeValue(value) {
  const v = String(value).trim();
  return (
    v.startsWith("#") ||
    v.startsWith("rgb(") ||
    v.startsWith("rgba(") ||
    v.startsWith("hsl(") ||
    v.startsWith("hsla(") ||
    v.startsWith("color-mix(") ||
    v.startsWith("Canvas") ||
    v.startsWith("LinkText") ||
    v.startsWith("Highlight") ||
    v.startsWith("GrayText") ||
    /^var\(\s*--(?:color|accent|.*color|.*bg|.*background)/.test(v)
  );
}

function inferType(token) {
  const { name, value, category } = token;

  if (category === "color") {
    if (name.includes("gradient") || String(value).startsWith("linear-gradient(")) return "gradient";
    return "color";
  }

  if (name.startsWith("--font-size-")) return "dimension";
  if (name.startsWith("--font-weight-")) return "fontWeight";
  if (name.startsWith("--font-") || name.includes("-font")) return "fontFamily";
  if (name.startsWith("--line-height-")) return "number";
  if (name.startsWith("--tracking-")) return "dimension";
  if (name.endsWith("-color") || name.endsWith("-bg") || name.endsWith("-background") || isColorLikeValue(value)) {
    return "color";
  }

  if (name.startsWith("--duration-") || name.startsWith("--stagger-")) return "duration";
  if (name.startsWith("--ease-")) return "cubicBezier";
  if (name.startsWith("--motion-distance-")) return "dimension";

  if (
    category === "space" ||
    category === "radius" ||
    category === "size" ||
    name.startsWith("--breakpoint-") ||
    name.startsWith("--container-") ||
    name.startsWith("--page-margin-") ||
    name.startsWith("--grid-gap-") ||
    name.startsWith("--focus-ring-width") ||
    name.startsWith("--focus-ring-offset")
  ) {
    return "dimension";
  }

  if (name.startsWith("--grid-columns-") || name.startsWith("--rhythm-")) return "number";
  if (category === "elevation" && name.endsWith("-shadow")) return "shadow";

  return "string";
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
  mkdirSync(OUT_DIR, { recursive: true });
  const byCategory = {};
  let sourceTokenCount = 0;

  for (const group of catalog.groups) {
    byCategory[group.category] ??= { $schema: SCHEMA };
    const tree = byCategory[group.category];
    for (const t of group.tokens) {
      sourceTokenCount++;
      const type = inferType(t);
      const leaf = {
        $value: t.value,
        $description: t.usage || `Production token ${t.name}`,
        $type: type,
        $extensions: {
          digitaltableteur: {
            cssVar: t.name,
            category: t.category,
            subgroup: t.subgroup,
          },
        },
      };
      nestToken(tree, cssVarToPath(t.name), leaf);
    }
  }

  const exportedTokenCount = Object.values(byCategory).reduce((sum, json) => sum + countLeaves(json), 0);
  if (exportedTokenCount !== sourceTokenCount || exportedTokenCount !== catalog.tokenCount) {
    throw new Error(
      `DTCG export is incomplete: source=${sourceTokenCount}, catalog=${catalog.tokenCount}, exported=${exportedTokenCount}`,
    );
  }

  let count = 0;
  for (const [cat, json] of Object.entries(byCategory)) {
    const path = resolve(OUT_DIR, `${cat}.json`);
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
    count++;
  }
  writeFileSync(
    resolve(OUT_DIR, "README.md"),
    `# Production DTCG export\n\nAuto-generated from \`variables.css\` via \`npm run build:tokens\`.\n\n**Not imported at runtime.** Source of truth remains CSS.\n`,
  );
  console.log(`✓ DTCG export → tokens/production/ (${count} files)`);
}

main();
