/**
 * Shared provenance + substance-stable stamping for committed evidence
 * artifacts (Astryx-gap Phase 4).
 *
 * Mirrors the convention established by audit-agent-experience.mjs:
 * generatedAt/provenance describe the generation that last CHANGED the
 * artifact's substance. A rerun that produces identical substance preserves
 * the previous stamp so the committed artifact stays byte-stable, and a
 * dirty-tree stamp is provisional (re-stamped until a clean-tree run records
 * durable provenance).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

export function currentProvenance(root, generator, extra = {}) {
  const git = (args) =>
    execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  let sourceCommit = null;
  let dirtyPaths = null;
  try {
    sourceCommit = git(["rev-parse", "HEAD"]);
    dirtyPaths = git(["status", "--porcelain", "--untracked-files=no"])
      .split("\n")
      .filter(Boolean).length;
  } catch {
    // Outside a git checkout the stamp degrades gracefully.
  }
  return {
    sourceCommit,
    workingTreeClean: dirtyPaths === 0,
    dirtyPathCount: dirtyPaths,
    generator: { ...generator, node: process.version },
    ...extra,
  };
}

/**
 * Strip the runtime fields that must not participate in the substance
 * comparison. Additional artifact-specific runtime fields can be listed via
 * extraRuntimeFields.
 */
export function withoutRuntimeFields(report, extraRuntimeFields = []) {
  const rest = { ...report };
  for (const field of ["generatedAt", "provenance", ...extraRuntimeFields]) {
    delete rest[field];
  }
  return rest;
}

export function runtimeStampFor(
  outPath,
  nextReport,
  provenance,
  extraRuntimeFields = [],
) {
  if (existsSync(outPath)) {
    try {
      const previous = JSON.parse(readFileSync(outPath, "utf8"));
      if (
        previous.generatedAt &&
        previous.provenance?.workingTreeClean === true &&
        JSON.stringify(withoutRuntimeFields(previous, extraRuntimeFields)) ===
          JSON.stringify(withoutRuntimeFields(nextReport, extraRuntimeFields))
      ) {
        return {
          generatedAt: previous.generatedAt,
          provenance: previous.provenance,
        };
      }
    } catch {
      // A malformed prior report should be replaced, not preserved.
    }
  }
  return { generatedAt: new Date().toISOString(), provenance };
}
