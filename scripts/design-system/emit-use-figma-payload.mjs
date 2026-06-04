#!/usr/bin/env node
/** Writes a use_figma JSON payload for Cursor plugin MCP (CallMcpTool). */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FIGMA_FILE_KEY } from "./figma-config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const phasePath = process.argv[2];
const description = process.argv[3] ?? "Apply Figma variable phase";
if (!phasePath) {
  console.error("Usage: node emit-use-figma-payload.mjs <phase.js> [description]");
  process.exit(1);
}

const base = phasePath.split("/").pop().replace(/\.js$/, "");
const OUT = join(ROOT, `nextjs-app/shared/foundations/figma/.use-figma-payload-${base}.json`);

let code = readFileSync(phasePath, "utf8");
code = code.replace(/\nreturn \{ ok: true, RUN_ID \};\s*/g, "\n");

writeFileSync(
  OUT,
  JSON.stringify({
    fileKey: FIGMA_FILE_KEY,
    code,
    description,
    skillNames: "figma-use,figma-generate-library",
  }),
);
console.log(OUT);
