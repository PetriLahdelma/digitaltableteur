#!/usr/bin/env node
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const dist = join(root, "packages/react/dist");
const typesRoot = join(dist, "types");
const componentTypesRoot = join(typesRoot, "nextjs-app/shared/components");
const entryDeclaration = join(typesRoot, "packages/react/src/index.d.ts");

function walkDeclarations(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkDeclarations(full, files);
    } else if (entry.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function relativeImport(fromFile, toFile) {
  let specifier = relative(dirname(fromFile), toFile).replaceAll("\\", "/");
  if (!specifier.startsWith(".")) specifier = `./${specifier}`;
  return specifier.replace(/\.d\.ts$/, "");
}

function rewriteInternalAliases() {
  for (const file of walkDeclarations(typesRoot)) {
    const source = readFileSync(file, "utf8");
    const next = source.replace(/(["'])@dt\/([^"']+)\1/g, (match, quote, name) => {
      const target = join(componentTypesRoot, name, "index.d.ts");
      return `${quote}${relativeImport(file, target)}${quote}`;
    });
    if (next !== source) writeFileSync(file, next);
  }
}

mkdirSync(dist, { recursive: true });
mkdirSync(typesRoot, { recursive: true });
writeFileSync(
  join(dist, "package-globals.d.ts"),
  [
    'declare module "*.css";',
    'declare module "*.module.css" {',
    "  const classes: Record<string, string>;",
    "  export default classes;",
    "}",
    "",
  ].join("\n"),
);
writeFileSync(
  join(dist, "index.d.ts"),
  [
    '/// <reference path="./package-globals.d.ts" />',
    `export * from "${relativeImport(join(dist, "index.d.ts"), entryDeclaration)}";`,
    "",
  ].join("\n"),
);
rewriteInternalAliases();
