#!/usr/bin/env node
/**
 * Automated preflight for publishing @digitaltableteur/react.
 *
 * This is intentionally an orchestrator over the existing narrow gates. The
 * normal mode proves every automated package/browser path that can be checked
 * today and reports the remaining human checkpoints. The strict mode is for the
 * final publish moment and fails fast until the human-cleared roadmap
 * checkpoints are recorded.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_PATH = join(ROOT, "scripts/design-system/astryx-roadmap.state.json");
const OUT_DIR = join(ROOT, ".omx/state/design-system/react-publish-preflight");
const OUT_JSON = join(OUT_DIR, "latest.json");
const CLEARANCE_HANDOFF_PATH = ".omx/state/design-system/react-publish-clearance/handoff.md";
const REQUIRE_CLEARANCE =
  process.argv.includes("--require-clearance") ||
  process.env.DT_REQUIRE_REACT_PUBLISH_CLEARANCE === "1";

const automatedChecks = [
  {
    name: "lint",
    command: ["run", "lint"],
    reason: "source formatting and repo lint banner checks",
  },
  {
    name: "typecheck",
    command: ["run", "typecheck"],
    reason: "Next typegen plus TypeScript no-emit over the app/package boundary",
  },
  {
    name: "test",
    command: ["test"],
    reason: "full Vitest unit and accessibility suite",
  },
  {
    name: "storybook-build",
    command: ["run", "storybook:build"],
    reason: "Vite dependency scan and static Storybook bundle still compile",
  },
  {
    name: "build",
    command: ["run", "build"],
    reason: "Next production build still compiles and renders route data",
  },
  {
    name: "astryx-roadmap",
    command: ["run", "check:astryx-roadmap"],
    reason: "ratchets, anti-goals, and checkpoint state are still enforced",
  },
  {
    name: "beta-promotion-readiness",
    command: ["run", "check:beta-promotion-readiness"],
    reason: "consumer-backed beta candidates are reported and cannot be prematurely promoted to stable",
  },
  {
    name: "package-release-notes",
    command: ["run", "check:package-release-notes"],
    reason: "package semver, restricted publish metadata, exports, and changelogs are ready",
  },
  {
    name: "trusted-publisher",
    command: ["run", "check:trusted-publisher"],
    reason: "GitHub Actions OIDC workflow and package repository metadata are ready for npm Trusted Publisher matching",
  },
  {
    name: "registry-token-install",
    command: ["run", "check:registry-token-install"],
    reason: "published private token packages install from npm",
  },
  {
    name: "package-consumption-boundaries",
    command: ["run", "check:package-consumption-boundaries"],
    reason: "the root app consumes @digitaltableteur/* from npm and app-facing shared contexts do not split",
  },
  {
    name: "package-registry-status",
    command: ["run", "check:package-registry-status"],
    reason: "npm registry state matches the pre-publish plan: tokens published, React unpublished",
  },
  {
    name: "react-registry-install-waiting",
    command: ["run", "check:react-registry-install", "--", "--expect-unpublished"],
    reason: "writes the post-publish React registry-smoke readiness report while React is still unpublished",
  },
  {
    name: "npm-consumer-install",
    command: ["run", "check:npm-consumer-install"],
    reason: "local tarballs install and typecheck in a clean consumer",
  },
  {
    name: "package-tarballs",
    command: ["run", "check:package-tarballs"],
    reason: "npm pack dry-run payloads contain only dist/package metadata and no source/config leakage",
  },
  {
    name: "package-publish-dry-run",
    command: ["run", "check:package-publish-dry-run"],
    reason: "npm publish dry-runs use the same restricted publish command shape as the OIDC workflow",
  },
  {
    name: "react-public-surface",
    command: REQUIRE_CLEARANCE
      ? ["run", "check:react-public-surface", "--", "--require-publishable"]
      : ["run", "check:react-public-surface"],
    reason: "the package public contract surface has no new alpha exposure before publish",
  },
  {
    name: "react-public-api",
    command: ["run", "check:react-public-api"],
    reason: "the package runtime exports and subpath entrypoints match the frozen public API manifest",
  },
  {
    name: "site-package-dogfood",
    command: ["run", "check:site-package-dogfood"],
    reason: "the running Next app still dogfoods the package boundary in EN/FI/SV",
  },
  {
    name: "i18n-visual-matrix",
    command: ["run", "test:stories:i18n"],
    reason: "writes the EN/FI/SV screenshot review packet for i18n/navigation checkpoint clearance",
  },
  {
    name: "react-publish-review",
    command: ["run", "check:react-publish-review"],
    reason: "validates the latest review evidence and writes the human clearance packet without clearing approvals",
  },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function relativePath(path) {
  return relative(ROOT, path);
}

function writeReport(report) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
}

function taskStatusLine(id, task) {
  const status = task?.status ?? "missing";
  const approved = task?.approval?.clearedBy && task?.approval?.on ? "approved" : "unapproved";
  return `${id}: ${status} (${approved})`;
}

function isApprovedDone(task) {
  return task?.status === "done" && task?.approval?.clearedBy && task?.approval?.on;
}

function pendingClearanceErrors(state) {
  const tasks = state.tasks ?? {};
  const errors = [];

  for (const id of ["1.5", "1.6"]) {
    if (!isApprovedDone(tasks[id])) {
      errors.push(
        `checkpoint ${id} is not cleared for React publish (${taskStatusLine(id, tasks[id])})`,
      );
    }
  }

  const publishTask = tasks["5.1"];
  const note = publishTask?.approval?.note ?? "";
  if (
    !publishTask?.approval?.clearedBy ||
    !publishTask?.approval?.on ||
    !/@digitaltableteur\/react/.test(note) ||
    /react remains unpublished|token-package registry smoke/i.test(note)
  ) {
    errors.push(
      `checkpoint 5.1 does not record explicit @digitaltableteur/react publish clearance (${taskStatusLine("5.1", publishTask)})`,
    );
  }

  return errors;
}

function clearanceSnapshot(tasks, clearanceErrors) {
  return {
    pending: clearanceErrors,
    handoffPath: CLEARANCE_HANDOFF_PATH,
    tasks: {
      "1.5": tasks["1.5"] ?? null,
      "1.6": tasks["1.6"] ?? null,
      "5.1": tasks["5.1"] ?? null,
    },
  };
}

function buildReport(status, checks, tasks, clearanceErrors) {
  return {
    generatedAt: new Date().toISOString(),
    status,
    strict: REQUIRE_CLEARANCE,
    expectedCheckCount: automatedChecks.length,
    passedCheckCount: checks.filter((check) => check.status === "passed").length,
    failedCheckCount: checks.filter((check) => check.status === "failed").length,
    checks,
    clearance: clearanceSnapshot(tasks, clearanceErrors),
  };
}

function runCheck(check) {
  console.log(`\n[react-publish-preflight] ${check.name}: ${check.reason}`);
  const startedAt = Date.now();
  try {
    execFileSync("npm", check.command, {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
    return {
      name: check.name,
      command: ["npm", ...check.command],
      reason: check.reason,
      status: "passed",
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      name: check.name,
      command: ["npm", ...check.command],
      reason: check.reason,
      status: "failed",
      durationMs: Date.now() - startedAt,
      exitCode: typeof error.status === "number" ? error.status : null,
      signal: error.signal ?? null,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

const state = readJson(STATE_PATH);
const tasks = state.tasks ?? {};
const clearanceErrors = pendingClearanceErrors(state);

if (REQUIRE_CLEARANCE && clearanceErrors.length) {
  const report = buildReport("blocked-clearance", [], tasks, clearanceErrors);
  writeReport(report);
  console.error("React publish-ready check failed before running expensive gates:");
  for (const error of clearanceErrors) console.error(`  - ${error}`);
  console.error(
    "\nRun npm run check:react-publish-preflight for automated evidence while the human checkpoints remain open.",
  );
  console.error(`Clearance handoff: ${CLEARANCE_HANDOFF_PATH}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

const checkRows = [];
for (const check of automatedChecks) {
  const row = runCheck(check);
  checkRows.push(row);
  if (row.status === "failed") {
    const report = buildReport("failed", checkRows, tasks, clearanceErrors);
    writeReport(report);
    console.error(`\nReact publish preflight failed at ${check.name}.`);
    console.error(`Report: ${relativePath(OUT_JSON)}`);
    process.exit(row.exitCode ?? 1);
  }
}

if (clearanceErrors.length) {
  const report = buildReport("automated-passed-clearance-pending", checkRows, tasks, clearanceErrors);
  writeReport(report);
  console.log("\nAutomated React publish preflight passed.");
  console.log("Human publish clearance is still pending:");
  for (const error of clearanceErrors) console.log(`  - ${error}`);
  console.log(
    "Do not publish @digitaltableteur/react until these roadmap checkpoints are explicitly cleared.",
  );
  console.log(`Report: ${relativePath(OUT_JSON)}`);
} else {
  const report = buildReport("passed-clearance-recorded", checkRows, tasks, clearanceErrors);
  writeReport(report);
  console.log("\nReact publish preflight passed with recorded human clearance:");
  for (const id of ["1.5", "1.6", "5.1"]) {
    console.log(`  - ${taskStatusLine(id, tasks[id])}`);
  }
  console.log(`Report: ${relativePath(OUT_JSON)}`);
}
