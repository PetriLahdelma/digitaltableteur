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
export function parseSpecAgentHints(specText) {
  const useWhen = [];
  const avoidWhen = [];
  if (!specText) return { useWhen, avoidWhen };

  const section = specText.match(/## Do \/ don't([\s\S]*?)(?=^## |\Z)/m);
  if (!section) return { useWhen, avoidWhen };

  for (const line of section[1].split("\n")) {
    const trimmed = line.trim();
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
