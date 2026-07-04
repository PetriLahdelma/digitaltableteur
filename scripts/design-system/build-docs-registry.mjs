#!/usr/bin/env node
/**
 * Build docs-registry.json — the budgeted docs surface behind the public MCP
 * route (Astryx roadmap 3.3). One entry per cataloged component/pattern:
 * contract doc fields (dense, keywords, usage), import line, key props, and
 * the SOURCE of example-tagged stories extracted from <Name>.stories.tsx at
 * build time. The MCP `search` tool serves briefs from this file; `get`
 * serves full entries. Same data as the human docs (contracts feed both), so
 * the AI surface cannot drift from the pages.
 *
 * DETERMINISTIC on purpose: no generatedAt timestamp — the artifact is
 * git-tracked (statically imported by the Next.js route so serverless
 * bundling needs no file tracing) and check:generated diffs it after regen.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DOC_TIER_1, DOC_TIER_1_CATEGORIES } from "./doc-tiers.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ROOTS = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];
const OUT = join(ROOT, "nextjs-app/shared/foundations/dist/docs-registry.json");
const BLOCKS = join(
  ROOT,
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
);

const agentBlocks = existsSync(BLOCKS)
  ? JSON.parse(readFileSync(BLOCKS, "utf8")).components
  : {};

const tierFor = (name) => (DOC_TIER_1.includes(name) ? 1 : 2);
const categoryFor = (name) => {
  for (const [category, names] of Object.entries(DOC_TIER_1_CATEGORIES)) {
    if (names.includes(name)) return category;
  }
  return null;
};

/** Named vs default import, read from the component's barrel. */
function importLineFor(name, dir) {
  const importPath = agentBlocks[name]?.preferredImport ?? `@dt/${name}`;
  const barrel = join(dir, "index.ts");
  const src = existsSync(barrel) ? readFileSync(barrel, "utf8") : "";
  const hasDefault = /export\s+\{\s*default/.test(src) || /export\s+default\b/.test(src);
  return hasDefault
    ? `import ${name} from "${importPath}";`
    : `import { ${name} } from "${importPath}";`;
}

/** Up to 6 non-handler props, most useful first (required, then unions). */
function keyPropsFor(props = {}) {
  const entries = Object.entries(props).filter(([k]) => !/^on[A-Z]/.test(k));
  entries.sort(([, a], [, b]) => {
    const req = (p) => (p.optional === false ? 0 : 1);
    const uni = (p) => (p.values ? 0 : 1);
    return req(a) - req(b) || uni(a) - uni(b);
  });
  return entries.slice(0, 6).map(([name, spec]) => ({
    name,
    type: spec.values ? spec.values.join(" | ") : (spec.type ?? "unknown"),
    required: spec.optional === false,
  }));
}

/**
 * Extract example-tagged stories with their source from a CSF file.
 * Handles both CSF3 (`tags: [..."example"...]` inside the story object) and
 * CSF2 (`Story.tags = ["example"]` trailing assignments). A story's source is
 * its `export const` block plus every trailing `Story.xxx = ...` assignment.
 */
function extractExamples(storiesPath) {
  if (!existsSync(storiesPath)) return [];
  const src = readFileSync(storiesPath, "utf8");

  // Split into top-level segments starting at each `export const NAME`.
  const segments = [];
  const re = /^export const (\w+)/gm;
  let match;
  const starts = [];
  while ((match = re.exec(src)) !== null) starts.push({ name: match[1], index: match.index });
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
    segments.push({ name: starts[i].name, text: src.slice(starts[i].index, end).trim() });
  }

  const exampleNames = new Set();
  for (const seg of segments) {
    // CSF3: tags array inside the story object literal.
    const tagsMatch = seg.text.match(/tags:\s*\[([^\]]*)\]/);
    if (tagsMatch && /["']example["']/.test(tagsMatch[1])) exampleNames.add(seg.name);
  }
  // CSF2: trailing `Name.tags = [...]` anywhere in the file.
  const assignRe = /^(\w+)\.tags\s*=\s*\[([^\]]*)\]/gm;
  while ((match = assignRe.exec(src)) !== null) {
    if (/["']example["']/.test(match[2])) exampleNames.add(match[1]);
  }

  return segments
    .filter((seg) => exampleNames.has(seg.name))
    .map((seg) => {
      // Collect trailing top-level assignments (CSF2 args/parameters/play).
      const assigns = [];
      const trailing = new RegExp(`^${seg.name}\\.(\\w+)\\s*=`, "gm");
      let t;
      while ((t = trailing.exec(src)) !== null) {
        const from = t.index;
        // Statement ends at the next top-level export/assignment or blank-line boundary heuristic.
        const rest = src.slice(from);
        const endMatch = rest.slice(1).search(/^(export |\w+\.\w+\s*=|const |function )/m);
        assigns.push(rest.slice(0, endMatch === -1 ? undefined : endMatch + 1).trim());
      }
      const parts = [seg.text, ...assigns.filter((a) => !seg.text.includes(a))];
      const source = parts.join("\n");
      const desc =
        source.match(/story:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ??
        source.match(/story:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1] ??
        null;
      return { story: seg.name, description: desc, source };
    });
}

const components = {};
const subPartOwners = new Map();

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const dir of readdirSync(root)) {
    const contractPath = join(root, dir, `${dir}.contract.json`);
    if (!existsSync(contractPath)) continue;
    let contract;
    try {
      contract = JSON.parse(readFileSync(contractPath, "utf8"));
    } catch {
      continue;
    }
    for (const part of contract.subParts ?? []) {
      const partName = typeof part === "string" ? part : part?.name;
      // Some contracts list their own name as a sub-part (e.g. Tooltip);
      // a component is never a sub-component of itself.
      if (partName && partName !== dir) subPartOwners.set(partName, dir);
    }
    components[dir] = {
      name: dir,
      group: contract.group ?? categoryFor(dir),
      tier: tierFor(dir),
      status: contract.status ?? "alpha",
      description: contract.description ?? "",
      dense: contract.dense ?? "",
      keywords: contract.keywords ?? [],
      importLine: importLineFor(dir, join(root, dir)),
      keyProps: keyPropsFor(contract.props),
      props: contract.props ?? {},
      composesWith: contract.composesWith ?? [],
      prefersOver: contract.prefersOver ?? [],
      forbiddenUse: contract.forbiddenUse ?? [],
      usage: contract.usage ?? null,
      tokens: contract.tokens ?? [],
      examples: extractExamples(join(root, dir, `${dir}.stories.tsx`)),
    };
  }
}

// Sub-component demotion data (e.g. SelectOption under Select).
for (const [part, owner] of subPartOwners) {
  if (components[part]) components[part].subComponentOf = owner;
}

writeFileSync(OUT, `${JSON.stringify({ components }, null, 2)}\n`);
const names = Object.keys(components);
const withExamples = names.filter((n) => components[n].examples.length > 0);
console.log(
  `✓ docs-registry.json (${names.length} components, ${withExamples.length} with example sources)`,
);
