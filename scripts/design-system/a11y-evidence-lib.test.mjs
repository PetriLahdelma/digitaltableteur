import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  EVIDENCE_DIRNAME,
  STALE_DAYS,
  cssDiffIsA11yRelevant,
  evidenceCheckVerdicts,
  evidenceFile,
  isA11yRelevantChange,
  isEvidenceFresh,
  readEvidenceRecords,
  writeEvidenceRecord,
} from "./a11y-evidence-lib.mjs";

const diff = (...addedLines) =>
  ["--- a/x.module.css", "+++ b/x.module.css", "@@ -1,2 +1,2 @@", ...addedLines].join("\n");

let tmp;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "a11y-evidence-"));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("writeEvidenceRecord / readEvidenceRecords", () => {
  it("round-trips a record with provenance under __a11y-evidence__", () => {
    const written = writeEvidenceRecord(tmp, "components-button--playground", "", {
      mode: "light",
      runner: "test:stories:matrix:ci",
      capturedAt: "2026-07-26T00:00:00.000Z",
      checks: { "axe-no-violations": { passed: true, axeViolations: 0 } },
    });

    expect(written.sourceSHA).toBeTruthy();
    const file = evidenceFile(tmp, "components-button--playground", "");
    expect(file).toContain(`${EVIDENCE_DIRNAME}${path.sep}components-button--playground.json`);
    expect(fs.existsSync(file)).toBe(true);

    const [record] = readEvidenceRecords(tmp);
    expect(record.storyId).toBe("components-button--playground");
    expect(record.mode).toBe("light");
    expect(record.checks["axe-no-violations"]).toEqual({ passed: true, axeViolations: 0 });
    expect(record.capturedAt).toBe("2026-07-26T00:00:00.000Z");
  });

  it("keeps one file per (story, mode) via the suffix", () => {
    writeEvidenceRecord(tmp, "x--y", "", { mode: "light", checks: {} });
    writeEvidenceRecord(tmp, "x--y", ".forced-colors", { mode: "forced-colors", checks: {} });
    expect(readEvidenceRecords(tmp)).toHaveLength(2);
  });

  it("returns [] for a component with no evidence dir", () => {
    expect(readEvidenceRecords(path.join(tmp, "nope"))).toEqual([]);
  });
});

describe("isEvidenceFresh — SHA path guard (option 2)", () => {
  it("is fresh when nothing under the component dir changed since the SHA", () => {
    const fresh = isEvidenceFresh(tmp, { sourceSHA: "abc123", capturedAt: "2000-01-01T00:00:00Z" }, {
      gitChangedSince: () => false,
    });
    expect(fresh).toBe(true); // git wins over the (stale) time window
  });

  it("is stale when a source file changed after the SHA", () => {
    const fresh = isEvidenceFresh(tmp, { sourceSHA: "abc123", capturedAt: new Date().toISOString() }, {
      gitChangedSince: () => true,
    });
    expect(fresh).toBe(false); // git wins over the (recent) time window
  });
});

describe("isEvidenceFresh — time-window fallback", () => {
  const now = Date.parse("2026-07-26T00:00:00Z");

  it("falls back to the window when git cannot answer (null)", () => {
    const recent = new Date(now - 10 * 86_400_000).toISOString();
    expect(
      isEvidenceFresh(tmp, { sourceSHA: "abc", capturedAt: recent }, { now, gitChangedSince: () => null }),
    ).toBe(true);
  });

  it("treats an unknown SHA as never-git-fresh, then applies the window", () => {
    const old = new Date(now - (STALE_DAYS + 1) * 86_400_000).toISOString();
    expect(isEvidenceFresh(tmp, { sourceSHA: "unknown", capturedAt: old }, { now })).toBe(false);

    const recent = new Date(now - 1 * 86_400_000).toISOString();
    expect(isEvidenceFresh(tmp, { sourceSHA: "unknown", capturedAt: recent }, { now })).toBe(true);
  });

  it("is not fresh without a parseable capturedAt", () => {
    expect(isEvidenceFresh(tmp, { sourceSHA: "unknown" }, { now })).toBe(false);
  });
});

describe("evidenceCheckVerdicts", () => {
  const fresh = { gitChangedSince: () => false }; // force git path-guard fresh

  it("tallies pass/fail per check across fresh records", () => {
    writeEvidenceRecord(tmp, "s--a", "", {
      mode: "light",
      capturedAt: "2026-07-26T00:00:00Z",
      checks: { "axe-no-violations": { passed: true }, "accessibility-tree": { passed: true } },
    });
    writeEvidenceRecord(tmp, "s--b", ".forced-colors", {
      mode: "forced-colors",
      capturedAt: "2026-07-26T00:00:00Z",
      checks: { "axe-no-violations": { passed: false }, "forced-colors-real-browser": { passed: false } },
    });

    const v = evidenceCheckVerdicts(tmp, fresh);
    expect(v["axe-no-violations"]).toEqual({ pass: 1, fail: 1 });
    expect(v["accessibility-tree"]).toEqual({ pass: 1, fail: 0 });
    expect(v["forced-colors-real-browser"]).toEqual({ pass: 0, fail: 1 });
  });

  it("ignores stale records", () => {
    writeEvidenceRecord(tmp, "s--old", "", {
      mode: "light",
      capturedAt: "2026-07-26T00:00:00Z",
      checks: { "axe-no-violations": { passed: true } },
    });
    // git says the source moved since this evidence -> stale -> excluded.
    const v = evidenceCheckVerdicts(tmp, { gitChangedSince: () => true });
    expect(v["axe-no-violations"]).toBeUndefined();
  });

  it("returns {} for a component with no evidence", () => {
    expect(evidenceCheckVerdicts(path.join(tmp, "none"), fresh)).toEqual({});
  });
});

describe("cssDiffIsA11yRelevant", () => {
  it("is NEUTRAL for geometry / type-size only diffs (the Kbd case)", () => {
    expect(cssDiffIsA11yRelevant(diff("+  border-radius: var(--radius-md);"))).toBe(false);
    expect(cssDiffIsA11yRelevant(diff("+  block-size: var(--space-layout-32);"))).toBe(false);
    expect(cssDiffIsA11yRelevant(diff("+  padding-inline: var(--space-internal-8);"))).toBe(false);
    expect(cssDiffIsA11yRelevant(diff("-  font-size: 0.85rem;", "+  font-size: 0.875rem;"))).toBe(false);
    expect(cssDiffIsA11yRelevant(diff("+  gap: var(--space-internal-4);", "+  transform: translateY(2px);"))).toBe(false);
  });

  it("is RELEVANT when contrast/color properties change", () => {
    expect(cssDiffIsA11yRelevant(diff("+  color: var(--color-text);"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff("-  background-color: #fff;", "+  background-color: #eee;"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff("+  border-color: var(--color-border);"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff("+  box-shadow: 0 0 0 2px blue;"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff("+  opacity: 0.4;"))).toBe(true);
  });

  it("is RELEVANT when tree / reading-order properties change", () => {
    expect(cssDiffIsA11yRelevant(diff("+  display: none;"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff("+  visibility: hidden;"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff("+  order: 2;"))).toBe(true);
    expect(cssDiffIsA11yRelevant(diff('+  content: "→";'))).toBe(true);
  });

  it("ignores +++/--- headers and unchanged context lines", () => {
    // headers mention the file, not a declaration; a context (space-prefixed)
    // color line that did not change must not count.
    expect(cssDiffIsA11yRelevant("+++ b/color.module.css\n--- a/color.module.css")).toBe(false);
    expect(cssDiffIsA11yRelevant("@@ -1 +1 @@\n   color: red;")).toBe(false);
  });
});

describe("isA11yRelevantChange", () => {
  const noCss = () => "";
  it("false when nothing changed", () => {
    expect(isA11yRelevantChange([], noCss)).toBe(false);
  });
  it("true for any non-CSS source file (tsx/ts/stories)", () => {
    expect(isA11yRelevantChange(["c/Kbd.tsx"], noCss)).toBe(true);
    expect(isA11yRelevantChange(["c/Kbd.stories.tsx"], noCss)).toBe(true);
  });
  it("delegates CSS-only changes to the diff classifier", () => {
    expect(isA11yRelevantChange(["c/Kbd.module.css"], () => diff("+  border-radius: 4px;"))).toBe(false);
    expect(isA11yRelevantChange(["c/Kbd.module.css"], () => diff("+  color: red;"))).toBe(true);
  });
  it("true if ANY changed file is relevant (mixed css)", () => {
    const getDiff = (f) => (f.includes("bad") ? diff("+  color: red;") : diff("+  padding: 4px;"));
    expect(isA11yRelevantChange(["c/ok.module.css", "c/bad.module.css"], getDiff)).toBe(true);
  });
});
