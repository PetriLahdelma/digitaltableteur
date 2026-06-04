#!/usr/bin/env node
/**
 * Apply generated Figma variable phase scripts via an MCP server that exposes
 * the `use_figma` tool (Cursor Figma plugin / remote MCP — not Desktop selection MCP).
 *
 * Usage: node scripts/design-system/apply-figma-variables-local.mjs [phase-file.js ...]
 * Default: all phase-*.js in foundations/figma/phases/ (sorted, sequential).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { FIGMA_FILE_KEY } from "./figma-config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PHASES_DIR = join(
  ROOT,
  "nextjs-app/shared/foundations/figma/phases",
);
/**
 * Desktop MCP (127.0.0.1:3845) = selection/read tools only — NO use_figma.
 * For variable apply from the CLI, set FIGMA_DESKTOP_MCP_URL to an endpoint
 * that exposes use_figma (e.g. Cursor Figma plugin remote MCP), or use the
 * Cursor agent CallMcpTool(plugin-figma-figma, use_figma) path.
 */
const MCP_URL = process.env.FIGMA_DESKTOP_MCP_URL ?? "http://127.0.0.1:3845/mcp";
const RUN_ID =
  JSON.parse(
    readFileSync(
      join(ROOT, "nextjs-app/shared/foundations/figma/variables-manifest.json"),
      "utf8",
    ),
  ).runId ?? "unknown";

function listPhases() {
  const argPhases = process.argv.slice(2).filter((a) => a.endsWith(".js"));
  if (argPhases.length) {
    return argPhases.map((p) =>
      p.includes("/") ? p : join(PHASES_DIR, p),
    );
  }
  return readdirSync(PHASES_DIR)
    .filter((f) => f.startsWith("phase-") && f.endsWith(".js"))
    .sort()
    .map((f) => join(PHASES_DIR, f));
}

/** @param {Client} client @param {string} code @param {string} description */
async function applyPhase(client, code, description) {
  const result = await client.callTool({
    name: "use_figma",
    arguments: {
      fileKey: FIGMA_FILE_KEY,
      code,
      description,
      skillNames: "figma-generate-library",
    },
  });
  const text =
    result.content
      ?.map((part) => ("text" in part ? part.text : JSON.stringify(part)))
      .join("\n") ?? JSON.stringify(result);
  return text;
}

async function main() {
  const phasePaths = listPhases();
  if (!phasePaths.length) {
    console.error("No phase scripts found in", PHASES_DIR);
    process.exit(1);
  }

  console.log(`Figma MCP: ${MCP_URL}`);
  console.log(`fileKey: ${FIGMA_FILE_KEY}, runId: ${RUN_ID}`);
  console.log(`Phases: ${phasePaths.length} (sequential)\n`);

  const client = new Client({
    name: "dt-apply-figma-variables",
    version: "1.0.0",
  });
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  await client.connect(transport);

  const tools = await client.listTools();
  const hasUseFigma = tools.tools?.some((t) => t.name === "use_figma");
  if (!hasUseFigma) {
    console.error(
      "FAIL: MCP at",
      MCP_URL,
      "does not expose use_figma (Desktop selection MCP is read-only).",
    );
    console.error(
      "Use Cursor agent CallMcpTool(server: plugin-figma-figma, tool: use_figma)",
    );
    console.error(
      "or set FIGMA_DESKTOP_MCP_URL to a remote MCP that includes use_figma.",
    );
    process.exit(1);
  }

  try {
    for (const phasePath of phasePaths) {
      if (!existsSync(phasePath)) {
        throw new Error(`Missing phase script: ${phasePath}`);
      }
      const base = phasePath.split("/").pop();
      const code = readFileSync(phasePath, "utf8");
      console.log(`→ ${base} (${code.length} bytes)`);
      const summary = await applyPhase(
        client,
        code,
        `Apply ${base} (${RUN_ID})`,
      );
      const failed =
        /invalid tool arguments|error|fail/i.test(summary) &&
        !/"collectionId"|variableIds|variableCount/i.test(summary);
      if (failed) {
        console.error(`  ✗ ${base}: ${summary.slice(0, 400)}`);
        process.exit(1);
      }
      console.log(`  ✓ ${summary.slice(0, 200)}\n`);
    }
    console.log("Done.");
  } finally {
    await transport.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err.message ?? err);
  process.exit(1);
});
