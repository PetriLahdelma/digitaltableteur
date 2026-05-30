#!/usr/bin/env node
/**
 * Keep `next dev` healthy:
 * - Drop `.next` when a production build (BUILD_ID) would break dev manifests.
 * - Prune bloated webpack disk cache (often 1–2GB+) that can add minutes to startup.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const buildIdPath = path.join(nextDir, "BUILD_ID");
const webpackCacheDir = path.join(nextDir, "cache", "webpack");

/** Above this, webpack cache validation on startup routinely exceeds minutes. */
const MAX_WEBPACK_CACHE_BYTES = 400 * 1024 * 1024;

function rmSafe(target, label) {
  if (!fs.existsSync(target)) return;
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(label);
  } catch (error) {
    console.warn(
      `Could not remove ${target}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

function dirSizeBytes(target) {
  if (!fs.existsSync(target)) return 0;
  try {
    const out = execFileSync("du", ["-sk", target], { encoding: "utf8" });
    const kb = Number.parseInt(out.split(/\s+/)[0] ?? "0", 10);
    return Number.isFinite(kb) ? kb * 1024 : 0;
  } catch {
    return 0;
  }
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

// Production `next build` artifacts break dev RSC manifests.
if (fs.existsSync(buildIdPath)) {
  rmSafe(nextDir, "Cleared .next (stale production build).");
}

const webpackCacheBytes = dirSizeBytes(webpackCacheDir);
if (webpackCacheBytes > MAX_WEBPACK_CACHE_BYTES) {
  rmSafe(
    webpackCacheDir,
    `Cleared bloated webpack cache (${formatMb(webpackCacheBytes)}). Dev startup should be much faster; first route compile still ~1–2 min cold.`,
  );
}
