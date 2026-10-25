/** Callout state of one code line; mirrors the Figma CodeLine State variant. */
export type CodeLineState = "default" | "highlighted" | "added" | "removed";

/** 1-based line numbers as an array, or a range string such as "1,3-5". */
export type CodeLineSpec = readonly number[] | string;

/** Expands a line spec into a set of 1-based line numbers. */
export function parseLineSpec(spec: CodeLineSpec | undefined): Set<number> {
  const lines = new Set<number>();
  if (spec === undefined) return lines;
  if (typeof spec !== "string") {
    for (const line of spec) {
      if (Number.isInteger(line) && line > 0) lines.add(line);
    }
    return lines;
  }
  for (const part of spec.split(",")) {
    const match = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    if (!match) continue;
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    for (let line = Math.min(start, end); line <= Math.max(start, end); line++) {
      if (line > 0) lines.add(line);
    }
  }
  return lines;
}

export interface DiffLine {
  text: string;
  state: CodeLineState;
}

/**
 * Splits unified-diff text into lines with their state. The leading +, - or
 * space is chrome, not code: it moves to the sign column and is dropped from
 * the line text, so a copy of the block pastes as source. File headers
 * ("+++", "---") stay as plain lines.
 */
export function parseDiff(code: string): DiffLine[] {
  return code.split("\n").map((line) => {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      return { text: line.slice(1), state: "added" };
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      return { text: line.slice(1), state: "removed" };
    }
    if (line.startsWith(" ")) {
      return { text: line.slice(1), state: "default" };
    }
    return { text: line, state: "default" };
  });
}

/**
 * The text a copy button puts on the clipboard: every line except removed
 * ones, so a copied diff pastes as the code after the change.
 */
export function copyableText(
  lines: ReadonlyArray<{ text: string; state: CodeLineState }>,
): string {
  return lines
    .filter((line) => line.state !== "removed")
    .map((line) => line.text)
    .join("\n")
    .trimEnd();
}
