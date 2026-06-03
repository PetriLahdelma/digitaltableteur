#!/usr/bin/env node
/**
 * Build Figma variable manifest from variables.css (all 4 themes).
 * Output: nextjs-app/shared/foundations/figma/variables-manifest.json
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FIGMA_FILE_KEY, FIGMA_FILE_SLUG } from "./figma-config.mjs";
import {
  buildThemeMaps,
  categorizeToken,
  cssVarToFigmaName,
  figmaTypeForToken,
  FIGMA_MODES,
  isResolvableColor,
  parseDimensionPx,
  resolveToken,
  scopesForCategory,
} from "./figma-variables-lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../../nextjs-app/shared/foundations/figma");
const OUT_JSON = resolve(OUT_DIR, "variables-manifest.json");

function main() {
  const { rootProps, themes } = buildThemeMaps();
  const collections = {
    color: { name: "DT / Color", modes: FIGMA_MODES.map((m) => m.label), tokens: [] },
    dimension: {
      name: "DT / Dimension",
      modes: ["Value"],
      tokens: [],
    },
    string: { name: "DT / String", modes: ["Value"], tokens: [] },
  };
  const skipped = [];

  for (const name of Object.keys(rootProps).sort()) {
    const category = categorizeToken(name);
    const resolvedByMode = {};
    for (const mode of FIGMA_MODES) {
      resolvedByMode[mode.id] = resolveToken(themes[mode.id], themes[mode.id][name] ?? "");
    }

    const figmaType = figmaTypeForToken(name, category, resolvedByMode);
    if (!figmaType) {
      skipped.push({
        name,
        category,
        reason: "non-figma-value (clamp, color-mix, or unresolved var)",
        sample: resolvedByMode.light,
      });
      continue;
    }

    const figmaName = cssVarToFigmaName(name);
    const codeSyntax = { WEB: `var(${name})` };
    const scopes = scopesForCategory(category);

    if (figmaType === "COLOR") {
      const values = {};
      for (const mode of FIGMA_MODES) {
        const raw = resolvedByMode[mode.id];
        if (!isResolvableColor(raw)) {
          skipped.push({ name, category, reason: `unresolved color in ${mode.id}`, sample: raw });
          continue;
        }
        values[mode.label] = raw;
      }
      if (Object.keys(values).length === FIGMA_MODES.length) {
        collections.color.tokens.push({ name: figmaName, cssVar: name, type: "COLOR", values, scopes, codeSyntax });
      }
      continue;
    }

    if (figmaType === "FLOAT") {
      const px = parseDimensionPx(resolvedByMode.light);
      if (px == null) {
        skipped.push({ name, category, reason: "dimension parse failed", sample: resolvedByMode.light });
        continue;
      }
      collections.dimension.tokens.push({
        name: figmaName,
        cssVar: name,
        type: "FLOAT",
        values: { Value: px },
        scopes,
        codeSyntax,
      });
      continue;
    }

    if (figmaType === "STRING") {
      collections.string.tokens.push({
        name: figmaName,
        cssVar: name,
        type: "STRING",
        values: { Value: resolvedByMode.light },
        scopes: [],
        codeSyntax,
      });
    }
  }

  const manifestPath = resolve(
    __dirname,
    "../../nextjs-app/shared/foundations/figma/variables-manifest.json",
  );
  let figmaApplied;
  try {
    figmaApplied = JSON.parse(readFileSync(manifestPath, "utf8")).figmaApplied;
  } catch {
    /* first run */
  }

  const manifest = {
    fileKey: FIGMA_FILE_KEY,
    fileSlug: FIGMA_FILE_SLUG,
    fileUrl: `https://www.figma.com/design/${FIGMA_FILE_KEY}/${FIGMA_FILE_SLUG}`,
    generatedAt: new Date().toISOString(),
    source: "nextjs-app/shared/styles/variables.css",
    runId: `dt-dsb-${new Date().toISOString().slice(0, 10)}`,
    ...(figmaApplied ? { figmaApplied } : {}),
    modes: FIGMA_MODES,
    collections,
    stats: {
      color: collections.color.tokens.length,
      dimension: collections.dimension.tokens.length,
      string: collections.string.tokens.length,
      skipped: skipped.length,
    },
    skipped,
    phases: [
      { id: "phase-0", label: "Discovery (get_metadata pages only, no nodeId)" },
      { id: "phase-1a", label: "Create DT / Color collection + variables", script: "phase-1a-color.js" },
      { id: "phase-1b", label: "Create DT / Dimension + DT / String", script: "phase-1b-dimension-string.js" },
      { id: "phase-2", label: "Page skeleton (Foundations, Atoms, …)" },
      { id: "phase-3-atoms", label: "Atoms one-by-one (Button first)" },
    ],
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`✓ Figma variables manifest → ${OUT_JSON}`);
  console.log(
    `  color=${manifest.stats.color} dimension=${manifest.stats.dimension} string=${manifest.stats.string} skipped=${manifest.stats.skipped}`,
  );
}

main();
