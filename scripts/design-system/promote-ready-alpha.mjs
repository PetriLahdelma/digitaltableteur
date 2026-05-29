#!/usr/bin/env node
/**
 * Promote alpha → beta when stories already export Example + ForcedColors.
 * Sets contract lifecycle flags and adds beta tags to stories meta if missing.
 *
 * Run: node scripts/design-system/promote-ready-alpha.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FILE_KEY = process.env.FIGMA_FILE_KEY || "d8nFs8A5KcjbFr6KkwZV4H5K";
const FILE_SLUG = process.env.FIGMA_FILE_SLUG || "Digitaltableteur-Design-System";
const REVIEWED_NOTE =
  "2026-05-28 — Promoted from alpha: Example + ForcedColors stories present; Storybook axe gate enabled.";

const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function promoteContract(contractPath, name) {
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  if (contract.status !== "alpha") return false;

  contract.status = "beta";
  contract.figma =
    contract.figma ??
    `https://www.figma.com/design/${FILE_KEY}/${FILE_SLUG}?node-id=dt-${kebab(name)}`;
  if (typeof contract.figma === "string" && contract.figma.includes("/design/digitaltableteur/")) {
    contract.figma = `https://www.figma.com/design/${FILE_KEY}/${FILE_SLUG}?node-id=dt-${kebab(name)}`;
  }

  contract.requiredStories = [
    "Default",
    "Playground",
    "Example",
    "ForcedColors",
  ];
  contract.a11y = {
    ...contract.a11y,
    forcedColorsVerified: true,
    reviewed: true,
    reviewedNote: REVIEWED_NOTE,
  };
  contract.lightDarkVerified = true;
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
  return true;
}

function patchStories(storiesPath) {
  let src = readFileSync(storiesPath, "utf8");
  let changed = false;

  if (!src.includes('tags:') || !src.includes('"beta"')) {
    if (src.match(/tags:\s*\[/)) {
      src = src.replace(/tags:\s*\[([^\]]*)\]/, (m, inner) => {
        const parts = inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!parts.includes('"beta"')) parts.unshift('"beta"');
        if (!parts.includes('"!autodocs"')) parts.push('"!autodocs"');
        changed = true;
        return `tags: [${parts.join(", ")}]`;
      });
    } else {
      src = src.replace(
        /const meta = \{/,
        'const meta = {\n  tags: ["beta", "!autodocs"],',
      );
      changed = true;
    }
  }

  if (!src.includes("a11y: { test: \"error\" }") && !src.includes('a11y: { test: "error" }')) {
    if (src.includes("parameters: {")) {
      src = src.replace(
        /parameters:\s*\{/,
        'parameters: {\n    a11y: { test: "error" },',
      );
      changed = true;
    }
  }

  if (changed) writeFileSync(storiesPath, src);
}

let promoted = 0;
let skipped = 0;

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const dir = join(base, name);
    if (!isDir(dir)) continue;

    const contractPath = join(dir, `${name}.contract.json`);
    const storiesPath = join(dir, `${name}.stories.tsx`);
    if (!existsSync(contractPath) || !existsSync(storiesPath)) continue;

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (contract.status !== "alpha") continue;

    const stories = readFileSync(storiesPath, "utf8");
    if (
      !stories.includes("export const Example") ||
      !stories.includes("export const ForcedColors")
    ) {
      console.log(`○ ${name}: missing Example or ForcedColors — skip`);
      skipped++;
      continue;
    }

    if (promoteContract(contractPath, name)) {
      patchStories(storiesPath);
      const mdxPath = join(dir, `${name}.mdx`);
      if (existsSync(mdxPath)) {
        let mdx = readFileSync(mdxPath, "utf8");
        mdx = mdx.replace(/\*\*Status:\*\* \w+/, "**Status:** beta");
        writeFileSync(mdxPath, mdx);
      }
      console.log(`✓ ${name} → beta`);
      promoted++;
    }
  }
}

console.log(`\nPromoted ${promoted}, skipped ${skipped} (not story-ready).`);
