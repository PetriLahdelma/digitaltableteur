#!/usr/bin/env node
/**
 * Dogfood ratchet: raw-HTML elements and Tailwind utility lines can only
 * decrease (docs/design-system/dogfooding-plan.md Phase 0).
 *
 *   npm run check:dogfood-ratchet             # compare against baseline
 *   npm run check:dogfood-ratchet -- --update # tighten/rewrite the baseline
 *
 * Counts are keyed PER FILE (not per line) so unrelated edits inside a file
 * never trip the gate — only adding another raw element or utility line does.
 * The committed baseline is the debt inventory; intentionally-raw sites
 * (honeypots, email-template HTML, markdown maps) simply live in it at their
 * current count and never need exemption bookkeeping.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE_PATH = join(ROOT, "scripts/design-system/dogfood-ratchet.baseline.json");
const update = process.argv.includes("--update");

const SCAN_ROOTS = ["app", "nextjs-app/shared/patterns", "nextjs-app/shared/components"];
// Not app runtime UI, or deliberately raw-by-design surfaces.
const SKIP_RE =
  /(?:\.(?:test|spec|stories)\.|__tests__|__mocks__|__a11y-snapshots__|\/app\/dev\/|TailwindTest|\.figma\.|\.mdx$)/;

// Raw JSX elements with a DS replacement (Button, Link/RouterLink, Image,
// Title, TextInput/TextArea/Select, Table, List).
const RAW_ELEMENT_RE = /<(?:button|a|img|h[1-4]|input|select|textarea|table|ul|ol)\b/g;

// A quoted string counts as Tailwind styling when >=2 of its tokens look like
// utility classes AND they are at least half the string. Line-level: any line
// containing such a string counts once.
//
// The trailing segment allows `-` so multi-hyphen utilities are recognised.
// It used to be [\w./%[\]#]+, which stops at the second hyphen, so
// `grid-cols-1`, `underline-offset-2` and `overflow-x-auto` were all invisible
// and their lines were undercounted (2 of 4 tokens in
// "grid grid-cols-1 md:grid-cols-2 gap-8").
export const UTILITY_TOKEN_RE =
  /^(?:(?:hover|focus|focus-visible|active|disabled|group-hover|group-focus|peer|motion-reduce|motion-safe|dark|sm|md|lg|xl|2xl|tablet|desktop|max-tablet|max-desktop):)*(?:-?(?:flex|grid|block|inline|inline-block|inline-flex|hidden|relative|absolute|fixed|sticky|static|items|justify|content|place|self|gap|space|divide|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|size|min-w|min-h|max-w|max-h|text|font|leading|tracking|list|bg|from|via|to|border|rounded|shadow|ring|outline|opacity|z|overflow|transition|duration|ease|delay|animate|scale|rotate|translate|skew|origin|cursor|select|resize|pointer-events|touch|whitespace|break|truncate|object|aspect|grow|shrink|basis|order|col|row|auto-cols|auto-rows|inset|top|bottom|left|right|start|end|underline|no-underline|line-through|uppercase|lowercase|capitalize|normal-case|italic|not-italic|antialiased|subpixel-antialiased|backdrop|blur|brightness|contrast|grayscale|invert|saturate|sepia|drop-shadow|mix-blend|fill|stroke|sr-only|not-sr-only|group|peer|container|prose)(?:-[-\w./%[\]#]+)?)$/;

// Half the tokens must look like utilities. A count alone misreads English:
// a sentence containing "to" and "peer" scored 2 and was filed as styling, so
// LLM system prompts and copy strings inflated the debt inventory. Real class
// strings sit near 100%; the threshold is low enough that a template literal
// interpolating `${className}` or `${styles.x}` still counts.
export const UTILITY_RATIO = 0.5;

export function isUtilityString(value) {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const hits = tokens.filter((token) => UTILITY_TOKEN_RE.test(token)).length;
  return hits >= 2 && hits / tokens.length >= UTILITY_RATIO;
}

function countFile(source) {
  let rawElements = 0;
  for (const _ of source.matchAll(RAW_ELEMENT_RE)) rawElements += 1;

  let utilityLines = 0;
  for (const line of source.split("\n")) {
    const strings = line.match(/"[^"]*"|'[^']*'|`[^`]*`/g) ?? [];
    if (strings.some((quoted) => isUtilityString(quoted.slice(1, -1)))) {
      utilityLines += 1;
    }
  }
  return { rawElements, utilityLines };
}

function* sourceFiles(root) {
  const absolute = join(ROOT, root);
  if (!existsSync(absolute)) return;
  const stack = [absolute];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!/\.(?:tsx|jsx)$/.test(full)) continue;
      const rel = relative(ROOT, full).replace(/\\/g, "/");
      if (SKIP_RE.test(rel) || SKIP_RE.test(`/${rel}`)) continue;
      yield { full, rel };
    }
  }
}

// Importing this module must not run the check: the detection helpers above
// are unit-tested, and the CLI path calls process.exit, which would abort the
// test runner on import.
const isCli =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  const current = {};
  for (const root of SCAN_ROOTS) {
    for (const { full, rel } of sourceFiles(root)) {
      const { rawElements, utilityLines } = countFile(readFileSync(full, "utf8"));
      if (rawElements > 0 || utilityLines > 0) {
        current[rel] = { rawElements, utilityLines };
      }
    }
  }

  const totals = Object.values(current).reduce(
    (sum, c) => ({
      rawElements: sum.rawElements + c.rawElements,
      utilityLines: sum.utilityLines + c.utilityLines,
    }),
    { rawElements: 0, utilityLines: 0 },
  );

  const sortedCurrent = Object.fromEntries(
    Object.keys(current)
      .sort()
      .map((key) => [key, current[key]]),
  );

  if (update || !existsSync(BASELINE_PATH)) {
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify({ note: "Per-file dogfood debt. Counts may only decrease; tighten with npm run check:dogfood-ratchet -- --update. See docs/design-system/dogfooding-plan.md.", files: sortedCurrent }, null, 2)}\n`,
    );
    console.log(
      `✓ dogfood ratchet baseline written: ${Object.keys(current).length} files, ${totals.rawElements} raw elements, ${totals.utilityLines} Tailwind utility lines`,
    );
    process.exit(0);
  }

  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")).files ?? {};
  const regressions = [];
  const improvements = [];

  for (const [file, counts] of Object.entries(current)) {
    const base = baseline[file];
    if (!base) {
      regressions.push(`${file}: NEW file with ${counts.rawElements} raw element(s), ${counts.utilityLines} utility line(s) — use DS components (npm run find-component)`);
      continue;
    }
    for (const key of ["rawElements", "utilityLines"]) {
      if (counts[key] > base[key]) {
        regressions.push(`${file}: ${key} ${base[key]} → ${counts[key]} (ratchet only goes down)`);
      } else if (counts[key] < base[key]) {
        improvements.push(`${file}: ${key} ${base[key]} → ${counts[key]}`);
      }
    }
  }
  for (const file of Object.keys(baseline)) {
    if (!current[file]) improvements.push(`${file}: cleared (was ${baseline[file].rawElements}/${baseline[file].utilityLines})`);
  }

  if (regressions.length) {
    console.error("✗ dogfood ratchet failed — raw HTML / Tailwind debt increased:");
    for (const line of regressions) console.error(`  - ${line}`);
    console.error("  Swap in DS components (npm run find-component -- \"your intent\") or, for a justified exception, tighten scope and discuss in the PR.");
    process.exit(1);
  }

  if (improvements.length) {
    console.error("✗ dogfood ratchet: debt DECREASED (good!) — lock it in:");
    for (const line of improvements.slice(0, 20)) console.error(`  - ${line}`);
    console.error("  Run: npm run check:dogfood-ratchet -- --update  and commit the baseline.");
    process.exit(1);
  }

  console.log(
    `✓ dogfood ratchet holds (${Object.keys(current).length} files, ${totals.rawElements} raw elements, ${totals.utilityLines} utility lines)`,
  );
}
