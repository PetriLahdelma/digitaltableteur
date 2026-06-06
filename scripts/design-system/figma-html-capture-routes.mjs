#!/usr/bin/env node
/**
 * Route manifest for html-to-design Figma captures (Phase 15).
 * Does NOT mutate Figma — use generate_figma_design MCP + dev:figma-capture.
 *
 * Usage:
 *   npm run dev:figma-capture
 *   node scripts/design-system/figma-html-capture-routes.mjs
 *   node scripts/design-system/figma-html-capture-routes.mjs --route work --capture-id <uuid>
 */
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FIGMA_FILE_KEY, FIGMA_FILE_SLUG } from "./figma-config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/figma/dsb-state.json",
);
const DEV_PORT = process.env.PORT || "3001";
const DEV_ORIGIN = `http://localhost:${DEV_PORT}`;

/** @type {Record<string, { path: string, label: string }>} */
export const CAPTURE_ROUTES = {
  home: { path: "/", label: "Home" },
  work: { path: "/work", label: "Work / portfolio" },
  about: { path: "/about", label: "About" },
  pricing: { path: "/pricing", label: "Pricing" },
  contact: { path: "/contact", label: "Contact" },
  blog: { path: "/blog", label: "Blog index" },
  "blog-article": {
    path: "/blog/agentic-design-systems-operating-models",
    label: "Blog article (sample)",
  },
  sitemap: { path: "/sitemap", label: "Sitemap" },
  dsharp: {
    path: "/work/dsharp-design-system",
    label: "DSharp case study",
  },
};

function buildCaptureUrl(localPath, captureId) {
  const endpoint = encodeURIComponent(
    `https://mcp.figma.com/mcp/capture/${captureId}/submit`,
  );
  return `${DEV_ORIGIN}${localPath}#figmacapture=${captureId}&figmaendpoint=${endpoint}&figmadelay=3000`;
}

function main() {
  const routeArg = process.argv.indexOf("--route");
  const captureArg = process.argv.indexOf("--capture-id");
  const routeKey =
    routeArg >= 0 ? process.argv[routeArg + 1] : undefined;
  const captureId =
    captureArg >= 0 ? process.argv[captureArg + 1] : undefined;

  const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));

  console.log(`Figma file: ${FIGMA_FILE_KEY} (${FIGMA_FILE_SLUG})`);
  console.log(`Dev origin: ${DEV_ORIGIN} (npm run dev:figma-capture)\n`);

  if (routeKey) {
    const route = CAPTURE_ROUTES[routeKey];
    if (!route) {
      console.error(`Unknown route "${routeKey}". Keys: ${Object.keys(CAPTURE_ROUTES).join(", ")}`);
      process.exit(1);
    }
    console.log(`Route: ${routeKey} — ${route.label}`);
    console.log(`Production: ${state.routeViews?.[routeKey]?.url ?? "—"}`);
    const view = state.routeViews?.[routeKey];
    if (view?.captureMethod === "html-to-design") {
      console.log(`Current html-to-design node: ${view.nodeId}`);
      console.log(view.figmaUrl);
    } else if (view?.nodeId) {
      console.log(`Legacy VIews frame: ${view.nodeId} (replace via new capture)`);
    }
    if (captureId) {
      console.log(`\nOpen in browser:\n${buildCaptureUrl(route.path, captureId)}`);
    } else {
      console.log(
        "\nNext: call generate_figma_design MCP (fileKey only) → pass --capture-id to print open URL.",
      );
    }
    return;
  }

  console.log("Routes (html-to-design queue):\n");
  for (const [key, route] of Object.entries(CAPTURE_ROUTES)) {
    const view = state.routeViews?.[key];
    const status =
      view?.captureMethod === "html-to-design"
        ? `✓ captured ${view.capturedAt ?? ""} → ${view.nodeId}`
        : view?.nodeId
          ? `legacy ${view.nodeId}`
          : "pending";
    console.log(`  ${key.padEnd(14)} ${route.path.padEnd(42)} ${status}`);
  }

  console.log(`
Workflow:
  1. npm run dev:figma-capture
  2. generate_figma_design({ fileKey: "${FIGMA_FILE_KEY}" }) → captureId
  3. node scripts/design-system/figma-html-capture-routes.mjs --route <key> --capture-id <id>
  4. Open printed URL; poll generate_figma_design with captureId until completed
  5. Update dsb-state.json routeViews.<key> (nodeId, captureMethod, capturedAt)
  Do NOT run figma-rebuild-route-views.mjs on capture frames.
`);
}

main();
