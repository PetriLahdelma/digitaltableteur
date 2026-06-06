#!/usr/bin/env node
/**
 * Shared constants + URL builder for html-to-design route captures.
 */
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FIGMA_FILE_KEY, FIGMA_FILE_SLUG } from "./figma-config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const STATE_PATH = join(
  ROOT,
  "nextjs-app/shared/foundations/figma/dsb-state.json",
);

/** Required layout width for VIews captures (desktop). */
export const CAPTURE_VIEWPORT_WIDTH = Number(
  process.env.FIGMA_CAPTURE_WIDTH || 1728,
);

/** Initial viewport height; html-to-design captures full document scroll height. */
export const CAPTURE_VIEWPORT_HEIGHT = Number(
  process.env.FIGMA_CAPTURE_HEIGHT || 1080,
);

export const CAPTURE_DELAY_MS = Number(process.env.FIGMA_CAPTURE_DELAY || 3000);

export const DEV_PORT = process.env.PORT || "3001";
export const DEV_ORIGIN = `http://localhost:${DEV_PORT}`;

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

export function readDsbState() {
  return JSON.parse(readFileSync(STATE_PATH, "utf8"));
}

export function buildCaptureUrl(localPath, captureId) {
  const endpoint = encodeURIComponent(
    `https://mcp.figma.com/mcp/capture/${captureId}/submit`,
  );
  return `${DEV_ORIGIN}${localPath}#figmacapture=${captureId}&figmaendpoint=${endpoint}&figmadelay=${CAPTURE_DELAY_MS}`;
}

export function resolveRoute(routeKey) {
  const route = CAPTURE_ROUTES[routeKey];
  if (!route) {
    throw new Error(
      `Unknown route "${routeKey}". Keys: ${Object.keys(CAPTURE_ROUTES).join(", ")}`,
    );
  }
  return route;
}

export { FIGMA_FILE_KEY, FIGMA_FILE_SLUG };
