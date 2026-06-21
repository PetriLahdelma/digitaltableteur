import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Static guard against the "literal undefined class" bug.
 *
 * The Vitest CSS Modules layer fabricates a scoped name for ANY accessed key,
 * even one that has no matching rule (e.g. `styles.doesNotExist` resolves to a
 * truthy `_doesNotExist_xxxx` string). The real Next.js production build does
 * NOT: a missing key is `undefined`, so `` `${styles.missing} ${className}` ``
 * renders the literal string "undefined" into the DOM `class` attribute.
 *
 * That makes the bug invisible to ordinary render tests. This check instead
 * reads the source from disk and fails if a component references a
 * `styles.<name>` that is never declared as a `.<name>` rule in its colocated
 * CSS Module. Dynamic access (`styles[`grid${n}Col`]`) is intentionally not
 * analysed here.
 */
const PATTERNS = ["GridBlock", "ProcessBlock", "TeamBlock"];

describe("pattern CSS Module class references resolve", () => {
  for (const name of PATTERNS) {
    it(`${name}: every styles.x has a matching .x rule`, () => {
      const tsx = readFileSync(join(here, name, `${name}.tsx`), "utf8");
      const css = readFileSync(join(here, name, `${name}.module.css`), "utf8");

      const referenced = new Set<string>();
      for (const match of tsx.matchAll(/\bstyles\.([A-Za-z_$][\w$]*)/g)) {
        referenced.add(match[1]);
      }

      const missing = [...referenced].filter(
        // `.col` must not match `.column`; a CSS class name ends at a non
        // word / non hyphen character.
        (cls) => !new RegExp(`\\.${cls}(?![\\w-])`).test(css),
      );

      expect(
        missing,
        `${name}.tsx references CSS Module classes with no rule in ${name}.module.css`,
      ).toEqual([]);
    });
  }
});
