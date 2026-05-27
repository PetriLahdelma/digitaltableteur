#!/usr/bin/env node
/**
 * Prevent broken `next dev` from stale production output or corrupted webpack packs.
 */
import fs from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
const buildIdPath = path.join(nextDir, "BUILD_ID");
const cacheDir = path.join(nextDir, "cache");

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
  process.exit(0);
}

// Partial deletes while dev is running cause missing *.pack.gz ENOENTs.
rmSafe(cacheDir, "Cleared .next/cache (stale webpack packs).");
