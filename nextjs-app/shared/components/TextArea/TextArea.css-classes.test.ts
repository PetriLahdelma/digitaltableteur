import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Static guard against the "literal undefined class" bug (see
 * nextjs-app/shared/patterns/css-module-class-references.test.ts and
 * FormField/FormField.css-classes.test.ts for the full rationale). Vitest's
 * CSS Modules proxy fabricates a truthy class for ANY accessed `styles.x` (or
 * `styles["x"]`) key, even one with no matching rule, so a missing class is
 * invisible to ordinary render tests. This reads TextArea's source and CSS
 * Module from disk and fails if a referenced class has no matching rule.
 *
 * Covers both dot notation (`styles.foo`) and bracket notation with a
 * literal string key (`styles["foo"]` / `styles['foo']`). Bracket access
 * with a template-literal key has no single static class name to check and
 * is intentionally left alone here.
 */
describe("TextArea CSS Module class references resolve", () => {
  it("every styles.x / styles['x'] has a matching .x rule", () => {
    const tsx = readFileSync(join(here, "TextArea.tsx"), "utf8");
    const css = readFileSync(join(here, "TextArea.module.css"), "utf8");

    const referenced = new Set<string>();
    for (const match of tsx.matchAll(/\bstyles\.([A-Za-z_$][\w$]*)/g)) {
      referenced.add(match[1]);
    }
    for (const match of tsx.matchAll(/\bstyles\[["']([^"'`]+)["']\]/g)) {
      referenced.add(match[1]);
    }

    const missing = [...referenced].filter(
      // `.col` must not match `.column`; a CSS class name ends at a non
      // word / non hyphen character.
      (cls) => !new RegExp(`\\.${cls}(?![\\w-])`).test(css),
    );

    expect(
      missing,
      "TextArea.tsx references CSS Module classes with no rule in TextArea.module.css",
    ).toEqual([]);
  });
});
