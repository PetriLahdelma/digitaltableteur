import Prism from "./prism";

/**
 * Syntax roles, one per code-shiki colour token (Figma DT / Color
 * code/shiki/*). Prism's grammar-specific token names fold into these so a
 * block highlighted at runtime from a string uses the same palette as one
 * Shiki highlighted at build time.
 */
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

type PrismStream = Array<string | Prism.Token>;

function roleFor(types: readonly string[]): SyntaxRole | undefined {
  // Innermost type wins: a string inside an attribute is a string.
  for (let index = types.length - 1; index >= 0; index -= 1) {
    const role = ROLE_BY_PRISM_TYPE[types[index]];
    if (role) return role;
  }
  return undefined;
}

function flatten(
  stream: PrismStream | string | Prism.Token,
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
  flatten(
    stream.content as PrismStream | string | Prism.Token,
    [...types, stream.type, ...aliases],
    out,
  );
}

/** Resolves a language label ("ts", "shell") to a registered Prism grammar. */
export function resolveGrammar(language: string | undefined) {
  if (!language) return undefined;
  const key = language.toLowerCase();
  const name = LANGUAGE_ALIASES[key] ?? key;
  return Prism.languages[name];
}

/**
 * Highlights `code` and splits it into lines of coloured segments. An unknown
 * or missing language yields plain lines; nothing throws on bad input.
 */
export function highlightLines(
  code: string,
  language: string | undefined,
): CodeSegment[][] {
  const grammar = resolveGrammar(language);
  const segments: CodeSegment[] = [];
  if (grammar) {
    flatten(Prism.tokenize(code, grammar), [], segments);
  } else {
    segments.push({ text: code });
  }

  const lines: CodeSegment[][] = [[]];
  for (const segment of segments) {
    const parts = segment.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, role: segment.role });
    });
  }
  return lines;
}
