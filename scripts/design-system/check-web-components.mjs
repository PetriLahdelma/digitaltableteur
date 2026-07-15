#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_ROOT = join(ROOT, "packages/web-components");

function run(command, args, cwd = ROOT) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

run("npm", ["run", "build"], PACKAGE_ROOT);
run("npx", ["vitest", "run", "tests/web-components/web-components.test.ts"]);

await import(pathToFileURL(join(PACKAGE_ROOT, "dist/index.js")));
await import(pathToFileURL(join(PACKAGE_ROOT, "dist/native.js")));

const manifest = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, "custom-elements.json"), "utf8"),
);
const declarations =
  manifest.modules?.flatMap((module) => module.declarations ?? []) ?? [];
const tags = declarations.map((declaration) => declaration.tagName).sort();
const expectedTags = [
  "dt-alert-banner",
  "dt-badge",
  "dt-button",
  "dt-button-group",
  "dt-divider",
  "dt-empty-state",
  "dt-filter-chip",
  "dt-icon",
  "dt-icon-button",
  "dt-link",
  "dt-nav-link",
  "dt-progress",
  "dt-skip-link",
  "dt-spinner",
  "dt-status-dot",
];
if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
  throw new Error(`Custom Elements Manifest tags differ: ${tags.join(", ")}`);
}

const generatorSource = readFileSync(
  join(ROOT, "scripts/design-system/generate-web-components.mjs"),
  "utf8",
);
const generatorImports = generatorSource.slice(0, generatorSource.indexOf("const ROOT"));
if (
  /from ["'](?:react|react-dom(?:\/server)?)["']/.test(generatorImports) ||
  generatorSource.includes("renderToStaticMarkup")
) {
  throw new Error("Native icon generation must not invoke React or React DOM");
}

const packageJson = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8"),
);
for (const dependency of [
  "@digitaltableteur/react",
  "@r2wc/react-to-web-component",
  "react",
  "react-dom",
]) {
  if (packageJson.dependencies?.[dependency]) {
    throw new Error(`Native default package must not install ${dependency}`);
  }
  if (!packageJson.peerDependenciesMeta?.[dependency]?.optional) {
    throw new Error(`Legacy adapter peer ${dependency} must remain optional`);
  }
}

const nativeArtifacts = [
  "index.js",
  "native.js",
  "register.js",
  "register-native.js",
  ...readdirSync(join(PACKAGE_ROOT, "dist/chunks"))
    .filter((file) => file.startsWith("native-") && file.endsWith(".js"))
    .map((file) => `chunks/${file}`),
];
for (const artifact of nativeArtifacts) {
  const source = readFileSync(join(PACKAGE_ROOT, "dist", artifact), "utf8");
  if (
    /(?:from|import\()["'](?:react|react-dom|@digitaltableteur\/react|@r2wc\/)/.test(
      source,
    )
  ) {
    throw new Error(
      `Native artifact imports a React adapter dependency: ${artifact}`,
    );
  }
}

const packOutput = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: PACKAGE_ROOT,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
const [pack] = JSON.parse(packOutput);
const files = new Set(pack.files.map((file) => file.path));
for (const required of [
  "README.md",
  "custom-elements.json",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/native.js",
  "dist/react.js",
  "dist/register.js",
  "package.json",
]) {
  if (!files.has(required))
    throw new Error(`Web-components tarball misses ${required}`);
}
if (pack.entryCount > 70 || pack.unpackedSize > 450_000) {
  throw new Error(
    `Web-components tarball exceeds its ceiling (${pack.entryCount} files, ${pack.unpackedSize} bytes)`,
  );
}

console.log(
  `✓ web-components package verified (${tags.length} tags, ${pack.entryCount} packed files)`,
);
