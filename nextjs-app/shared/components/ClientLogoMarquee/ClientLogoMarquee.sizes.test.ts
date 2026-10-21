import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LOGO_DIR,
  SIZES_CSS,
  computeInputHash,
  logoClassName,
  readLogoList,
} from "../../../../scripts/design-system/client-logo-metrics-lib.mjs";

const root = process.cwd();
const css = readFileSync(path.join(root, SIZES_CSS), "utf8");

describe("ClientLogoMarquee optical sizes", () => {
  it("is generated from the current logos (run npm run build:logo-sizes)", () => {
    expect(css).toContain(`input-hash: ${computeInputHash(root)}`);
  });

  it("sizes every listed logo, and every listed logo exists", () => {
    for (const logo of readLogoList(root)) {
      expect(existsSync(path.join(root, LOGO_DIR, logo.file))).toBe(true);
      expect(css).toMatch(new RegExp(`\\.${logoClassName(logo.file)} \\{\\n  --logo-h: [\\d.]+rem;`));
    }
  });
});
