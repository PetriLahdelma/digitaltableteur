import { expect, test } from "vitest";

import {
  assembleCompatibilityManifest,
  summarizePreflight,
} from "./compatibility-manifest-lib.mjs";

const baseInput = {
  workspacePackages: {
    "@digitaltableteur/react": "0.1.22",
    "@digitaltableteur/cli": "0.5.0",
  },
  resolvedVersions: {
    react: "19.2.8",
    "react-dom": "19.2.8",
    "framer-motion": null,
  },
  declaredPeerRanges: {
    react: ">=19.0.0",
    "framer-motion": ">=12.0.0",
  },
  runtime: { node: "v22.22.3", platform: "darwin", arch: "arm64" },
  preflight: null,
};

test("peer coverage pairs each declared range with the single exercised version", () => {
  const manifest = assembleCompatibilityManifest(baseInput);
  const react = manifest.peerCoverage.find((p) => p.package === "react");
  expect(react.declaredRange).toBe(">=19.0.0");
  expect(react.exercisedVersion).toBe("19.2.8");
  expect(react.note).toMatch(/other versions inside the declared range are untested/);
});

test("an uninstalled declared peer is reported as exercising nothing", () => {
  const manifest = assembleCompatibilityManifest(baseInput);
  const fm = manifest.peerCoverage.find((p) => p.package === "framer-motion");
  expect(fm.exercisedVersion).toBeNull();
  expect(fm.note).toMatch(/NO version of it is exercised/);
});

test("scope statement makes absence mean untested, not incompatible", () => {
  const manifest = assembleCompatibilityManifest(baseInput);
  expect(manifest.scope).toMatch(/Absence from this manifest means untested/);
});

test("exercised versions and packages are sorted for deterministic reruns", () => {
  const manifest = assembleCompatibilityManifest(baseInput);
  expect(Object.keys(manifest.exercised)).toEqual(
    [...Object.keys(manifest.exercised)].sort(),
  );
  expect(Object.keys(manifest.packages)).toEqual(
    [...Object.keys(manifest.packages)].sort(),
  );
});

test("gates document what each gate proves", () => {
  const manifest = assembleCompatibilityManifest(baseInput);
  const names = manifest.gates.map((g) => g.gate);
  expect(names).toContain("typecheck");
  expect(names).toContain("build");
  for (const gate of manifest.gates) {
    expect(gate.exercises.length).toBeGreaterThan(0);
    expect(gate.proves).toBeTruthy();
  }
});

test("summarizePreflight reduces checks to name → passed and keeps status", () => {
  const summary = summarizePreflight({
    generatedAt: "2026-08-05T10:14:06.438Z",
    status: "passed-clearance-recorded",
    checks: [
      { name: "lint", status: "passed" },
      { name: "typecheck", status: "failed" },
    ],
  });
  expect(summary.generatedAt).toBe("2026-08-05T10:14:06.438Z");
  expect(summary.status).toBe("passed-clearance-recorded");
  expect(summary.checks).toEqual({ lint: true, typecheck: false });
  expect(summary.note).toMatch(/RECORDED preflight run/);
});

test("summarizePreflight rejects unusable reports", () => {
  expect(summarizePreflight(null)).toBeNull();
  expect(summarizePreflight({})).toBeNull();
  expect(summarizePreflight({ checks: [] })).toBeNull();
});
