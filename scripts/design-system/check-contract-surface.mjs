#!/usr/bin/env node
/**
 * check:contract-surface — semver gate for the @digitaltableteur/react contract.
 *
 * The API-report pattern (api-extractor), applied to component contracts.
 * `packages/react/contract-surface.json` is a committed snapshot of every
 * exported component's contract surface: props (optionality, literal values,
 * type text), variants, keyboard contract, slots, element, and sub-parts.
 *
 *   npm run check:contract-surface              # fail if the surface drifted
 *   npm run check:contract-surface -- --update  # accept: rewrite the report,
 *                                               # accumulate the required bump
 *   npm run check:contract-surface -- --release # publishing: the package
 *                                               # version must satisfy the bump
 *   npm run check:contract-surface -- --mark-released  # after a publish
 *
 * Every change is classified. Breaking: a removed component, prop, variant
 * value, keyboard key, slot, or sub-part; a prop that became required; a new
 * required prop; a changed prop type or element. Additive: anything new and
 * optional. The report accumulates the strongest change since the last
 * release as `pendingBump`, and `--release` refuses a version that does not
 * cover it. Under 0.x, npm's caret range (^0.1.25) accepts any 0.1.x, so a
 * breaking change needs at least a minor bump (0.2.0) to stay out of
 * existing consumers' installs; from 1.0 it needs a major.
 *
 * Contracts do not ship in the npm package; this gate protects the runtime
 * API the contracts describe, because agent blocks are extracted from the
 * TypeScript props of the published components.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT = join(ROOT, "packages/react/contract-surface.json");
const PACKAGE_JSON = join(ROOT, "packages/react/package.json");
const PUBLIC_API = join(ROOT, "packages/react/public-api.manifest.json");
const AGENT_MANIFEST = join(ROOT, "nextjs-app/shared/foundations/dist/agent-manifest.json");

const BUMP_ORDER = ["none", "patch", "minor", "major"];
const args = new Set(process.argv.slice(2));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Stable, order-independent surface for one component. */
function componentSurface(entry) {
  const props = {};
  for (const [name, schema] of Object.entries(entry.agent?.props ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    props[name] = {
      optional: schema.optional !== false,
      ...(schema.values?.length
        ? { values: [...schema.values].sort() }
        : { type: schema.type ?? "unknown" }),
      ...(schema.deprecated ? { deprecated: true } : {}),
    };
  }
  const contract = entry.contract ?? {};
  const sortedList = (list) =>
    [...new Set((list ?? []).map((item) => (typeof item === "string" ? item : JSON.stringify(item))))].sort();
  return {
    element: contract.element ?? null,
    props,
    slots: sortedList(contract.slots),
    subParts: sortedList(
      (contract.subParts ?? []).map((part) => (typeof part === "string" ? part : part?.name ?? part)),
    ),
    keyboard: sortedList(contract.a11y?.keyboard),
  };
}

export function buildSurface(manifest, exportedNames) {
  const exported = new Set(exportedNames);
  const components = {};
  for (const entry of [...(manifest.components ?? [])].sort((a, b) => a.name.localeCompare(b.name))) {
    if (!exported.has(entry.name)) continue;
    components[entry.name] = componentSurface(entry);
  }
  return components;
}

/** Classify every difference between two surfaces. */
export function diffSurfaces(before, after) {
  const changes = [];
  const add = (component, level, detail) => changes.push({ component, level, detail });

  for (const name of Object.keys(before)) {
    if (!(name in after)) add(name, "breaking", "component removed from the public API");
  }
  for (const [name, next] of Object.entries(after)) {
    const prev = before[name];
    if (!prev) {
      add(name, "additive", "component added to the public API");
      continue;
    }
    if (prev.element !== next.element) {
      add(name, "breaking", `root element ${prev.element} → ${next.element}`);
    }
    for (const [prop, was] of Object.entries(prev.props)) {
      const now = next.props[prop];
      if (!now) {
        add(name, "breaking", `prop \`${prop}\` removed`);
        continue;
      }
      if (was.optional && !now.optional) add(name, "breaking", `prop \`${prop}\` became required`);
      if (!was.optional && now.optional) add(name, "additive", `prop \`${prop}\` became optional`);
      if (was.values && now.values) {
        for (const value of was.values) {
          if (!now.values.includes(value)) add(name, "breaking", `prop \`${prop}\` dropped value "${value}"`);
        }
        for (const value of now.values) {
          if (!was.values.includes(value)) add(name, "additive", `prop \`${prop}\` added value "${value}"`);
        }
      } else if ((was.values ? "union" : was.type) !== (now.values ? "union" : now.type)) {
        add(name, "breaking", `prop \`${prop}\` type changed`);
      }
      if (!was.deprecated && now.deprecated) add(name, "additive", `prop \`${prop}\` deprecated`);
    }
    for (const [prop, now] of Object.entries(next.props)) {
      if (prev.props[prop]) continue;
      add(
        name,
        now.optional ? "additive" : "breaking",
        now.optional ? `prop \`${prop}\` added` : `required prop \`${prop}\` added`,
      );
    }
    for (const field of ["slots", "subParts", "keyboard"]) {
      for (const item of prev[field]) {
        if (!next[field].includes(item)) add(name, "breaking", `${field} lost "${item}"`);
      }
      for (const item of next[field]) {
        if (!prev[field].includes(item)) add(name, "additive", `${field} gained "${item}"`);
      }
    }
  }
  return changes;
}

/**
 * Deprecated props on exported components must warn at runtime
 * (warnPropRename / warnDeprecated from shared/utils/deprecationWarning), or a
 * consumer on the published package never learns about the deprecation.
 * Returns `Component.prop` keys that have no warning call in the source.
 */
export function deprecationsWithoutWarning(surface, readSource) {
  const gaps = [];
  for (const [name, component] of Object.entries(surface)) {
    for (const [prop, schema] of Object.entries(component.props)) {
      if (!schema.deprecated) continue;
      const source = readSource(name) ?? "";
      const warned = new RegExp(
        `warn(?:PropRename|Deprecated)\\(\\s*["'\`]${name}["'\`]\\s*,\\s*["'\`]${prop}["'\`]`,
      ).test(source);
      if (!warned) gaps.push(`${name}.${prop}`);
    }
  }
  return gaps.sort();
}

function readComponentSource(name) {
  for (const root of ["nextjs-app/shared/components", "nextjs-app/shared/patterns"]) {
    const path = join(ROOT, root, name, `${name}.tsx`);
    if (existsSync(path)) return readFileSync(path, "utf8");
  }
  return null;
}

/** The bump a change level needs for a given current version. */
export function bumpFor(level, version) {
  const major = Number(String(version).split(".")[0]);
  if (level === "breaking") return major === 0 ? "minor" : "major";
  if (level === "additive") return major === 0 ? "patch" : "minor";
  return "none";
}

export function strongest(...bumps) {
  return bumps.reduce((a, b) => (BUMP_ORDER.indexOf(b) > BUMP_ORDER.indexOf(a) ? b : a), "none");
}

/** The bump actually taken between two versions. */
export function bumpBetween(from, to) {
  const [a, b] = [from, to].map((v) => String(v).split(".").map(Number));
  if (b[0] > a[0]) return "major";
  if (b[0] === a[0] && b[1] > a[1]) return "minor";
  if (b[0] === a[0] && b[1] === a[1] && b[2] > a[2]) return "patch";
  return "none";
}

function main() {
  const version = readJson(PACKAGE_JSON).version;
  const manifest = readJson(AGENT_MANIFEST);
  const exported = readJson(PUBLIC_API).runtimeExports ?? [];
  const current = buildSurface(manifest, exported);

  if (!existsSync(REPORT)) {
    if (!args.has("--update")) {
      console.error("✗ packages/react/contract-surface.json missing. Run with --update to create it.");
      process.exit(1);
    }
    writeFileSync(
      REPORT,
      `${JSON.stringify(
        {
          note: "Generated by npm run check:contract-surface -- --update. Review diffs: they are public API changes.",
          releasedVersion: version,
          pendingBump: "none",
          pendingChanges: [],
          deprecationsWithoutRuntimeWarning: deprecationsWithoutWarning(current, readComponentSource),
          components: current,
        },
        null,
        2,
      )}\n`,
    );
    console.log(`✓ Created contract-surface.json (${Object.keys(current).length} exported components).`);
    return;
  }

  const report = readJson(REPORT);
  const changes = diffSurfaces(report.components, current);

  // Ratchet: the allowlist of unwarned deprecations may only shrink.
  const gaps = deprecationsWithoutWarning(current, readComponentSource);
  const allowed = new Set(report.deprecationsWithoutRuntimeWarning ?? []);
  const newGaps = gaps.filter((gap) => !allowed.has(gap));
  const closed = [...allowed].filter((gap) => !gaps.includes(gap));
  if (newGaps.length || closed.length) {
    for (const gap of newGaps) {
      console.error(
        `✗ ${gap} is deprecated but never warns at runtime; call warnPropRename/warnDeprecated from shared/utils/deprecationWarning.`,
      );
    }
    for (const gap of closed) {
      console.error(
        `✗ ${gap} now warns (or is gone); remove it from deprecationsWithoutRuntimeWarning in contract-surface.json.`,
      );
    }
    process.exit(1);
  }
  const required = strongest(...changes.map((c) => bumpFor(c.level, report.releasedVersion)));

  if (args.has("--mark-released")) {
    if (changes.length) {
      console.error("✗ Surface differs from the report; run --update first.");
      process.exit(1);
    }
    report.releasedVersion = version;
    report.pendingBump = "none";
    report.pendingChanges = [];
    writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`✓ Marked contract surface released at ${version}.`);
    return;
  }

  if (changes.length) {
    for (const change of changes) {
      console.log(`${change.level === "breaking" ? "✗" : "+"} ${change.component}: ${change.detail}`);
    }
  }

  if (args.has("--update")) {
    report.pendingChanges = [
      ...report.pendingChanges,
      ...changes.map((c) => ({ ...c, bump: bumpFor(c.level, report.releasedVersion) })),
    ];
    report.pendingBump = strongest(report.pendingBump, required);
    report.components = current;
    writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(
      `✓ contract-surface.json updated: ${changes.length} change(s); pending bump since ${report.releasedVersion} is now "${report.pendingBump}".`,
    );
    return;
  }

  if (changes.length) {
    console.error(
      `\n✗ The public contract surface changed (${changes.length} change(s), needs a ${required} bump). ` +
        "If intentional, run npm run check:contract-surface -- --update and commit the report with the change.",
    );
    process.exit(1);
  }

  if (args.has("--release")) {
    const taken = bumpBetween(report.releasedVersion, version);
    if (BUMP_ORDER.indexOf(taken) < BUMP_ORDER.indexOf(report.pendingBump)) {
      console.error(
        `✗ Publishing ${version} is a ${taken} bump from ${report.releasedVersion}, but the contract changes since then need "${report.pendingBump}":`,
      );
      for (const change of report.pendingChanges) {
        console.error(`  - ${change.component}: ${change.detail} (${change.bump})`);
      }
      process.exit(1);
    }
    console.log(
      `✓ ${version} covers the pending "${report.pendingBump}" contract bump since ${report.releasedVersion}.`,
    );
    return;
  }

  console.log(
    `✓ Contract surface matches (${Object.keys(current).length} exported components; pending bump "${report.pendingBump}" since ${report.releasedVersion}).`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
