#!/usr/bin/env node
/**
 * Non-regression guard for the visual-maturity rubric.
 *
 * docs/design-system/visual-maturity-rubric.md is the human source of truth;
 * visual-maturity.state.json is the machine state. Scores are human-authored
 * design-lead judgments (0-5 per axis) — this gate does NOT measure taste, it
 * only stops DT's recorded scores from silently regressing between re-scorings.
 *
 * Enforced invariants:
 *   1. State shape is valid (axes list, every subject scores all axes, 0-5).
 *   2. DT's per-axis scores never drop below the recorded floor.
 *   3. DT's composite (mean of axes) never drops below the recorded floor.
 *
 * Usage:
 *   node scripts/design-system/check-visual-maturity.mjs           # CI gate
 *   node scripts/design-system/check-visual-maturity.mjs --report  # print panel
 *   node scripts/design-system/check-visual-maturity.mjs --update  # ratchet floor to DT's current scores
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(HERE, "visual-maturity.state.json");
const REPORT = process.argv.includes("--report");
const UPDATE = process.argv.includes("--update");

const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
const { axes, subjects, floor, target } = state;
const errors = [];

const composite = (scores) =>
  Math.round((axes.reduce((s, a) => s + scores[a], 0) / axes.length) * 100) /
  100;

// 1. shape validation
if (!Array.isArray(axes) || axes.length === 0) {
  errors.push("state.axes must be a non-empty array");
}
for (const [name, subj] of Object.entries(subjects ?? {})) {
  for (const a of axes) {
    const v = subj.scores?.[a];
    if (typeof v !== "number" || v < 0 || v > 5) {
      errors.push(`${name}.scores.${a} must be a number in [0,5] (got ${v})`);
    }
  }
}

const dt = subjects?.digitaltableteur;
if (!dt) errors.push("subjects.digitaltableteur is required (self=true)");

// 2 + 3. ratchet checks (only if shape is sound so far)
if (dt && errors.length === 0) {
  const dtComposite = composite(dt.scores);
  for (const a of axes) {
    const floorV = floor?.perAxis?.[a] ?? 0;
    if (dt.scores[a] < floorV) {
      errors.push(
        `regression: digitaltableteur.${a} = ${dt.scores[a]} < floor ${floorV}`,
      );
    }
  }
  if (dtComposite < (floor?.composite ?? 0)) {
    errors.push(
      `regression: digitaltableteur composite ${dtComposite} < floor ${floor?.composite}`,
    );
  }

  if (UPDATE) {
    state.floor = {
      composite: dtComposite,
      perAxis: Object.fromEntries(axes.map((a) => [a, dt.scores[a]])),
    };
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
    console.log(
      `✓ floor ratcheted to DT current: composite ${dtComposite}, per-axis updated.`,
    );
    process.exit(0);
  }

  if (REPORT) {
    const pad = (s, n) => String(s).padEnd(n);
    console.log(`Visual-maturity panel (target ${target}/5):\n`);
    console.log(pad("subject", 18) + axes.map((a) => a.slice(0, 4)).join("  ") + "   comp");
    for (const [name, subj] of Object.entries(subjects)) {
      const row = axes.map((a) => subj.scores[a].toFixed(1)).join("   ");
      console.log(pad(name, 18) + row + "   " + composite(subj.scores).toFixed(2));
    }
    console.log(`\nDT floor: composite ${floor.composite}`);
  }
}

if (errors.length) {
  console.error("✗ visual-maturity check failed:\n");
  errors.forEach((e) => console.error("  " + e));
  console.error(
    "\nTo intentionally raise DT's floor after a craft PR, re-score in " +
      "visual-maturity.state.json then run: npm run check:visual-maturity -- --update",
  );
  process.exit(1);
}

if (!REPORT && !UPDATE) {
  console.log(
    `✓ visual-maturity: DT composite ${composite(dt.scores)} ≥ floor ${floor.composite} (target ${target}).`,
  );
}
