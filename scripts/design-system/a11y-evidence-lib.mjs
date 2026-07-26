/**
 * A11y evidence records — the test result, not a human, is the source of truth.
 *
 * The contract records accessibility as booleans (accessibilityTreeVerified,
 * realBrowserForcedColorsVerified, …). `derive-a11y-criteria.mjs` trusts those
 * booleans and stamps a criterion `automated` without ever reading a run. An
 * evidence record closes that gap: it ties a (story, mode) to a real browser
 * pass with provenance — `{ passed, sourceSHA, capturedAt }` — so "automated"
 * can mean "a browser proved this at commit X on date Y".
 *
 * Phase 1 PR 1 (emit) only WRITES and can READ + judge freshness. It is
 * deliberately NOT yet consumed by derive-a11y-criteria.mjs — that flip is PR 2
 * (the honest ratchet spike). See docs/AGENTIC_DS_PHASE1_PROVE_A11Y.md.
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export const EVIDENCE_DIRNAME = "__a11y-evidence__";

/** Mirrors STALE_DAYS in check-doc-semantics.mjs — the time-window fallback. */
export const STALE_DAYS = 180;

let cachedSha;

/**
 * The commit the evidence was captured at. Prefer the CI-provided SHA; fall
 * back to the working tree's HEAD; never throw (records still write with
 * "unknown", which `isEvidenceFresh` treats as never-fresh via the time gate).
 */
export function sourceSha() {
  if (cachedSha !== undefined) return cachedSha;
  const envSha = process.env.GITHUB_SHA || process.env.DT_SOURCE_SHA;
  if (envSha && envSha.trim()) {
    cachedSha = envSha.trim();
    return cachedSha;
  }
  try {
    cachedSha = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    cachedSha = "unknown";
  }
  return cachedSha;
}

export function evidenceDir(componentDir) {
  return path.join(componentDir, EVIDENCE_DIRNAME);
}

/** File name mirrors the AT-snapshot naming: `<storyId><suffix>.json`. */
export function evidenceFile(componentDir, storyId, suffix = "") {
  return path.join(evidenceDir(componentDir), `${storyId}${suffix}.json`);
}

/**
 * Write one record per (story, mode). A single record holds every check proven
 * in that run, so one browser pass writes one artifact rather than N.
 *
 * @param {string} componentDir absolute component directory
 * @param {string} storyId sanitized story id (matches the snapshot file stem)
 * @param {string} suffix mode suffix, e.g. "" | ".dark" | ".forced-colors"
 * @param {{ mode: string, runner?: string, checks: Record<string, { passed: boolean, [k: string]: unknown }>, capturedAt?: string }} data
 */
export function writeEvidenceRecord(componentDir, storyId, suffix, data) {
  const dir = evidenceDir(componentDir);
  fs.mkdirSync(dir, { recursive: true });
  const record = {
    storyId,
    mode: data.mode,
    sourceSHA: sourceSha(),
    capturedAt: data.capturedAt ?? new Date().toISOString(),
    runner: data.runner ?? null,
    checks: data.checks,
  };
  fs.writeFileSync(
    evidenceFile(componentDir, storyId, suffix),
    `${JSON.stringify(record, null, 2)}\n`,
  );
  return record;
}

/** Read every evidence record committed for a component (never throws). */
export function readEvidenceRecords(componentDir) {
  const dir = evidenceDir(componentDir);
  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const out = [];
  for (const f of files) {
    try {
      out.push(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    } catch {
      // A corrupt record is not evidence; skip it rather than fail the read.
    }
  }
  return out;
}

/**
 * Freshness (roadmap Track A, option 2 — SHA ancestry + path guard):
 * a record is fresh iff no file under the component directory changed after the
 * record's `sourceSHA`. If git can't answer (unknown SHA, shallow clone), fall
 * back to a `capturedAt` time window so a missing git history never silently
 * upgrades stale evidence to fresh.
 *
 * @param {string} componentDir absolute component directory
 * @param {{ sourceSHA?: string, capturedAt?: string }} record
 * @param {{ now?: number, staleDays?: number, gitChangedSince?: (sha: string, dir: string) => boolean | null }} [opts]
 * @returns {boolean}
 */
export function isEvidenceFresh(componentDir, record, opts = {}) {
  const staleDays = opts.staleDays ?? STALE_DAYS;
  const sha = record?.sourceSHA;

  if (sha && sha !== "unknown") {
    const changedSince = opts.gitChangedSince ?? defaultGitChangedSince;
    try {
      const changed = changedSince(sha, componentDir);
      if (changed === true) return false; // source moved after the evidence
      if (changed === false) return true; // evidence still reflects the source
      // null => git couldn't answer; fall through to the time window.
    } catch {
      // fall through to the time window
    }
  }

  const capturedAt = record?.capturedAt ? Date.parse(record.capturedAt) : NaN;
  if (Number.isNaN(capturedAt)) return false;
  const now = opts.now ?? Date.now();
  return now - capturedAt <= staleDays * 24 * 60 * 60 * 1000;
}

const gitGuardCache = new Map();

/**
 * @returns {boolean | null} true if a SOURCE file under `componentDir` changed
 * in `sha..HEAD`, false if none did, null if git couldn't answer (e.g. a
 * shallow CI clone where `sha` is unreachable — callers then use the time
 * window). The component's own `__a11y-evidence__` / `__a11y-snapshots__`
 * artifacts are excluded: committing the evidence must not invalidate it, and a
 * snapshot re-capture is not a source change.
 */
function defaultGitChangedSince(sha, componentDir) {
  const key = `${sha}::${componentDir}`;
  if (gitGuardCache.has(key)) return gitGuardCache.get(key);
  let result;
  try {
    const out = execFileSync(
      "git",
      [
        "log",
        "--oneline",
        `${sha}..HEAD`,
        "--",
        componentDir,
        `:(exclude)${componentDir}/${EVIDENCE_DIRNAME}`,
        `:(exclude)${componentDir}/__a11y-snapshots__`,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    result = out.trim().length > 0;
  } catch {
    result = null;
  }
  gitGuardCache.set(key, result);
  return result;
}

/**
 * Collapse a component's fresh evidence into a per-check tally, so a consumer
 * can decide `automated` vs `unverified` per accessibility criterion. One call
 * reads every record once and runs at most one git path-guard (memoized).
 *
 * @param {string} componentDir absolute component directory
 * @param {Parameters<typeof isEvidenceFresh>[2]} [opts]
 * @returns {Record<string, { pass: number, fail: number }>} keyed by check id
 */
export function evidenceCheckVerdicts(componentDir, opts = {}) {
  const verdicts = {};
  for (const record of readEvidenceRecords(componentDir)) {
    if (!isEvidenceFresh(componentDir, record, opts)) continue;
    for (const [checkId, res] of Object.entries(record?.checks ?? {})) {
      const tally = (verdicts[checkId] ??= { pass: 0, fail: 0 });
      if (res?.passed === true) tally.pass += 1;
      else if (res?.passed === false) tally.fail += 1;
    }
  }
  return verdicts;
}
