#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, loadConfigFromFile } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const packageRoot = join(root, "packages/react");
const dist = join(packageRoot, "dist");
const configPath = join(packageRoot, "vite.config.ts");
const entries = [
  "index",
  "actions",
  "consent",
  "content",
  "feedback",
  "forms",
  "hooks",
  "identity",
  "layout",
  "navigation",
  "patterns",
  "runtime",
  "typography",
];
const environment = {
  command: "build",
  mode: "production",
  isSsrBuild: false,
  isPreview: false,
};

for (const entryName of entries) {
  process.env.DT_REACT_CSS_ENTRY = entryName;
  const loaded = await loadConfigFromFile(environment, configPath);
  if (!loaded) throw new Error(`Could not load ${configPath}`);
  await build({ ...loaded.config, logLevel: "silent" });

  const entryDir = join(dist, ".css", entryName);
  const sourceCss = join(entryDir, "style.css");
  const outputCss = join(
    dist,
    entryName === "index" ? "style.css" : `${entryName}.css`,
  );
  writeFileSync(outputCss, existsSync(sourceCss) ? readFileSync(sourceCss) : "");
}

delete process.env.DT_REACT_CSS_ENTRY;
rmSync(join(dist, ".css"), { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

console.log(`Built isolated CSS for ${entries.length} React package entrypoints.`);
