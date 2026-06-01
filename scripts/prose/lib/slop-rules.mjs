/**
 * Machine-checkable prose rules for blog MDX and long-form content.
 * Human voice reference: docs/WRITING_STYLE.md
 */

/** Unicode em dash and en dash (often used like an em dash). */
export const DASH_CHARS = /[\u2014\u2013]/g;

/** Max em/en dashes allowed per file (0 = none). */
export const DEFAULT_MAX_EM_DASHES = 0;

/** Warn when density exceeds this per 500 words of body text. */
export const EM_DASH_DENSITY_WARN_PER_500 = 1;

/**
 * Patterns humans commonly flag as Gen-AI / LLM slop.
 * severity: "error" fails check; "warn" prints only unless --strict
 */
export const SLOP_RULES = [
  {
    id: "em-dash",
    severity: "error",
    label: "Em dash (—) or en dash used as break",
    test: (body) => {
      const re = new RegExp(DASH_CHARS.source, "g");
      const first = re.exec(body);
      if (!first) return null;
      const all = body.match(re) ?? [];
      return { count: all.length, sample: sampleAround(body, first.index) };
    },
  },
  {
    id: "opener-landscape",
    severity: "error",
    label: "Generic AI opener (fast-paced / ever-evolving landscape)",
    test: (body) =>
      matchFirst(
        body,
        /\bIn today['']s\b.{0,80}\b(fast-paced|ever-evolving|rapidly evolving)\b/i,
      ),
  },
  {
    id: "not-x-its-y",
    severity: "warn",
    label: '"Not X, it\'s Y" contrast formula (max once per article)',
    test: (body) => {
      const re =
        /\bnot\b[^.!?\n]{0,120}\b(it'?s|it is)\b[^.!?\n]{0,80}/gi;
      const hits = [...body.matchAll(re)];
      if (hits.length <= 1) return null;
      return { count: hits.length, sample: hits[1][0].slice(0, 120) };
    },
  },
  {
    id: "banned-vocab",
    severity: "error",
    label: "Banned vocabulary (WRITING_STYLE.md)",
    test: (body) => {
      const banned = [
        "delve",
        "leverage",
        "utilize",
        "robust",
        "seamless",
        "game-changer",
        "unlock",
        "elevate",
        "foster",
        "streamline",
        "cutting-edge",
        "holistic",
        "synergy",
        "tapestry",
        "realm",
        "furthermore",
        "moreover",
        "essentially",
        "deep dive",
        "double down",
        "at the end of the day",
        "it's important to note",
        "it is important to note",
        "in conclusion",
      ];
      for (const word of banned) {
        const re = new RegExp(`\\b${escapeRe(word)}\\b`, "i");
        const m = body.match(re);
        if (m) return { word, sample: m[0] };
      }
      return null;
    },
  },
  {
    id: "hollow-transitions",
    severity: "warn",
    label: "Hollow transition (Furthermore / Moreover at sentence start)",
    test: (body) =>
      matchFirst(body, /(?:^|[.!?]\s+)(Furthermore|Moreover),/m),
  },
  {
    id: "throat-clearing",
    severity: "warn",
    label: 'Throat-clearing ("Here\'s the thing" / "Let me be clear")',
    test: (body) =>
      matchFirst(
        body,
        /\b(Here'?s the thing|Let me be clear|The truth is,|Make no mistake)\b/i,
      ),
  },
  {
    id: "navigate-landscape",
    severity: "warn",
    label: "Metaphorical navigate / landscape",
    test: (body) => {
      if (/\bnavigate\b.{0,40}\b(challenges?|complex|landscape)\b/i.test(body))
        return { sample: "navigate … landscape/challenges" };
      if (/\b(in|the)\s+landscape\b/i.test(body) && !/\becosystem\b/i.test(body))
        return { sample: "… landscape …" };
      return null;
    },
  },
  {
    id: "hedge-stack",
    severity: "warn",
    label: "Hedge stack (might / perhaps / arguably in one sentence)",
    test: (body) =>
      matchFirst(
        body,
        /\b[^.!?\n]*\b(might|perhaps|arguably|it's worth noting)\b[^.!?\n]*\b(might|perhaps|arguably|it's worth noting)\b/i,
      ),
  },
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchFirst(body, re) {
  const m = body.match(re);
  if (!m) return null;
  return { sample: m[0].slice(0, 120) };
}

function sampleAround(text, index) {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + 40);
  return text.slice(start, end).replace(/\n/g, " ");
}

export function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}
