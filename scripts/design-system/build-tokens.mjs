#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, "../../nextjs-app/shared/foundations/tokens/production");
const OUT_DIR = resolve(__dirname, "../../nextjs-app/shared/foundations/dist");
const CATALOG = resolve(__dirname, "../../nextjs-app/shared/foundations/token-catalog.json");

const HEADER = `/* AUTO-GENERATED — NOT IMPORTED AT RUNTIME
 * Source of truth: nextjs-app/shared/styles/variables.css
 * JSON under tokens/_wip-scaffold/ is quarantined draft — not production.
 * See foundations/tokens/README.md
 */`;

function flatten(obj, path = []) {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    const next = [...path, k];
    if (v && typeof v === "object" && "$value" in v) {
      const metadata = v.$extensions?.digitaltableteur ?? {};
      const cssVar = metadata.cssVar ?? "--" + next.join("-").replace(/_/g, "-");
      out.push({
        cssVar,
        value: v.$value,
        path: next.join("."),
        description: v.$description ?? "",
        category: metadata.category ?? path[0] ?? "other",
      });
      out.push(...flatten(Object.fromEntries(Object.entries(v).filter(([key]) => !key.startsWith("$"))), next));
    } else if (v && typeof v === "object") {
      out.push(...flatten(v, next));
    }
  }
  return out;
}

function withoutGeneratedAt(manifest) {
  const { generatedAt: _generatedAt, ...rest } = manifest;
  return rest;
}

function resolveGeneratedAt(path, nextManifest) {
  if (!existsSync(path)) return new Date().toISOString();

  try {
    const previous = JSON.parse(readFileSync(path, "utf8"));
    if (
      previous.generatedAt &&
      JSON.stringify(withoutGeneratedAt(previous)) === JSON.stringify(withoutGeneratedAt(nextManifest))
    ) {
      return previous.generatedAt;
    }
  } catch {
    // Fall through to a fresh timestamp if the existing manifest is unreadable.
  }

  return new Date().toISOString();
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  let files = [];
  try {
    files = readdirSync(TOKEN_DIR).filter((x) => x.endsWith(".json"));
  } catch {
    files = [];
  }

  const allTokens = [];
  const lines = [HEADER, ":root {"];
  const tokenNames = [];

  for (const file of files) {
    const json = JSON.parse(readFileSync(join(TOKEN_DIR, file), "utf8"));
    for (const t of flatten(json)) {
      allTokens.push(t);
      tokenNames.push(t.cssVar);
      lines.push(`  /* resolve: ${t.path} */`);
      lines.push(`  ${t.cssVar}: ${t.value};`);
    }
  }

  if (files.length === 0) {
    lines.push("  /* no production-synced JSON yet */");
  }
  lines.push("}", "");

  const byCategory = {};
  for (const t of allTokens) {
    const cat = t.category || "other";
    byCategory[cat] ??= [];
    byCategory[cat].push(t.cssVar);
  }

  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));

  writeFileSync(join(OUT_DIR, "tokens.css"), lines.join("\n"));
  writeFileSync(
    join(OUT_DIR, "tokens.d.ts"),
    [
      "/** AUTO-GENERATED — npm run build:tokens */",
      "export const tokenNames = [",
      ...tokenNames.map((n) => `  "${n}",`),
      "] as const;",
      "",
      "export type TokenName = (typeof tokenNames)[number];",
      "",
    ].join("\n"),
  );

  const manifestPath = join(OUT_DIR, "tokens-manifest.json");
  const manifest = {
    schemaVersion: "1.0",
    source: catalog.source,
    tokenCount: catalog.tokenCount,
    usageCoverage: catalog.usageCoverage,
    dtcgFiles: files.map((f) => `tokens/production/${f}`),
    categories: Object.keys(byCategory).sort(),
    tokenNames,
  };
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        ...manifest,
        generatedAt: resolveGeneratedAt(manifestPath, manifest),
      },
      null,
      2,
    ) + "\n",
  );

  const tailwindRefs = {};
  for (const name of catalog.groups.flatMap((g) => g.tokens.map((t) => t.name))) {
    if (name.startsWith("--color-") || name.startsWith("--accent-")) {
      const base = name.replace(/^--/, "");
      const key = base.startsWith("color-")
        ? `color-dt-${base.slice(6)}`
        : `color-dt-${base}`;
      tailwindRefs[key] = `var(${name})`;
    } else if (name.startsWith("--font-size-")) {
      tailwindRefs[`text-dt-${name.replace(/^--font-size-/, "")}`] = `var(${name})`;
    }
  }

  writeFileSync(
    join(OUT_DIR, "tailwind.tokens.ts"),
    [
      "/** AUTO-GENERATED — npm run build:tokens */",
      "/** Production CSS vars live in variables.css; Tailwind bridge in app/tailwind.css (DT-THEME block). */",
      "",
      `export const tokenNames = ${JSON.stringify(tokenNames, null, 2)} as const;`,
      "",
      "export type TokenName = (typeof tokenNames)[number];",
      "",
      `export const tokenCategories = ${JSON.stringify(byCategory, null, 2)} as const;`,
      "",
      `export const tailwindThemeRefs = ${JSON.stringify(tailwindRefs, null, 2)} as const;`,
      "",
    ].join("\n"),
  );

  console.log(
    `✓ Wrote foundations/dist/ (${files.length} DTCG JSON → tokens.css, tokens.d.ts, tailwind.tokens.ts, tokens-manifest.json)`,
  );
}

main();
