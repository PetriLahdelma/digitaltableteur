import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  EVIDENCE_DIRNAME,
  STALE_DAYS,
  evidenceFile,
  isEvidenceFresh,
  readEvidenceRecords,
  writeEvidenceRecord,
} from "./a11y-evidence-lib.mjs";

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
