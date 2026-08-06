import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

import {
  runtimeStampFor,
  withoutRuntimeFields,
} from "./evidence-stamp-lib.mjs";

const cleanProvenance = {
  sourceCommit: "abc123",
  workingTreeClean: true,
  dirtyPathCount: 0,
  generator: { name: "test", version: 1, node: "v22.0.0" },
};

function writeArtifact(report) {
  const dir = mkdtempSync(join(tmpdir(), "evidence-stamp-"));
  const path = join(dir, "artifact.json");
  writeFileSync(path, JSON.stringify(report));
  return path;
}

test("withoutRuntimeFields strips stamp fields plus artifact-specific extras", () => {
  const stripped = withoutRuntimeFields(
    { generatedAt: "x", provenance: {}, ok: true, data: 1 },
    ["ok"],
  );
  expect(stripped).toEqual({ data: 1 });
});

test("identical substance preserves the previous clean-tree stamp", () => {
  const path = writeArtifact({
    generatedAt: "2026-08-01T00:00:00.000Z",
    provenance: cleanProvenance,
    data: { a: 1 },
  });
  const stamp = runtimeStampFor(path, { data: { a: 1 } }, {
    ...cleanProvenance,
    sourceCommit: "def456",
  });
  expect(stamp.generatedAt).toBe("2026-08-01T00:00:00.000Z");
  expect(stamp.provenance.sourceCommit).toBe("abc123");
});

test("changed substance re-stamps", () => {
  const path = writeArtifact({
    generatedAt: "2026-08-01T00:00:00.000Z",
    provenance: cleanProvenance,
    data: { a: 1 },
  });
  const next = { ...cleanProvenance, sourceCommit: "def456" };
  const stamp = runtimeStampFor(path, { data: { a: 2 } }, next);
  expect(stamp.generatedAt).not.toBe("2026-08-01T00:00:00.000Z");
  expect(stamp.provenance).toBe(next);
});

test("a dirty-tree prior stamp is provisional and gets replaced", () => {
  const path = writeArtifact({
    generatedAt: "2026-08-01T00:00:00.000Z",
    provenance: { ...cleanProvenance, workingTreeClean: false },
    data: { a: 1 },
  });
  const next = { ...cleanProvenance, sourceCommit: "def456" };
  const stamp = runtimeStampFor(path, { data: { a: 1 } }, next);
  expect(stamp.provenance).toBe(next);
});

test("a missing prior artifact stamps fresh", () => {
  const stamp = runtimeStampFor(
    join(tmpdir(), "does-not-exist.json"),
    { data: 1 },
    cleanProvenance,
  );
  expect(stamp.provenance).toBe(cleanProvenance);
  expect(stamp.generatedAt).toBeTruthy();
});
