#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import elements from "../../packages/web-components/web-components.config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_ROOT = join(ROOT, "packages/web-components");

function run(command, args, cwd = ROOT) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

run("npm", ["run", "build"], PACKAGE_ROOT);
run("npx", ["vitest", "run", "tests/web-components"]);

await import(pathToFileURL(join(PACKAGE_ROOT, "dist/index.js")));
await import(pathToFileURL(join(PACKAGE_ROOT, "dist/native.js")));

const manifest = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, "custom-elements.json"), "utf8"),
);
const declarations =
  manifest.modules?.flatMap((module) => module.declarations ?? []) ?? [];
const tags = declarations.map((declaration) => declaration.tagName).sort();
const expectedTags = elements.map((element) => element.tagName).sort();
if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
  throw new Error(`Custom Elements Manifest tags differ: ${tags.join(", ")}`);
}

for (const element of elements) {
  const declaration = declarations.find(
    (candidate) => candidate.tagName === element.tagName,
  );
  if (
    declaration?.dtImplementationStatus !== element.implementationStatus ||
    declaration?.dtContractStatus == null
  ) {
    throw new Error(
      `${element.tagName} manifest lifecycle metadata differs from source configuration`,
    );
  }
  if (
    JSON.stringify(declaration.dtImplementationConsumers ?? []) !==
    JSON.stringify(element.implementationConsumers ?? [])
  ) {
    throw new Error(
      `${element.tagName} manifest production-consumer evidence differs from source configuration`,
    );
  }
  const members = new Set(
    (declaration?.members ?? []).map((member) => member.name),
  );
  const attributes = new Set(
    (declaration?.attributes ?? []).map((attribute) => attribute.name),
  );
  for (const prop of element.props) {
    if (!prop.attributeOnly && !members.has(prop.name)) {
      throw new Error(
        `${element.tagName} manifest misses property member ${prop.name}`,
      );
    }
    const attributeName =
      prop.attributeName ??
      prop.name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    if (!prop.propertyOnly && !attributes.has(attributeName)) {
      throw new Error(
        `${element.tagName} manifest misses attribute ${attributeName}`,
      );
    }
  }
}

const generatorSource = readFileSync(
  join(ROOT, "scripts/design-system/generate-web-components.mjs"),
  "utf8",
);
const generatorImports = generatorSource.slice(
  0,
  generatorSource.indexOf("const ROOT"),
);
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
const maxPackedFiles = 40 + tags.length * 2;
// The published tarball is dominated by two things that do NOT scale per component:
// the shared framework-free native chunk (~1.15 MB minified, including bundled
// libphonenumber-js data for dt-phone-input and Prism grammars for
// dt-code-snippet) and the generated custom-elements.json manifest (~298 kB).
// The remainder scales with the number of registered tags
// (register/contract/typings entries). Keep this ceiling snug so genuine bloat in
// either the shared chunk or the manifest still trips the budget.
const sharedBundleAndManifestCeiling = 1_295_000;
// Attribute metadata and complete property-member metadata both scale with
// each public element. Keep the member allowance explicit so fieldName never
// points at an undeclared Custom Elements Manifest member.
const perTagAllowance = tags.length * 6_025;
// Canonical/native status plus production-consumer evidence is intentionally
// repeated per declaration in custom-elements.json and in the generated
// migration manifest so package consumers can inspect maturity without this
// repository. Keep that new cost separate from runtime/property growth.
const lifecycleMetadataAllowance = tags.length * 300;
const maxUnpackedSize =
  sharedBundleAndManifestCeiling +
  perTagAllowance +
  lifecycleMetadataAllowance;
if (pack.entryCount > maxPackedFiles || pack.unpackedSize > maxUnpackedSize) {
  throw new Error(
    `Web-components tarball exceeds its ${tags.length}-component budget (${pack.entryCount}/${maxPackedFiles} files, ${pack.unpackedSize}/${maxUnpackedSize} bytes)`,
  );
}

console.log(
  `✓ web-components package verified (${tags.length} tags, ${pack.entryCount} packed files)`,
);
