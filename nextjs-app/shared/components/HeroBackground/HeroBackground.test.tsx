import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("HeroBackground motion", () => {
  it("uses a finite default animation plan for full-motion visitors", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "HeroBackground.tsx"), "utf8");

    expect(source).toContain("iterations: 2");
    expect(source).toContain("motion.iterations - 1");
    expect(source).not.toMatch(/repeat:\s*-1/);
  });
});
