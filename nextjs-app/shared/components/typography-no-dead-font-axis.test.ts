import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guard against a *dead typographic axis* re-entering the design system.
 *
 * Background: the DS unified to a single typeface (Satoshi) in PR #780, which
 * aliased `--font-heading` to `--font-body`. But the `terminals: "serif" |
 * "sans"` prop on Text/Title/List survived — it kept swapping a `.serif`/`.sans`
 * CSS class, yet both classes resolved to the *same* computed font. It was a
 * visual no-op that the `audit:controls --effects` gate could not catch because
 * that gate diffs the canvas DOM (the class *did* change) rather than the
 * computed style (the rendered font did not). PR removing it also added this
 * static guard so the pattern cannot silently return.
 *
 * Two invariants, both zero-false-positive today:
 *  A. No component contract may declare a `terminals` prop or variant.
 *  B. No component CSS Module may define the literal serif/sans font-choice
 *     classes (`.serif` / `.sans` / `.fontSerif` / `.fontSans`) — a font-family
 *     "choice" is dead while the DS is a single typeface.
 */
const componentsDir = dirname(fileURLToPath(import.meta.url));

const componentDirs = readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("typography: no dead font-family axis", () => {
  it("no contract declares a `terminals` prop or variant", () => {
    const offenders: string[] = [];
    for (const name of componentDirs) {
      const contractPath = join(componentsDir, name, `${name}.contract.json`);
      if (!existsSync(contractPath)) continue;
      const contract = JSON.parse(readFileSync(contractPath, "utf8"));
      if (contract?.props?.terminals) offenders.push(`${name} (props.terminals)`);
      if (contract?.variants?.terminals)
        offenders.push(`${name} (variants.terminals)`);
    }
    expect(
      offenders,
      `\`terminals\` is a dead serif/sans no-op (one typeface since PR #780). ` +
        `Remove it from: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("no CSS Module defines a serif/sans font-choice class", () => {
    const deadClass = /\.(serif|sans|fontSerif|fontSans)\s*\{/;
    const offenders: string[] = [];
    for (const name of componentDirs) {
      const cssPath = join(componentsDir, name, `${name}.module.css`);
      if (!existsSync(cssPath)) continue;
      const css = readFileSync(cssPath, "utf8");
      const match = css.match(deadClass);
      if (match) offenders.push(`${name} (${match[1]})`);
    }
    expect(
      offenders,
      `A serif/sans font-family class is a dead distinction while the DS is a ` +
        `single typeface. Found in: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
