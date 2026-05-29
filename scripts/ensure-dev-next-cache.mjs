#!/usr/bin/env node
/**
 * Prevent broken `next dev` from stale production output.
 *
 * Only removes `.next` when a production `next build` left BUILD_ID behind.
 * Do NOT wipe `.next/cache` on every dev start — that forces a full cold
 * webpack compile (~30–60s) and causes ChunkLoadError if the browser still
 * holds chunk URLs from a previous dev session.
 */
import fs from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const buildIdPath = path.join(nextDir, "BUILD_ID");

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

// Production `next build` artifacts break dev RSC manifests.
if (fs.existsSync(buildIdPath)) {
  rmSafe(nextDir, "Cleared .next (stale production build).");
}
