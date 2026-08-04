import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { DtCliError, ERROR_CODES } from "./errors.mjs";
import { loadUsage } from "./data.mjs";

const execFileAsync = promisify(execFile);

const CONTRACT_ROOTS = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
];

const SEMVER_ORDER = { none: 0, patch: 1, minor: 2, major: 3 };

async function git(repoRoot, args) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repoRoot,
    maxBuffer: 32 * 1024 * 1024,
  });
  return stdout;
}

async function repoRootFor(cwd) {
  try {
    return (await git(cwd, ["rev-parse", "--show-toplevel"])).trim();
  } catch {
    throw new DtCliError(
      "dt diff compares contract versions across git history and needs to run inside the design-system repository.",
      ERROR_CODES.GIT_CONTEXT_UNAVAILABLE,
    );
  }
}

function isContractPath(path) {
  return (
    CONTRACT_ROOTS.some((root) => path.startsWith(`${root}/`)) &&
    path.endsWith(".contract.json")
  );
}

async function contractPathsAt(repoRoot, ref) {
  if (ref === "worktree") {
    const paths = [];
    for (const root of CONTRACT_ROOTS) {
      const listed = await git(repoRoot, [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
        root,
      ]);
      paths.push(...listed.split("\n").filter(isContractPath));
    }
    return paths;
  }
  const listed = await git(repoRoot, ["ls-tree", "-r", "--name-only", ref]);
  return listed.split("\n").filter(isContractPath);
}

async function contractAt(repoRoot, ref, path) {
  try {
    const raw =
      ref === "worktree"
        ? await readFile(join(repoRoot, path), "utf8")
        : await git(repoRoot, ["show", `${ref}:${path}`]);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function componentNameFromPath(path) {
  return path.split("/").at(-1).replace(".contract.json", "");
}

function asSet(value) {
  return new Set(Array.isArray(value) ? value.map(String) : []);
}

function setDelta(before, after) {
  const beforeSet = asSet(before);
  const afterSet = asSet(after);
  return {
    added: [...afterSet].filter((item) => !beforeSet.has(item)),
    removed: [...beforeSet].filter((item) => !afterSet.has(item)),
  };
}

function propFiniteValues(schema) {
  if (Array.isArray(schema?.values)) return schema.values.map(String);
  const type = typeof schema?.type === "string" ? schema.type : "";
  // Union types follow the Title precedent: `"a" | "b"` or `1 | 2 | 3`.
  if (type.includes("|")) {
    return type.split("|").map((part) => part.trim().replace(/"/g, ""));
  }
  return null;
}

/**
 * Pure classifier: everything semver-relevant between two versions of one
 * contract, each change carrying its own severity and reason so `dt upgrade`
 * can later couple codemods to specific entries.
 */
export function classifyContractDiff(name, before, after) {
  const changes = [];
  const change = (severity, kind, detail, extra = {}) =>
    changes.push({ severity, kind, detail, ...extra });

  if (!before && !after) return { name, changes, semver: "none" };
  if (!before) {
    change("minor", "component-added", `${name} is new.`, {
      status: after.status,
    });
  } else if (!after) {
    change("major", "component-removed", `${name} was removed.`);
  } else {
    // Status transitions.
    if (before.status !== after.status) {
      const order = ["deprecated", "alpha", "beta", "stable"];
      const regressed =
        order.indexOf(String(after.status)) <
        order.indexOf(String(before.status));
      change(
        regressed ? "major" : "patch",
        "status-changed",
        `status ${before.status} -> ${after.status}`,
      );
    }

    // Props.
    const beforeProps = before.props ?? {};
    const afterProps = after.props ?? {};
    for (const prop of Object.keys(afterProps)) {
      if (!(prop in beforeProps)) {
        const required = afterProps[prop]?.optional === false;
        change(
          required ? "major" : "minor",
          "prop-added",
          `prop \`${prop}\` added${required ? " as required" : ""}.`,
          { prop },
        );
      }
    }
    for (const prop of Object.keys(beforeProps)) {
      if (!(prop in afterProps)) {
        change("major", "prop-removed", `prop \`${prop}\` removed.`, { prop });
        continue;
      }
      const beforeSchema = beforeProps[prop];
      const afterSchema = afterProps[prop];
      if (beforeSchema?.optional !== false && afterSchema?.optional === false) {
        change(
          "major",
          "prop-now-required",
          `prop \`${prop}\` became required.`,
          { prop },
        );
      } else if (
        beforeSchema?.optional === false &&
        afterSchema?.optional !== false
      ) {
        change(
          "minor",
          "prop-now-optional",
          `prop \`${prop}\` became optional.`,
          { prop },
        );
      }
      const beforeValues = propFiniteValues(beforeSchema);
      const afterValues = propFiniteValues(afterSchema);
      if (beforeValues || afterValues) {
        const { added, removed } = setDelta(beforeValues, afterValues);
        if (removed.length) {
          change(
            "major",
            "prop-values-removed",
            `prop \`${prop}\` lost value(s): ${removed.join(", ")}.`,
            { prop, values: removed },
          );
        }
        if (added.length) {
          change(
            "minor",
            "prop-values-added",
            `prop \`${prop}\` gained value(s): ${added.join(", ")}.`,
            { prop, values: added },
          );
        }
      } else if (
        typeof beforeSchema?.type === "string" &&
        typeof afterSchema?.type === "string" &&
        beforeSchema.type !== afterSchema.type
      ) {
        change(
          "major",
          "prop-type-changed",
          `prop \`${prop}\` type changed: ${beforeSchema.type} -> ${afterSchema.type}.`,
          { prop, from: beforeSchema.type, to: afterSchema.type },
        );
      }
      if (
        beforeSchema?.default !== undefined &&
        afterSchema?.default !== undefined &&
        JSON.stringify(beforeSchema.default) !==
          JSON.stringify(afterSchema.default)
      ) {
        change(
          "minor",
          "prop-default-changed",
          `prop \`${prop}\` default changed: ${JSON.stringify(beforeSchema.default)} -> ${JSON.stringify(afterSchema.default)} (behavioral).`,
          { prop },
        );
      }
    }

    // Accessibility requirements: removals break assistive expectations.
    for (const field of ["keyboard", "ariaRequirements"]) {
      const { added, removed } = setDelta(
        before.a11y?.[field],
        after.a11y?.[field],
      );
      if (removed.length) {
        change(
          "major",
          `a11y-${field}-removed`,
          `a11y ${field} removed: ${removed.join(", ")}.`,
          { values: removed },
        );
      }
      if (added.length) {
        change(
          "minor",
          `a11y-${field}-added`,
          `a11y ${field} added: ${added.join(", ")}.`,
          { values: added },
        );
      }
    }

    // Composition relationships.
    for (const field of ["composesWith", "prefersOver", "forbiddenUse"]) {
      const { added, removed } = setDelta(before[field], after[field]);
      if (added.length || removed.length) {
        change(
          field === "forbiddenUse" && added.length ? "minor" : "patch",
          `${field}-changed`,
          [
            added.length ? `${field} added: ${added.join("; ")}` : null,
            removed.length ? `${field} removed: ${removed.join("; ")}` : null,
          ]
            .filter(Boolean)
            .join(" | "),
        );
      }
    }

    // Slots.
    const slotDelta = setDelta(before.slots, after.slots);
    if (slotDelta.removed.length) {
      change(
        "major",
        "slots-removed",
        `slot(s) removed: ${slotDelta.removed.join(", ")}.`,
      );
    }
    if (slotDelta.added.length) {
      change(
        "minor",
        "slots-added",
        `slot(s) added: ${slotDelta.added.join(", ")}.`,
      );
    }
  }

  const semver = changes.reduce(
    (level, entry) =>
      SEMVER_ORDER[entry.severity] > SEMVER_ORDER[level]
        ? entry.severity
        : level,
    "none",
  );
  return { name, changes, semver };
}

/**
 * Compare component contracts between two git refs (or the working tree) and
 * report classified changes, a semver recommendation, and the consumer files
 * the import graph says are affected.
 */
export async function diff(componentName, options = {}) {
  const from = options.from ?? "HEAD";
  const to = options.to ?? "worktree";
  const repoRoot = await repoRootFor(options.cwd ?? process.cwd());

  const [fromPaths, toPaths] = await Promise.all([
    contractPathsAt(repoRoot, from),
    contractPathsAt(repoRoot, to),
  ]);
  let paths = [...new Set([...fromPaths, ...toPaths])];
  if (componentName) {
    const needle = componentName.toLocaleLowerCase();
    paths = paths.filter(
      (path) => componentNameFromPath(path).toLocaleLowerCase() === needle,
    );
    if (paths.length === 0) {
      throw new DtCliError(
        `No contract named "${componentName}" exists at ${from} or ${to}.`,
        ERROR_CODES.UNKNOWN_COMPONENT,
      );
    }
  }

  const reports = [];
  const sorted = paths.sort();
  const CONCURRENCY = 16;
  for (let start = 0; start < sorted.length; start += CONCURRENCY) {
    const chunk = sorted.slice(start, start + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (path) => {
        const name = componentNameFromPath(path);
        const [before, after] = await Promise.all([
          contractAt(repoRoot, from, path),
          contractAt(repoRoot, to, path),
        ]);
        return { path, ...classifyContractDiff(name, before, after) };
      }),
    );
    reports.push(...results.filter((report) => report.changes.length > 0));
  }

  const usage = await loadUsage({ cwd: repoRoot }).catch(() => null);
  const affectedFiles = new Set();
  if (usage) {
    for (const report of reports) {
      for (const importer of usage.get(report.name)?.directImporters ?? []) {
        affectedFiles.add(importer);
      }
    }
  }

  const semver = reports.reduce(
    (level, report) =>
      SEMVER_ORDER[report.semver] > SEMVER_ORDER[level] ? report.semver : level,
    "none",
  );

  return {
    type: "diff.report",
    data: {
      from,
      to,
      componentCount: reports.length,
      semverRecommendation: semver,
      components: reports,
      affectedConsumerFiles: usage ? [...affectedFiles].sort() : null,
      ...(usage
        ? {}
        : {
            note: "component-usage.json unavailable; run npm run report:component-usage for affected-consumer analysis.",
          }),
    },
  };
}
