import { describe, expect, it } from "vitest";
import {
  extractCssDefinitions,
  extractCssReferences,
  extractTsxDefinitions,
  findPhantomTokens,
  stripCssComments,
} from "./phantom-tokens-lib.mjs";

describe("phantom-tokens-lib", () => {
  it("extracts var() references with fallback detection and line numbers", () => {
    const css = `.a {\n  color: var(--color-text);\n  gap: var( --space-4 , 1rem);\n}`;
    expect(extractCssReferences(css)).toEqual([
      { hasFallback: false, line: 2, token: "--color-text" },
      { hasFallback: true, line: 3, token: "--space-4" },
    ]);
  });

  it("finds nested fallback references", () => {
    const references = extractCssReferences(
      ".a { color: var(--phantom, var(--real, #fff)); }",
    );
    expect(references.map((r) => r.token)).toEqual(["--phantom", "--real"]);
    expect(references.every((r) => r.hasFallback)).toBe(true);
  });

  it("collects definitions from any scope plus @property", () => {
    const css = `:root { --a: 1px; }\n.themeDark { --b: 2px }\n@media (min-width: 60rem) { .card { --c: 3px; } }\n@property --d { syntax: "<length>"; }`;
    expect([...extractCssDefinitions(css)].sort()).toEqual([
      "--a",
      "--b",
      "--c",
      "--d",
    ]);
  });

  it("ignores commented-out code without shifting line numbers", () => {
    const css = `/* --dead: 1px; var(--dead-ref) */\n.a { color: var(--live); }`;
    expect(extractCssDefinitions(css).size).toBe(0);
    expect(extractCssReferences(css)).toEqual([
      { hasFallback: false, line: 2, token: "--live" },
    ]);
    expect(stripCssComments(css).split("\n")).toHaveLength(2);
  });

  it("does not mistake var() usage inside CSS for a definition", () => {
    expect(
      extractCssDefinitions(".a { color: var(--only-referenced); }").size,
    ).toBe(0);
  });

  it("collects TSX definitions from style objects, setProperty, and next/font", () => {
    const tsx = [
      `<div style={{ "--avatar-size": size } as React.CSSProperties} />`,
      `element.style.setProperty("--tab-ind-x", x);`,
      `const heading = localFont({ variable: "--font-heading" });`,
      `const key = [\`--computed-key\`]: value;`,
    ].join("\n");
    expect([...extractTsxDefinitions(tsx)].sort()).toEqual([
      "--avatar-size",
      "--computed-key",
      "--font-heading",
      "--tab-ind-x",
    ]);
  });

  it("diffs references against definitions and flags hard phantoms", () => {
    const referencesByFile = new Map([
      [
        "a.module.css",
        [
          { hasFallback: false, line: 3, token: "--phantom-hard" },
          { hasFallback: true, line: 9, token: "--phantom-hook" },
          { hasFallback: false, line: 4, token: "--defined" },
        ],
      ],
    ]);
    const phantoms = findPhantomTokens(referencesByFile, new Set(["--defined"]));
    expect(phantoms).toEqual([
      {
        hard: true,
        token: "--phantom-hard",
        uses: [{ file: "a.module.css", hasFallback: false, line: 3 }],
      },
      {
        hard: false,
        token: "--phantom-hook",
        uses: [{ file: "a.module.css", hasFallback: true, line: 9 }],
      },
    ]);
  });
});
