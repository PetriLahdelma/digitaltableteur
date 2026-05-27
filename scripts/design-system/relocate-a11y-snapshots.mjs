#!/usr/bin/env node
/** Move __a11y-snapshots__ from mis-resolved folders into the correct component/pattern dir. */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { resolveComponentDir } from "./story-id-to-dir.mjs";

const wrongRoots = [
  "nextjs-app/shared/components/Sitefooter",
  "nextjs-app/shared/components/Siteheader",
];

let moved = 0;
for (const wrongRoot of wrongRoots) {
  const snapDir = join(wrongRoot, "__a11y-snapshots__");
  if (!existsSync(snapDir)) continue;
  for (const file of readdirSync(snapDir).filter((f) => f.endsWith(".yaml"))) {
    const storyId = file.replace(/\.yaml$/, "");
    const targetDir = resolveComponentDir(storyId);
    if (!targetDir) continue;
    const destDir = join(targetDir, "__a11y-snapshots__");
    mkdirSync(destDir, { recursive: true });
    const from = join(snapDir, file);
    const to = join(destDir, file);
    if (existsSync(to)) {
      const existing = readFileSync(to, "utf8");
      const incoming = readFileSync(from, "utf8");
      if (existing !== incoming) {
        console.warn(`relocate: skip ${file} (target exists with different content)`);
        continue;
      }
    } else {
      renameSync(from, to);
      moved += 1;
    }
  }
  try {
    if (readdirSync(snapDir).length === 0) rmSync(snapDir, { recursive: true });
    if (readdirSync(wrongRoot).length === 0) rmSync(wrongRoot, { recursive: true });
  } catch {
    // ignore
  }
}
console.log(`relocate-a11y-snapshots: moved ${moved} files`);
