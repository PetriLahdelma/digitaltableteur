import { DASH_CHARS } from "./slop-rules.mjs";

const DASH_SPLIT = /[\u2014\u2013]/;

/**
 * Pick punctuation to replace a single em/en dash break.
 * Conservative heuristics: prefer comma, then period, colon in headings.
 */
export function chooseReplacement(left, right, { isHeading = false } = {}) {
  let R = right.trimStart();

  if (!R) return { join: "", right: R };

  if (isHeading) {
    return { join: ": ", right: R };
  }

  if (/^(like|especially|such as|including|e\.g\.)\b/i.test(R)) {
    return { join: ", ", right: R };
  }

  if (/^[A-Z]/.test(R) || /^it'?s\b/i.test(R)) {
    if (/^it'?s\b/i.test(R)) {
      R = R.replace(/^it'?s\b/i, "It's");
    } else if (/^[a-z]/.test(R)) {
      R = R[0].toUpperCase() + R.slice(1);
    }
    return { join: ". ", right: R };
  }

  if (R.length < 70 && /^[a-z(]/.test(R) && !/[.!?].{5,}/.test(R)) {
    return { join: ", ", right: R };
  }

  if (/^[a-z]/.test(R)) {
    return { join: ", ", right: R };
  }

  return { join: ". ", right: R };
}

function fixEmDashesInSimple(line, isHeading) {
  const parts = line.split(DASH_SPLIT);
  if (parts.length === 1) return line;

  let out = parts[0].trimEnd();
  for (let i = 1; i < parts.length; i++) {
    const { join, right } = chooseReplacement(out, parts[i], { isHeading });
    out += join + right;
  }
  return out;
}

/** Fix "word , next" and "## Title : Sub" artifacts after em-dash removal. */
export function normalizePunctuationSpacing(body) {
  return body
    .split("\n")
    .map((line) => {
      let fixed = line.replace(/ , /g, ", ");
      if (/^#{1,6}\s/.test(fixed)) {
        fixed = fixed.replace(/ : /g, ": ");
      }
      return fixed;
    })
    .join("\n");
}

export function fixEmDashesInBody(body) {
  const lines = body.split("\n");
  let inFence = false;

  return lines
    .map((line) => {
      if (/^```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return fixEmDashesInSimple(line, /^#{1,6}\s/.test(line));
    })
    .join("\n");
}

export function countEmDashes(text) {
  return (text.match(DASH_CHARS) ?? []).length;
}
