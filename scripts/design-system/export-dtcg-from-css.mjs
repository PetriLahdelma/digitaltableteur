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

function nestToken(tree, path, leaf) {
  const [head, ...rest] = path;
  if (!rest.length) {
    tree[head] = leaf;
    return;
  }
  tree[head] ??= {};
  nestToken(tree[head], rest, leaf);
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
  mkdirSync(OUT_DIR, { recursive: true });
  const byCategory = {};

  for (const group of catalog.groups) {
    byCategory[group.category] ??= { $schema: SCHEMA };
    const tree = byCategory[group.category];
    for (const t of group.tokens) {
      const type =
        group.category === "color" ? "color" :
        group.category === "dimension" || group.category === "space" ? "dimension" :
        group.category === "typography" ? "fontFamily" :
        "other";
      const leaf = {
        $value: t.value,
        $description: t.usage || `Production token ${t.name}`,
      };
      if (type !== "other") leaf.$type = type;
      nestToken(tree, cssVarToPath(t.name), leaf);
    }
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
