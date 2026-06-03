#!/usr/bin/env node
/**
 * Generate use_figma plugin scripts from variables-manifest.json (chunked).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = resolve(__dirname, "../../nextjs-app/shared/foundations/figma/variables-manifest.json");
const OUT_DIR = resolve(__dirname, "../../nextjs-app/shared/foundations/figma/phases");

const RUNTIME_HELPERS = `
function hexToFigmaColor(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    a: h.length === 8 ? parseInt(h.substring(6, 8), 16) / 255 : 1,
  };
}

// Variables/collections do NOT support setSharedPluginData (that mixin is
// nodes/styles only). Idempotency is by name, per the figma-generate-library
// skill's state table.
async function upsertCollection(name, modeLabels, _key, _runId) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let coll = cols.find((c) => c.name === name) || null;
  if (!coll) coll = figma.variables.createVariableCollection(name);
  const modeIds = {};
  const existing = coll.modes.map((m) => m.name);
  if (existing.length === 1 && existing[0] === 'Mode 1' && modeLabels.length) {
    coll.renameMode(coll.modes[0].modeId, modeLabels[0]);
  }
  for (const label of modeLabels) {
    let mode = coll.modes.find((m) => m.name === label);
    if (!mode) {
      const id = coll.addMode(label);
      mode = coll.modes.find((m) => m.modeId === id);
    }
    if (mode) modeIds[label] = mode.modeId;
  }
  return { collection: coll, modeIds };
}

async function upsertVariable(coll, modeIds, def, _runId) {
  const vars = await figma.variables.getLocalVariablesAsync();
  let variable = vars.find(
    (v) => v.variableCollectionId === coll.id && v.name === def.name,
  );
  if (!variable) variable = figma.variables.createVariable(def.name, coll, def.type);
  for (const [modeLabel, raw] of Object.entries(def.values)) {
    const modeId = modeIds[modeLabel];
    if (!modeId) continue;
    let value = raw;
    if (def.type === 'COLOR' && typeof raw === 'string' && raw.startsWith('#')) {
      value = hexToFigmaColor(raw);
    }
    variable.setValueForMode(modeId, value);
  }
  variable.scopes = def.scopes || [];
  if (def.codeSyntax?.WEB) variable.setVariableCodeSyntax('WEB', def.codeSyntax.WEB);
  return variable.id;
}
`;

function wrapPluginBody(runId, body) {
  return `${RUNTIME_HELPERS}
const RUN_ID = ${JSON.stringify(runId)};
${body}
return { ok: true, RUN_ID };
`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  mkdirSync(OUT_DIR, { recursive: true });

  const colorTokens = manifest.collections.color.tokens;
  const colorChunks = chunk(colorTokens, 35);

  colorChunks.forEach((tokens, i) => {
    const body = `
const { collection, modeIds } = await upsertCollection(
  ${JSON.stringify(manifest.collections.color.name)},
  ${JSON.stringify(manifest.collections.color.modes)},
  'collection/dt-color',
  RUN_ID,
);
const created = [];
const defs = ${JSON.stringify(tokens)};
for (const def of defs) {
  created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
return { collectionId: collection.id, variableIds: created, chunk: ${i + 1}, total: ${colorChunks.length} };
`;
    writeFileSync(
      resolve(OUT_DIR, `phase-1a-color-chunk-${String(i + 1).padStart(2, "0")}.js`),
      wrapPluginBody(manifest.runId, body),
    );
  });

  const dimString = [
    ...manifest.collections.dimension.tokens,
    ...manifest.collections.string.tokens,
  ];
  const dimChunks = chunk(dimString, 40);
  dimChunks.forEach((tokens, i) => {
    const body = `
const dim = ${JSON.stringify(manifest.collections.dimension.tokens.filter((t) => tokens.find((x) => x.name === t.name)))};
const str = ${JSON.stringify(manifest.collections.string.tokens.filter((t) => tokens.find((x) => x.name === t.name)))};
let created = [];
if (dim.length) {
  const { collection, modeIds } = await upsertCollection(
    ${JSON.stringify(manifest.collections.dimension.name)},
    ${JSON.stringify(manifest.collections.dimension.modes)},
    'collection/dt-dimension',
    RUN_ID,
  );
  for (const def of dim) created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
if (str.length) {
  const { collection, modeIds } = await upsertCollection(
    ${JSON.stringify(manifest.collections.string.name)},
    ${JSON.stringify(manifest.collections.string.modes)},
    'collection/dt-string',
    RUN_ID,
  );
  for (const def of str) created.push(await upsertVariable(collection, modeIds, def, RUN_ID));
}
return { variableIds: created, chunk: ${i + 1}, total: ${dimChunks.length} };
`;
    writeFileSync(
      resolve(OUT_DIR, `phase-1b-dimension-string-chunk-${String(i + 1).padStart(2, "0")}.js`),
      wrapPluginBody(manifest.runId, body),
    );
  });

  const readme = `# Figma \`use_figma\` phase scripts

Generated from \`variables-manifest.json\`. **Run sequentially** via Figma MCP \`use_figma\` (remote) — never in parallel.

File: [\`${manifest.fileSlug}\`](${manifest.fileUrl}) (\`${manifest.fileKey}\`)

## Phase 1 — variables

1. \`whoami\` — confirm MCP auth
2. \`get_metadata\` with **fileKey only** (no nodeId) — list pages
3. For each \`phase-1a-color-chunk-*.js\`: pass file contents to \`use_figma\` with \`skillNames: "figma-generate-library"\`
4. Then each \`phase-1b-dimension-string-chunk-*.js\`

## Phase 2+ 

See \`docs/FIGMA_DESIGN_SYSTEM_SYNC.md\`.

Run ID: \`${manifest.runId}\`

## Phase 2–3 — library (verified)

State ledger: \`../dsb-state.json\`. Verify in-scope node ids:

\`\`\`bash
npm run verify:figma-in-scope
npm run sync:figma
\`\`\`

Code Connect is **not** used (Figma Pro). Storybook Design panel + contract \`figma\` URLs instead.
`;

  writeFileSync(resolve(OUT_DIR, "README.md"), readme);
  console.log(`✓ ${colorChunks.length} color chunks + ${dimChunks.length} dimension/string chunks → ${OUT_DIR}`);
}

main();
