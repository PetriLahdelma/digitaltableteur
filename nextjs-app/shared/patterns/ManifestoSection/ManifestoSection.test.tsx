import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("ManifestoSection motion", () => {
  it("settles its default token emphasis instead of cycling indefinitely", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "ManifestoSection.tsx"), "utf8");

    expect(source).not.toContain("setInterval");
    expect(source).not.toMatch(/repeat:\s*-1/);
    expect(source).toContain("repeat: 1");
  });
});
