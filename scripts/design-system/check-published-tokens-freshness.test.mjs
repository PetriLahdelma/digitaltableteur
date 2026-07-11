import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  diffDistDirs,
  normalizeForCompare,
} from "./check-published-tokens-freshness.mjs";

describe("normalizeForCompare", () => {
  it("ignores generatedAt in JSON files", () => {
    const a = normalizeForCompare(
      "tokens-manifest.json",
      JSON.stringify({ tokens: 184, generatedAt: "2026-07-08T08:06:41Z" }),
    );
    const b = normalizeForCompare(
      "tokens-manifest.json",
      JSON.stringify({ tokens: 184, generatedAt: "2026-07-10T23:25:38Z" }),
    );
    expect(a).toBe(b);
  });

  it("keeps real JSON differences", () => {
    const a = normalizeForCompare("t.json", JSON.stringify({ v: "#888" }));
    const b = normalizeForCompare("t.json", JSON.stringify({ v: "#949494" }));
    expect(a).not.toBe(b);
  });

  it("compares non-JSON files byte-for-byte", () => {
    expect(normalizeForCompare("tokens.css", "--link-color: #71efff;")).not.toBe(
      normalizeForCompare("tokens.css", "--link-color: var(--color-primary);"),
    );
  });
});

describe("diffDistDirs", () => {
  it("reports content drift, missing files, and timestamp-only equality", () => {
    const base = mkdtempSync(join(tmpdir(), "dt-freshness-test-"));
    try {
      const pub = join(base, "published");
      const loc = join(base, "local");
      mkdirSync(join(pub, "themes"), { recursive: true });
      mkdirSync(join(loc, "themes"), { recursive: true });

      // identical apart from generatedAt → no drift
      writeFileSync(
        join(pub, "manifest.json"),
        JSON.stringify({ n: 1, generatedAt: "a" }),
      );
      writeFileSync(
        join(loc, "manifest.json"),
        JSON.stringify({ n: 1, generatedAt: "b" }),
      );
      // real content drift
      writeFileSync(join(pub, "tokens.css"), "--color-muted: #888;");
      writeFileSync(join(loc, "tokens.css"), "--color-muted: #949494;");
      // file only in local build
      writeFileSync(join(loc, "themes", "new.css"), ":root {}");

      const drift = diffDistDirs(pub, loc);
      expect(drift).toContain("content differs: tokens.css");
      expect(drift).toContain("only in local build: themes/new.css");
      expect(drift).toHaveLength(2);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
