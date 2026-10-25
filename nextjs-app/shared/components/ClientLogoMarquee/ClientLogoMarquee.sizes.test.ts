import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LOGO_DIR,
  SIZES_CSS,
  SPRITE_SVG,
  SPRITE_TS,
  computeInputHash,
  logoClassName,
  readLogoList,
} from "../../../../scripts/design-system/client-logo-metrics-lib.mjs";

const root = process.cwd();
const css = readFileSync(path.join(root, SIZES_CSS), "utf8");
const spriteUrl = readFileSync(path.join(root, SPRITE_TS), "utf8");
const sprite = readFileSync(path.join(root, SPRITE_SVG), "utf8");

describe("ClientLogoMarquee optical sizes", () => {
  it("is generated from the current logos (run npm run build:logo-sizes)", () => {
    expect(css).toContain(`input-hash: ${computeInputHash(root)}`);
    expect(sprite).toContain(`input-hash: ${computeInputHash(root)}`);
    expect(spriteUrl).toContain(`?v=${computeInputHash(root)}`);
  });

  it("inlines every listed logo as a symbol with a fixed aspect ratio", () => {
    for (const logo of readLogoList(root)) {
      const name = logoClassName(logo.file);
      expect(sprite).toContain(`<symbol id="client-logo-${name}"`);
      expect(css).toMatch(new RegExp(`\\.${name} \\{[^}]*--logo-ar: [\\d.]+ / [\\d.]+;`));
    }
  });

  it("derives the phone duration from the lane width", () => {
    expect(css).toMatch(/--client-logo-marquee-duration-mobile: [\d.]+s;/);
  });

  it("sizes every listed logo, and every listed logo exists", () => {
    for (const logo of readLogoList(root)) {
      expect(existsSync(path.join(root, LOGO_DIR, logo.file))).toBe(true);
      expect(css).toMatch(new RegExp(`\\.${logoClassName(logo.file)} \\{\\n  --logo-h: [\\d.]+rem;`));
    }
  });
});
