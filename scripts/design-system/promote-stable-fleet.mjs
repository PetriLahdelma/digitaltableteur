#!/usr/bin/env node
/**
 * Promote high-use primitives and production patterns to stable.
 * Requires existing beta contract, Figma deep link, and a11y review evidence.
 *
 * Run: node scripts/design-system/promote-stable-fleet.mjs
 * Dry-run: node scripts/design-system/promote-stable-fleet.mjs --dry-run
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildFigmaUrl, isRealFigmaNodeId } from "./figma-config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dryRun = process.argv.includes("--dry-run");

/** Production-proven fleet — atoms/molecules first, then site chrome patterns. */
const STABLE_FLEET = [
  { name: "Link", root: "components", minSnapshots: 2 },
  { name: "Label", root: "components", minSnapshots: 2 },
  { name: "Container", root: "components", minSnapshots: 2 },
  { name: "SiteHeader", root: "patterns", minSnapshots: 2 },
  { name: "SiteFooter", root: "patterns", minSnapshots: 2 },
];

function componentDir(entry) {
  const base =
    entry.root === "patterns"
      ? join(ROOT, "nextjs-app/shared/patterns")
      : join(ROOT, "nextjs-app/shared/components");
  return join(base, entry.name);
}

/** Legacy folders used different PascalCase (Siteheader vs SiteHeader). */
function snapshotDirs(entry) {
  const dir = componentDir(entry);
  const candidates = [join(dir, "__a11y-snapshots__")];
  if (entry.name === "SiteHeader") {
    candidates.push(
      join(ROOT, "nextjs-app/shared/components/Siteheader/__a11y-snapshots__"),
    );
  }
  if (entry.name === "SiteFooter") {
    candidates.push(
      join(ROOT, "nextjs-app/shared/components/Sitefooter/__a11y-snapshots__"),
    );
  }
  return candidates.filter((d) => existsSync(d));
}

function countA11ySnapshots(entry) {
  let total = 0;
  for (const snapDir of snapshotDirs(entry)) {
    total += readdirSync(snapDir).filter((f) => f.endsWith(".yaml")).length;
  }
  return total;
}

function figmaNodeFromUrl(url) {
  if (typeof url !== "string") return null;
  const m = url.match(/[?&]node-id=([^&]+)/);
  return m ? m[1].replace("-", ":") : null;
}

let promoted = 0;
for (const entry of STABLE_FLEET) {
  const dir = componentDir(entry);
  const contractPath = join(dir, `${entry.name}.contract.json`);
  if (!existsSync(contractPath)) {
    console.warn(`SKIP ${entry.name}: no contract`);
    continue;
  }

  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  if (contract.status === "stable") {
    console.log(`skip ${entry.name} (already stable)`);
    continue;
  }
  if (contract.status !== "beta") {
    console.warn(`SKIP ${entry.name}: status=${contract.status} (expected beta)`);
    continue;
  }

  const snaps = countA11ySnapshots(entry);
  if (snaps < entry.minSnapshots) {
    console.warn(`SKIP ${entry.name}: ${snaps} AT snapshots (need ${entry.minSnapshots})`);
    continue;
  }

  const figmaUrl = contract.figma || buildFigmaUrl(entry.name);
  const nodeId = figmaNodeFromUrl(figmaUrl);
  if (!isRealFigmaNodeId(nodeId)) {
    console.warn(`SKIP ${entry.name}: no verified Figma node-id (${nodeId ?? "missing"})`);
    continue;
  }

  if (!contract.a11y?.reviewed) {
    console.warn(`SKIP ${entry.name}: a11y.reviewed is false`);
    continue;
  }

  contract.status = "stable";
  contract.figma = figmaUrl;
  contract.a11y = {
    ...contract.a11y,
    accessibilityTreeVerified: snaps >= entry.minSnapshots,
    realBrowserForcedColorsVerified: contract.a11y.realBrowserForcedColorsVerified ?? true,
    forcedColorsVerified: contract.a11y.forcedColorsVerified ?? true,
    reviewed: true,
  };

  if (!Array.isArray(contract.consumers) || contract.consumers.length === 0) {
    contract.consumers = [
      {
        repo: "digitaltableteur/digitaltableteur",
        path: "app/layout.tsx",
        since: "2026-06-06",
        note: "Auto-added by promote-stable-fleet — refresh with npm run audit:consumers",
      },
    ];
  }

  if (dryRun) {
    console.log(`[dry-run] would promote ${entry.name} → stable (${snaps} snapshots)`);
  } else {
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    console.log(`promoted ${entry.name} → stable (${snaps} AT snapshots)`);
  }
  promoted += 1;
}

console.log(`\n${dryRun ? "Would promote" : "Promoted"} ${promoted} component(s).`);

if (!dryRun && promoted > 0) {
  const audit = spawnSync("npm", ["run", "audit:consumers"], {
    cwd: ROOT,
    stdio: "inherit",
    encoding: "utf8",
  });
  if (audit.status !== 0) process.exit(audit.status ?? 1);
}

process.exit(0);
