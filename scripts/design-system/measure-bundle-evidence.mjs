#!/usr/bin/env node
/**
 * Per-component bundle-cost evidence for @digitaltableteur/react
 * (Astryx-gap Phase 4, increment 1).
 *
 * Measures, from the freshly built package dist, what each exported component
 * costs a consumer: minified+gzipped bytes with all deps external ("self") and
 * with runtime deps bundled ("withDeps"). Writes a provenance-stamped artifact
 * to public/ds-health/bundle-evidence.json.
 *
 * This is per-publish evidence: it describes the built dist, which is not
 * committed. Run after `npm --prefix packages/react run build` (or pass
 * --build to build first). The react publish preflight regenerates it on
 * every publish.
 *
 * Usage:
 *   npm run audit:bundle-evidence            # requires an existing dist
 *   npm run audit:bundle-evidence -- --build # rebuild dist first
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import {
  assembleBundleEvidence,
  componentEntrySource,
  entryTotalSource,
  externalsFor,
} from "./bundle-evidence-lib.mjs";
import {
  currentProvenance,
  runtimeStampFor,
} from "./evidence-stamp-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PKG_DIR = join(ROOT, "packages/react");
const MANIFEST = join(PKG_DIR, "public-api.manifest.json");
const OUT = join(ROOT, "public/ds-health/bundle-evidence.json");
const GENERATOR_VERSION = 1;

const shouldBuild = process.argv.includes("--build");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function measure(source, externals) {
  const result = await build({
    stdin: {
      contents: source,
      resolveDir: PKG_DIR,
      sourcefile: "bundle-evidence-entry.js",
      loader: "js",
    },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    write: false,
    external: externals,
    logLevel: "silent",
  });
  // CSS pulled in by runtime deps lands in separate output files; JS numbers
  // must stay JS-only (package CSS is measured from dist/<entry>.css).
  const js = result.outputFiles.filter((f) => !f.path.endsWith(".css"));
  const bytes = js.reduce((sum, f) => sum + f.contents.byteLength, 0);
  const gzip = js.reduce(
    (sum, f) => sum + gzipSync(Buffer.from(f.contents)).byteLength,
    0,
  );
  return { minBytes: bytes, gzipBytes: gzip };
}

const packageJson = readJson(join(PKG_DIR, "package.json"));

if (shouldBuild) {
  console.log("→ building packages/react dist…");
  execFileSync("npm", ["--prefix", "packages/react", "run", "build"], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

if (!existsSync(MANIFEST)) {
  console.error("FAIL: packages/react/public-api.manifest.json missing.");
  process.exit(1);
}
const manifest = readJson(MANIFEST);
const exportsByEntry = manifest.runtimeExportsByEntry ?? {};
const entryNames = Object.keys(exportsByEntry);

const missingDist = entryNames.filter(
  (entry) => !existsSync(join(PKG_DIR, "dist", `${entry}.js`)),
);
if (missingDist.length) {
  console.error(
    `FAIL: built dist entries missing (${missingDist.join(", ")}). ` +
      "Run `npm --prefix packages/react run build` or pass --build.",
  );
  process.exit(1);
}

const selfExternals = externalsFor(packageJson, "self");
const withDepsExternals = externalsFor(packageJson, "withDeps");

let esbuildVersion = null;
try {
  esbuildVersion = readJson(
    join(ROOT, "node_modules/esbuild/package.json"),
  ).version;
} catch {
  // toolchain stamp degrades gracefully
}

const entries = {};
let measured = 0;
for (const entryName of entryNames) {
  const componentNames = exportsByEntry[entryName] ?? [];
  const components = {};
  for (const exportName of componentNames) {
    const source = componentEntrySource(entryName, exportName);
    components[exportName] = {
      self: await measure(source, selfExternals),
      withDeps: await measure(source, withDepsExternals),
    };
    measured += 1;
  }
  const totalSource = entryTotalSource(entryName);
  const js = {
    self: await measure(totalSource, selfExternals),
    withDeps: await measure(totalSource, withDepsExternals),
  };
  const cssPath = join(PKG_DIR, "dist", `${entryName}.css`);
  const css = existsSync(cssPath)
    ? (() => {
        const raw = readFileSync(cssPath);
        return { rawBytes: raw.byteLength, gzipBytes: gzipSync(raw).byteLength };
      })()
    : null;
  entries[entryName] = { js, css, components };
  console.log(
    `✓ ${entryName}: ${componentNames.length} exports, entry withDeps gzip ${js.withDeps.gzipBytes} B`,
  );
}

const substance = assembleBundleEvidence({
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  toolchain: {
    esbuild: esbuildVersion,
    gzip: "node:zlib gzipSync (default level)",
  },
  entries,
});

const provenance = currentProvenance(ROOT, {
  name: "measure-bundle-evidence",
  version: GENERATOR_VERSION,
});
const stamp = runtimeStampFor(OUT, substance, provenance);
const report = { generatedAt: stamp.generatedAt, ...substance, provenance: stamp.provenance };

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `\n✓ bundle evidence written: ${measured} component exports across ${entryNames.length} entries → public/ds-health/bundle-evidence.json (package ${packageJson.name}@${packageJson.version})`,
);
