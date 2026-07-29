/**
 * Phantom-token detection primitives.
 *
 * A phantom token is a `var(--name)` referenced in CSS but defined nowhere
 * (no `:root`/theme block, no component-local declaration, no TSX style
 * object or `setProperty` call). Without a fallback, `var(--undefined)`
 * invalidates the whole declaration at computed-value time, so layout
 * silently renders with inherited/collapsed values instead of erroring.
 * See PR #721 (120 phantom tokens) and semantic-token-codemod.mjs, which
 * only renames a *curated* list of known phantoms — newly invented names
 * pass every other gate silently. This lib closes that hole.
 */

const TOKEN_NAME = "--[A-Za-z0-9_-]+";

/** Strip CSS block comments so commented-out code neither defines nor references tokens. */
export function stripCssComments(css) {
  return css.replaceAll(/\/\*[\s\S]*?\*\//g, (m) =>
    // Preserve line count for accurate line numbers.
    m.replaceAll(/[^\n]/g, " "),
  );
}

/**
 * Extract `var(--name)` references from CSS source.
 * Returns [{ token, line, hasFallback }].
 */
export function extractCssReferences(css) {
  const source = stripCssComments(css);
  const references = [];
  const pattern = new RegExp(`var\\(\\s*(${TOKEN_NAME})\\s*(,)?`, "g");
  const lineStarts = buildLineStarts(source);
  for (const match of source.matchAll(pattern)) {
    references.push({
      hasFallback: match[2] === ",",
      line: lineOf(lineStarts, match.index),
      token: match[1],
    });
  }
  return references;
}

/**
 * Extract custom-property *definitions* from CSS source: `--name: value`
 * declarations (any scope — :root, .themeDark, component-local, media
 * queries) and `@property --name` registrations.
 */
export function extractCssDefinitions(css) {
  const source = stripCssComments(css);
  const defined = new Set();
  for (const match of source.matchAll(
    new RegExp(`(?:^|[{;\\s])(${TOKEN_NAME})\\s*:`, "gm"),
  )) {
    defined.add(match[1]);
  }
  for (const match of source.matchAll(
    new RegExp(`@property\\s+(${TOKEN_NAME})`, "g"),
  )) {
    defined.add(match[1]);
  }
  return defined;
}

/**
 * Extract custom-property definitions from TS/TSX source:
 * - style-object keys:            `"--avatar-size": value` / `'--x': v` / [`--x`]: v
 * - imperative sets:              `el.style.setProperty("--x", v)`
 * - next/font variable configs:   `variable: "--font-heading"`
 */
export function extractTsxDefinitions(source) {
  const defined = new Set();
  const patterns = [
    new RegExp(`["'\`](${TOKEN_NAME})["'\`]\\]?\\s*:`, "g"),
    new RegExp(`setProperty\\(\\s*["'\`](${TOKEN_NAME})["'\`]`, "g"),
    new RegExp(`variable:\\s*["'](${TOKEN_NAME})["']`, "g"),
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) defined.add(match[1]);
  }
  return defined;
}

/**
 * Diff references against definitions.
 * Returns sorted phantom entries: { token, hard, uses: [{ file, line, hasFallback }] }.
 * `hard` = at least one use has no fallback (declaration invalidation, not just drift).
 */
export function findPhantomTokens(referencesByFile, definedTokens) {
  const byToken = new Map();
  for (const [file, references] of referencesByFile) {
    for (const { hasFallback, line, token } of references) {
      if (definedTokens.has(token)) continue;
      if (!byToken.has(token)) byToken.set(token, []);
      byToken.get(token).push({ file, hasFallback, line });
    }
  }
  return [...byToken.entries()]
    .map(([token, uses]) => ({
      hard: uses.some((use) => !use.hasFallback),
      token,
      uses: uses.sort(
        (a, b) => a.file.localeCompare(b.file) || a.line - b.line,
      ),
    }))
    .sort((a, b) => a.token.localeCompare(b.token));
}

function buildLineStarts(source) {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function lineOf(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (lineStarts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}
