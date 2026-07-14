#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import ts from "typescript";

const root = resolve(new URL("../..", import.meta.url).pathname);
const dist = join(root, "packages/react/dist");
const sourceRoot = join(root, "packages/react/src");
const outDir = join(root, ".omx/state/design-system/react-package-topology");
const manifest = JSON.parse(
  readFileSync(join(dist, ".vite/manifest.json"), "utf8"),
);
const familyEntries = [
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
const entryKeys = new Map(
  Object.entries(manifest)
    .filter(([, value]) => value.isEntry)
    .map(([key, value]) => [value.name, key]),
);

function normalizedExports(path) {
  const sourceText = readFileSync(path, "utf8");
  const source = ts.createSourceFile(
    path,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  return source.statements
    .filter(
      (statement) =>
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier),
    )
    .flatMap((statement) => {
      const moduleName = statement.moduleSpecifier.text;
      if (!statement.exportClause) {
        return [`${statement.isTypeOnly ? "type" : "value"}:*:${moduleName}`];
      }
      if (ts.isNamespaceExport(statement.exportClause)) {
        return [
          `${statement.isTypeOnly ? "type" : "value"}:* as ${statement.exportClause.name.text}:${moduleName}`,
        ];
      }
      return statement.exportClause.elements.map((element) => {
        const importedName = element.propertyName?.text ?? element.name.text;
        const exportedName = element.name.text;
        const kind = statement.isTypeOnly || element.isTypeOnly ? "type" : "value";
        return `${kind}:${importedName} as ${exportedName}:${moduleName}`;
      });
    })
    .sort();
}

const rootExports = normalizedExports(join(sourceRoot, "index.ts"));
const familyExports = familyEntries
  .flatMap((entryName) => normalizedExports(join(sourceRoot, `${entryName}.ts`)))
  .sort();
if (JSON.stringify(rootExports) !== JSON.stringify(familyExports)) {
  const rootSet = new Set(rootExports);
  const familySet = new Set(familyExports);
  throw new Error(
    `Family source entries do not exactly partition the root barrel; missing=${rootExports.filter((entry) => !familySet.has(entry)).length} extra=${familyExports.filter((entry) => !rootSet.has(entry)).length}`,
  );
}

function collectChunks(key, chunks = new Set()) {
  if (chunks.has(key)) return chunks;
  const chunk = manifest[key];
  if (!chunk) throw new Error(`Vite manifest is missing chunk ${key}`);
  chunks.add(key);
  for (const imported of chunk.imports ?? []) collectChunks(imported, chunks);
  return chunks;
}

function gzipBytes(path) {
  return gzipSync(readFileSync(path), { level: 9 }).byteLength;
}

function measure(entryName) {
  const entryKey = entryKeys.get(entryName);
  if (!entryKey) throw new Error(`Vite manifest is missing entry ${entryName}`);
  const chunks = collectChunks(entryKey);
  const javascriptGzipBytes = [...chunks].reduce(
    (total, key) => total + gzipBytes(join(dist, manifest[key].file)),
    0,
  );
  const cssName = entryName === "index" ? "style.css" : `${entryName}.css`;
  return {
    entryName,
    chunkCount: chunks.size,
    javascriptGzipBytes,
    cssGzipBytes: gzipBytes(join(dist, cssName)),
  };
}

const rootEntry = measure("index");
const families = familyEntries.map(measure);
for (const family of families) {
  if (family.javascriptGzipBytes >= rootEntry.javascriptGzipBytes) {
    throw new Error(`${family.entryName} JS graph is not smaller than the root graph`);
  }
  if (family.cssGzipBytes > rootEntry.cssGzipBytes) {
    throw new Error(`${family.entryName} CSS is larger than the global stylesheet`);
  }
}

const sortedJs = families
  .map((entry) => entry.javascriptGzipBytes)
  .sort((a, b) => a - b);
const medianJs = sortedJs[Math.floor(sortedJs.length / 2)];
const largestJs = sortedJs.at(-1);
if (medianJs > rootEntry.javascriptGzipBytes * 0.5) {
  throw new Error("Median family JS graph must remain at least 50% below root");
}
if (largestJs > rootEntry.javascriptGzipBytes * 0.55) {
  throw new Error("Largest family JS graph must remain at least 45% below root");
}

const report = {
  generatedAt: new Date().toISOString(),
  root: rootEntry,
  families,
  medianFamilyJsRatio: medianJs / rootEntry.javascriptGzipBytes,
  largestFamilyJsRatio: largestJs / rootEntry.javascriptGzipBytes,
};
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);

console.log(
  `✓ React package topology verified (${familyEntries.length} families, median JS ${(report.medianFamilyJsRatio * 100).toFixed(1)}% of root, largest ${(report.largestFamilyJsRatio * 100).toFixed(1)}%)`,
);
