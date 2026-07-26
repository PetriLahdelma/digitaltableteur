import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const SOURCE = join(REPO_ROOT, "nextjs-app", "shared", "foundations", "dist");
const TARGET = join(PACKAGE_ROOT, "data");
const FILES = ["docs-registry.json", "agent-manifest.json"];

await mkdir(TARGET, { recursive: true });
await Promise.all(
  FILES.map((file) => copyFile(join(SOURCE, file), join(TARGET, file))),
);
process.stdout.write(
  `Built @digitaltableteur/cli data (${FILES.join(", ")}).\n`,
);
