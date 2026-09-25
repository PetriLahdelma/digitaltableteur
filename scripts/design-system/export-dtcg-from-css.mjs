#!/usr/bin/env node
/**
 * Export DTCG 2025.10 JSON from the production token catalog (not _wip-scaffold).
 *
 * Output under foundations/tokens/production/:
 * - <category>.json: one token file per catalog category, values in the
 *   structured 2025.10 form (see dtcg-2025-lib.mjs), aliases as "{a.b}".
 * - themes/<mode>.json: per-theme overrides (dark, high-contrast black/white)
 *   parsed from the theme blocks in variables.css; light is the base.
 * - digitaltableteur.resolver.json: DTCG Resolver 2025.10 document wiring
 *   the token files and theme contexts together.
 *
 * Every token keeps its CSS source in $extensions["com.digitaltableteur"]
 * (cssVar, category, subgroup, css). Tokens whose CSS value has no DTCG
 * 2025.10 form are not emitted as invalid tokens; they are listed with a
 * reason under the file's root $extensions["com.digitaltableteur"].nonDtcg,
 * so exported + listed always equals the catalog.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DTCG_FORMAT_SCHEMA,
  DTCG_RESOLVER_SCHEMA,
  EXT,
  convertValue,
  layoutTree,
  setAtPath,
} from "./dtcg-2025-lib.mjs";
import { FIGMA_MODES, buildThemeMaps } from "./figma-variables-lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG = resolve(__dirname, "../../nextjs-app/shared/foundations/token-catalog.json");
const OUT_DIR = resolve(__dirname, "../../nextjs-app/shared/foundations/tokens/production");
const RESOLVER_FILE = "digitaltableteur.resolver.json";

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

export function inferType(token) {
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

  if (name.startsWith("--rhythm-")) return /^-?\d*\.?\d+$/.test(String(value).trim()) ? "number" : "dimension";
  if (name.startsWith("--grid-columns-")) return "number";
  if (category === "elevation" && (name.endsWith("-shadow") || name.startsWith("--shadow-"))) return "shadow";

  return "string";
}

function main() {
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
  const tokens = catalog.groups.flatMap((group) => group.tokens);
  const byName = new Map(tokens.map((t) => [t.name, t]));
  const types = new Map(tokens.map((t) => [t.name, inferType(t)]));
  const paths = layoutTree(tokens.map((t) => t.name));
  const { themes } = buildThemeMaps();

  // Pass 1: which tokens convert at all (base values), so an alias is only
  // ever written to a token that exists in the output.
  const conforming = new Set();
  const probeCtx = {
    aliasFor: () => null,
    resolve: (cssVar) => themes.light[cssVar] ?? byName.get(cssVar)?.value ?? null,
  };
  for (const t of tokens) {
    if (!("reason" in convertValue(types.get(t.name), t.value, probeCtx))) conforming.add(t.name);
  }

  // The spec writes a reference to a group's root token as "{a.b.$root}", but
  // the official 2025.10 JSON Schema's curly-brace pattern rejects segments
  // starting with "$". A JSON Pointer value reference is valid under both,
  // so $root targets use it; every other alias uses the common curly form.
  const referenceTo = (cssVar) => {
    const path = paths.get(cssVar);
    return path.includes("$root") ? { $ref: `#/${path.join("/")}/$value` } : `{${path.join(".")}}`;
  };
  const ctxFor = (mode) => ({
    aliasFor: (cssVar, type) =>
      conforming.has(cssVar) && types.get(cssVar) === type ? referenceTo(cssVar) : null,
    resolve: (cssVar) => themes[mode][cssVar] ?? byName.get(cssVar)?.value ?? null,
  });

  const files = {};
  const nonDtcgByFile = {};
  let exported = 0;
  for (const t of tokens) {
    const file = t.category;
    files[file] ??= {};
    const type = types.get(t.name);
    const converted = convertValue(type, t.value, ctxFor("light"));
    if ("reason" in converted) {
      (nonDtcgByFile[file] ??= []).push({ cssVar: t.name, css: t.value, reason: converted.reason });
      continue;
    }
    exported += 1;
    setAtPath(files[file], paths.get(t.name), {
      $value: converted.value,
      $type: type,
      $description: t.usage || `Production token ${t.name}`,
      $extensions: {
        [EXT]: { cssVar: t.name, category: t.category, subgroup: t.subgroup, css: t.value },
      },
    });
  }

  const listed = Object.values(nonDtcgByFile).flat().length;
  if (exported + listed !== catalog.tokenCount || tokens.length !== catalog.tokenCount) {
    throw new Error(
      `DTCG export is incomplete: catalog=${catalog.tokenCount}, exported=${exported}, nonDtcg=${listed}`,
    );
  }

  // Theme overrides: tokens whose value differs from the light base.
  const themeFiles = {};
  const themeNonDtcg = {};
  for (const mode of FIGMA_MODES) {
    themeFiles[mode.id] = {};
    if (mode.id === "light") continue;
    for (const t of tokens) {
      const themed = themes[mode.id][t.name];
      if (themed == null || themed === themes.light[t.name] || !conforming.has(t.name)) continue;
      const converted = convertValue(types.get(t.name), themed, ctxFor(mode.id));
      if ("reason" in converted) {
        (themeNonDtcg[mode.id] ??= []).push({ cssVar: t.name, css: themed, reason: converted.reason });
        continue;
      }
      setAtPath(themeFiles[mode.id], paths.get(t.name), {
        $value: converted.value,
        $type: types.get(t.name),
        $extensions: { [EXT]: { cssVar: t.name, css: themed } },
      });
    }
  }

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(resolve(OUT_DIR, "themes"), { recursive: true });
  const write = (path, json) => writeFileSync(resolve(OUT_DIR, path), `${JSON.stringify(json, null, 2)}\n`);
  const withRoot = (tree, nonDtcg) => ({
    $schema: DTCG_FORMAT_SCHEMA,
    ...(nonDtcg?.length ? { $extensions: { [EXT]: { nonDtcg } } } : {}),
    ...tree,
  });

  const categoryFiles = Object.keys(files).sort();
  for (const file of categoryFiles) write(`${file}.json`, withRoot(files[file], nonDtcgByFile[file]));
  for (const mode of FIGMA_MODES) {
    write(`themes/${mode.id}.json`, withRoot(themeFiles[mode.id], themeNonDtcg[mode.id]));
  }

  write(RESOLVER_FILE, {
    $schema: DTCG_RESOLVER_SCHEMA,
    name: "Digitaltableteur",
    version: "2025.10",
    description:
      "Production tokens from variables.css. The theme modifier mirrors the .themeDark, .themeHCB, and .themeHCW classes; light is the base.",
    sets: {
      foundation: {
        description: "Base (light) token values, one file per category.",
        sources: categoryFiles.map((file) => ({ $ref: `${file}.json` })),
      },
    },
    modifiers: {
      theme: {
        description: "Colour theme.",
        contexts: Object.fromEntries(
          FIGMA_MODES.map((mode) => [mode.id, [{ $ref: `themes/${mode.id}.json` }]]),
        ),
        default: "light",
      },
    },
    resolutionOrder: [{ $ref: "#/sets/foundation" }, { $ref: "#/modifiers/theme" }],
  });

  writeFileSync(
    resolve(OUT_DIR, "README.md"),
    [
      "# Production DTCG export",
      "",
      "Auto-generated from `variables.css` via `npm run build:tokens`. DTCG 2025.10 format",
      `(${DTCG_FORMAT_SCHEMA}), validated against the vendored schemas in`,
      "`scripts/design-system/schemas/`.",
      "",
      `- \`<category>.json\`: base (light) tokens. ${exported} of ${catalog.tokenCount} catalog tokens; the other ${listed} have no DTCG 2025.10 form and are listed with a reason under the root \`$extensions["${EXT}"].nonDtcg\`.`,
      "- `themes/<mode>.json`: per-theme overrides.",
      `- \`${RESOLVER_FILE}\`: DTCG Resolver document (sets + theme modifier).`,
      "",
      "**Not imported at runtime.** Source of truth remains CSS.",
      "",
    ].join("\n"),
  );
  console.log(
    `✓ DTCG 2025.10 export → tokens/production/ (${categoryFiles.length} files, ${exported} tokens, ${listed} non-DTCG listed, ${FIGMA_MODES.length} theme contexts)`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
