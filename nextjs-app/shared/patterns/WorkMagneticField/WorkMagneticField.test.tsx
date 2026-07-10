import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("WorkMagneticField", () => {
  it("keeps cards visible before GSAP progressively enhances them", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(join(here, "WorkMagneticField.module.css"), "utf8");

    expect(css).toMatch(/\.cardWrapper\s*{[^}]*opacity:\s*1/s);
    expect(css).not.toMatch(/\.cardWrapper\s*{[^}]*opacity:\s*0/s);
  });
});
