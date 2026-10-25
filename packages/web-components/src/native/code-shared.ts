import { Prism } from "./prism";

/**
 * Shared logic for the native code twins (dt-code-block, dt-snippet,
 * dt-code-copy-button). Mirrors nextjs-app/shared/lib/code (lines.ts,
 * highlight.ts) and the React CodeBlock's theme handling; kept inside the
 * package root so emitted declarations never reference application source.
 */

export type CodeLineState = "default" | "highlighted" | "added" | "removed";

export function parseLineSpec(spec: string | null | undefined): Set<number> {
  const lines = new Set<number>();
  if (!spec) return lines;
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

/** A unified-diff line's state from its leading character. */
export function diffState(text: string): CodeLineState {
  if (text.startsWith("+") && !text.startsWith("+++")) return "added";
  if (text.startsWith("-") && !text.startsWith("---")) return "removed";
  return "default";
}

export function hasDiffMarker(text: string): boolean {
  return diffState(text) !== "default" || text.startsWith(" ");
}

export type SyntaxRole =
  | "comment"
  | "keyword"
  | "entity"
  | "variable"
  | "constant"
  | "function"
  | "tag"
  | "attr"
  | "string"
  | "jsx-brace";

export interface CodeSegment {
  text: string;
  role?: SyntaxRole;
}

const ROLE_BY_PRISM_TYPE: Record<string, SyntaxRole> = {
  comment: "comment",
  prolog: "comment",
  doctype: "comment",
  cdata: "comment",
  shebang: "comment",
  keyword: "keyword",
  important: "keyword",
  atrule: "keyword",
  rule: "keyword",
  "class-name": "entity",
  builtin: "entity",
  namespace: "entity",
  variable: "variable",
  parameter: "variable",
  "template-punctuation": "string",
  number: "constant",
  boolean: "constant",
  constant: "constant",
  symbol: "constant",
  property: "constant",
  function: "function",
  "function-variable": "function",
  method: "function",
  tag: "tag",
  selector: "tag",
  "attr-name": "attr",
  string: "string",
  char: "string",
  "attr-value": "string",
  regex: "string",
  url: "string",
  "template-string": "string",
  "script-punctuation": "jsx-brace",
};

const LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  html: "markup",
  xml: "markup",
  svg: "markup",
  yml: "yaml",
  py: "python",
  rs: "rust",
  golang: "go",
};

type PrismToken = {
  type: string;
  alias?: string | string[];
  content: PrismStream | string | PrismToken;
};
type PrismStream = Array<string | PrismToken>;

function roleFor(types: readonly string[]): SyntaxRole | undefined {
  for (let index = types.length - 1; index >= 0; index -= 1) {
    const role = ROLE_BY_PRISM_TYPE[types[index]];
    if (role) return role;
  }
  return undefined;
}

function flatten(
  stream: PrismStream | string | PrismToken,
  types: readonly string[],
  out: CodeSegment[],
) {
  if (typeof stream === "string") {
    out.push({ text: stream, role: roleFor(types) });
    return;
  }
  if (Array.isArray(stream)) {
    for (const item of stream) flatten(item, types, out);
    return;
  }
  const aliases = stream.alias
    ? Array.isArray(stream.alias)
      ? stream.alias
      : [stream.alias]
    : [];
  flatten(stream.content, [...types, stream.type, ...aliases], out);
}

/** Highlights code and splits it into lines of segments with syntax roles. */
export function highlightLines(
  code: string,
  language: string | undefined,
): CodeSegment[][] {
  const key = language?.toLowerCase();
  const grammar = key ? Prism.languages[LANGUAGE_ALIASES[key] ?? key] : undefined;
  const segments: CodeSegment[] = [];
  if (grammar) {
    flatten(Prism.tokenize(code, grammar) as PrismStream, [], segments);
  } else {
    segments.push({ text: code });
  }
  const lines: CodeSegment[][] = [[]];
  for (const segment of segments) {
    segment.text.split("\n").forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, role: segment.role });
    });
  }
  return lines;
}

/** Tokens a dark code surface needs; the high-contrast themes keep theirs. */
const DARK_SURFACE_TOKENS = [
  "--main-body-background-color",
  "--color-light-bg",
  "--color-border-light",
  "--color-text",
  "--color-muted",
  "--color-neutral-bg",
  "--color-success",
  "--color-primary",
  "--focus-ring-color",
  "--code-line-number",
  "--code-line-highlight-bg",
  "--code-line-added-bg",
  "--code-line-removed-bg",
  "--code-line-added-fg",
  "--code-line-removed-fg",
  "--code-shiki-text",
  "--code-shiki-comment",
  "--code-shiki-keyword",
  "--code-shiki-entity",
  "--code-shiki-variable",
  "--code-shiki-constant",
  "--code-shiki-function",
  "--code-shiki-tag",
  "--code-shiki-attr",
  "--code-shiki-string",
  "--code-shiki-jsx-brace",
] as const;

export type DocumentScheme = "light" | "dark" | "hcb" | "hcw";

export function documentScheme(document: Document): DocumentScheme {
  const classes = document.documentElement?.classList;
  if (classes?.contains("themeHCB")) return "hcb";
  if (classes?.contains("themeHCW")) return "hcw";
  if (classes?.contains("themeDark")) return "dark";
  return "light";
}

/**
 * The dark theme's values for a code surface, read from a hidden probe that
 * carries the page's themeDark class. React puts that class on the card;
 * shadow trees cannot match the page's .themeDark rules, so the twin applies
 * the resolved values on its card instead. Null where the surface should
 * follow the page: already dark, or a high-contrast theme.
 */
export function darkSurfaceTokens(
  document: Document,
): Record<string, string> | null {
  if (documentScheme(document) !== "light" || !document.body) return null;
  const view = document.defaultView;
  if (!view) return null;
  const probe = document.createElement("div");
  probe.className = "themeDark";
  probe.hidden = true;
  document.body.append(probe);
  const computed = view.getComputedStyle(probe);
  const tokens: Record<string, string> = {};
  for (const name of DARK_SURFACE_TOKENS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) tokens[name] = value;
  }
  probe.remove();
  return tokens;
}

/** Re-renders when the page switches theme (classes on <html>). */
export function observeDocumentTheme(
  document: Document,
  callback: () => void,
): () => void {
  const Observer = document.defaultView?.MutationObserver;
  if (!Observer || !document.documentElement) return () => {};
  const observer = new Observer(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function optionalBoolean(element: Element, name: string): boolean | null {
  const value = element.getAttribute(name);
  if (value === null) return null;
  return value !== "false";
}
