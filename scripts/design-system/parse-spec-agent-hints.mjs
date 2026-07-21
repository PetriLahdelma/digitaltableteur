/**
 * Extract agent-facing use/avoid hints from component spec.md Do/Don't sections.
 */

const TODO_RE = /^TODO\b/i;
const VAGUE_RE = /^(inherit|standard|see |n\/a|tbd)/i;
const MIN_LINE_LEN = 14;
const MAX_HINT_LEN = 220;

/**
 * @param {string} line
 * @returns {string | null}
 */
export function sanitizeAgentProseLine(line) {
  let s = line.trim();
  if (!s || TODO_RE.test(s)) return null;
  s = s.replace(/^[-*•]\s*/, "").replace(/\s+/g, " ");
  if (s.length < MIN_LINE_LEN) return null;
  if (VAGUE_RE.test(s)) return null;
  if (s.length > MAX_HINT_LEN) s = `${s.slice(0, MAX_HINT_LEN - 1)}…`;
  return s;
}

/**
 * @param {string | null | undefined} specText
 * @returns {{ useWhen: string[], avoidWhen: string[] }}
 */
/**
 * Join wrapped bullet continuations into one logical line.
 *
 * spec.md bullets wrap at the prose margin:
 *
 *   - Do: compose destructive actions as `variant` + `tone="error"` rather than a
 *     bespoke variant.
 *
 * Reading line-by-line truncates that to "...rather than a", which is what shipped to
 * agents before this function existed. A continuation is any non-empty line that does
 * not itself start a new bullet or heading.
 *
 * @param {string} sectionText
 * @returns {string[]} One entry per logical bullet.
 */
export function unwrapBullets(sectionText) {
  const out = [];
  for (const raw of sectionText.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue;
    if (/^[-*•]\s/.test(line)) {
      out.push(line);
    } else if (out.length) {
      // Continuation of the bullet above.
      out[out.length - 1] = `${out[out.length - 1]} ${line}`;
    }
  }
  return out;
}

export function parseSpecAgentHints(specText) {
  const useWhen = [];
  const avoidWhen = [];
  if (!specText) return { useWhen, avoidWhen };

  const section = specText.match(/## Do \/ don't([\s\S]*?)(?=^## |\Z)/m);
  if (!section) return { useWhen, avoidWhen };

  for (const trimmed of unwrapBullets(section[1])) {
    let raw = null;
    if (trimmed.startsWith("- Do:")) {
      raw = trimmed.slice(5).trim();
    } else if (trimmed.startsWith("- Don't:")) {
      raw = trimmed.slice(8).trim();
    } else if (trimmed.startsWith("- Do ")) {
      raw = trimmed.slice(4).trim();
    } else if (trimmed.startsWith("- Don't ")) {
      raw = trimmed.slice(7).trim();
    }
    if (!raw) continue;
    const clean = sanitizeAgentProseLine(raw);
    if (!clean) continue;
    if (trimmed.includes("Don't")) {
      avoidWhen.push(clean);
    } else {
      useWhen.push(clean);
    }
  }

  return {
    useWhen: [...new Set(useWhen)].slice(0, 6),
    avoidWhen: [...new Set(avoidWhen)].slice(0, 6),
  };
}

/** RFC 2119 levels, ordered strongest-first. */
export const GUIDELINE_LEVELS = ["must", "must-not", "should", "should-not", "may"];

/** Levels a "Do:" line may carry; a "Don't:" line takes the negative forms. */
const POSITIVE_LEVELS = new Set(["must", "should", "may"]);
const NEGATIVE_LEVELS = new Set(["must-not", "should-not"]);

/**
 * Split a guidance line into its rule and its reason.
 *
 * Authors write the reason after an em-dash-free separator (" because ", " so that ",
 * or " -- "). A rule without a reason is still valid; DSDS only requires rationale on
 * `must`/`must-not`, and check:doc-semantics reports the gap rather than failing.
 *
 * @param {string} text
 * @returns {{ guidance: string, rationale: string | null }}
 */
function splitRationale(text) {
  // 1. An explicit marker clause, when the author wrote one.
  const marked = text.match(/^(.*?)(?:\s+--\s+|\s+because\s+|\s+so that\s+)(.+)$/i);
  if (marked) {
    const guidance = marked[1].trim().replace(/[,;:]$/, "");
    const rationale = marked[2].trim();
    if (guidance.length >= MIN_LINE_LEN && rationale.length >= MIN_LINE_LEN) {
      return { guidance, rationale, rationaleSource: "explicit" };
    }
  }

  // 2. Fallback: this corpus overwhelmingly states the rule in sentence one and the
  //    reason in the sentences after it ("Buttons are terminal.", "AT focus order
  //    becomes ambiguous."). Treat the tail as rationale when the split is clean.
  //    Guarded against abbreviations and code spans so "e.g." or "`type=\"submit\"`."
  //    does not split a sentence in half.
  const sentence = text.match(/^(.*?[a-z0-9)`*_\]"']\.)\s+([A-Z].*)$/s);
  if (sentence) {
    const guidance = sentence[1].trim().replace(/\.$/, "");
    const rationale = sentence[2].trim();
    const endsInAbbrev = /\b(e\.g|i\.e|etc|vs|cf|no)\.$/i.test(sentence[1].trim());
    const balancedTicks = (guidance.match(/`/g) ?? []).length % 2 === 0;
    if (
      !endsInAbbrev &&
      balancedTicks &&
      guidance.length >= MIN_LINE_LEN &&
      rationale.length >= MIN_LINE_LEN
    ) {
      // Inferred, not asserted. Sampling puts precision around 80%: the tail sentence is
      // usually the reason, but sometimes it is the remedy ("Use Checkbox there"). Marked
      // so a consumer can weight it, and so the gate can count explicit rationale apart
      // from guessed rationale.
      return { guidance, rationale, rationaleSource: "inferred" };
    }
  }

  return { guidance: text.trim(), rationale: null, rationaleSource: null };
}

/**
 * Parse the spec.md "Do / don't" section into RFC 2119 guidelines.
 *
 * Accepted forms, all backward compatible with the flat `- Do:` / `- Don't:` lines
 * that predate this parser:
 *
 *   - Do: use X for Y                      -> level "should"     (default)
 *   - Don't: nest X inside Y               -> level "should-not"  (default)
 *   - Do (must): label every input         -> level "must"        (explicit)
 *   - Don't (must): nest interactive nodes -> level "must-not"    (explicit, negated)
 *   - Don't (must): nest X because AT announces it twice
 *                                          -> rationale captured
 *
 * An explicit level on a "Don't" line is negated automatically, so an author writes
 * `(must)` and gets `must-not`. Writing `(must-not)` on a Don't line also works.
 *
 * @param {string | null | undefined} specText
 * @returns {Array<{level: string, guidance: string, rationale: string | null, source: string}>}
 */
export function parseSpecGuidelines(specText) {
  /** @type {Array<{level: string, guidance: string, rationale: string | null, source: string}>} */
  const guidelines = [];
  if (!specText) return guidelines;

  const section = specText.match(/## Do \/ don't([\s\S]*?)(?=^## |\Z)/m);
  if (!section) return guidelines;

  for (const trimmed of unwrapBullets(section[1])) {
    const m = trimmed.match(/^[-*•]\s+(Do|Don't)\s*(?:\(([a-z-]+)\))?\s*:?\s+(.*)$/i);
    if (!m) continue;

    const negative = m[1].toLowerCase() === "don't";
    const declared = m[2]?.toLowerCase() ?? null;
    // Split before sanitizing: sanitize truncates at 220 chars, which would swallow the
    // rationale on a long bullet.
    const { guidance: rawGuidance, rationale: rawRationale, rationaleSource } = splitRationale(
      m[3].replace(/\s+/g, " ").trim(),
    );
    const clean = sanitizeAgentProseLine(rawGuidance);
    if (!clean) continue;

    let level;
    if (!declared) {
      level = negative ? "should-not" : "should";
    } else if (negative) {
      // `(must)` on a Don't line means must-not; `(must-not)` is already negative.
      level = NEGATIVE_LEVELS.has(declared) ? declared : `${declared}-not`;
    } else {
      level = declared;
    }
    // An unrecognised level falls back to the default rather than emitting garbage.
    if (!GUIDELINE_LEVELS.includes(level)) level = negative ? "should-not" : "should";
    if (!negative && !POSITIVE_LEVELS.has(level)) level = "should";

    guidelines.push({
      level,
      guidance: clean,
      rationale: rawRationale ? sanitizeAgentProseLine(rawRationale) : null,
      rationaleSource: rawRationale ? rationaleSource : null,
      source: "spec.md#do-dont",
    });
  }

  // Dedupe on guidance text, keeping the strongest level asserted for each rule.
  /** @type {Map<string, {level: string, guidance: string, rationale: string | null, source: string}>} */
  const byGuidance = new Map();
  for (const g of guidelines) {
    const prior = byGuidance.get(g.guidance);
    if (!prior || GUIDELINE_LEVELS.indexOf(g.level) < GUIDELINE_LEVELS.indexOf(prior.level)) {
      byGuidance.set(g.guidance, prior ? { ...g, rationale: g.rationale ?? prior.rationale } : g);
    } else if (!prior.rationale && g.rationale) {
      byGuidance.set(g.guidance, { ...prior, rationale: g.rationale });
    }
  }
  return [...byGuidance.values()].slice(0, 12);
}

/**
 * @param {string | null | undefined} specText
 * @returns {string}
 */
export function extractSpecIntent(specText) {
  if (!specText) return "";
  const match = specText.match(/## Intent\n([\s\S]*?)(?=^## |\Z)/m);
  if (!match) return "";

  const paragraph = match[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("-") && !TODO_RE.test(l))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!paragraph || TODO_RE.test(paragraph)) return "";
  if (paragraph.length > 320) return `${paragraph.slice(0, 317)}…`;
  return paragraph;
}

/**
 * Drop boilerplate intent duplicated from description or too thin for agents.
 * @param {string} intent
 * @param {string} description
 */
export function pickAgentIntent(intent, description) {
  const cleanIntent = sanitizeAgentProseLine(intent) ?? intent.trim();
  const cleanDesc = (description ?? "").trim();
  if (!cleanIntent) return cleanDesc;
  if (cleanDesc && cleanIntent.toLowerCase() === cleanDesc.toLowerCase()) {
    return cleanDesc;
  }
  if (cleanIntent.length < MIN_LINE_LEN && cleanDesc) return cleanDesc;
  return cleanIntent;
}
