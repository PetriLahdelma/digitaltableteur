import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { loadRegistry } from "./data.mjs";
import { DtCliError, ERROR_CODES } from "./errors.mjs";

const SOURCE_EXTENSIONS = [".tsx", ".jsx"];
const SKIP_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "coverage",
  "storybook-static",
]);

// Attributes that are always legal on a component regardless of its contract:
// React specials plus global HTML attributes commonly forwarded to the root
// element. aria-*, data-* and on<Event> handlers are matched by prefix below.
const GLOBAL_ATTRIBUTES = new Set([
  "children",
  "className",
  "dir",
  "hidden",
  "id",
  "key",
  "lang",
  "ref",
  "role",
  "slot",
  "style",
  "suppressHydrationWarning",
  "tabIndex",
  "title",
]);

function isGlobalAttribute(name) {
  return (
    GLOBAL_ATTRIBUTES.has(name) ||
    name.startsWith("aria-") ||
    name.startsWith("data-") ||
    /^on[A-Z]/.test(name)
  );
}

async function collectSourceFiles(root) {
  const files = [];
  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".") continue;
      const full = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) await walk(full);
      } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        files.push(full);
      }
    }
  }
  await walk(root);
  return files.sort();
}

const IMPORT_RE =
  /import\s+(type\s+)?([\w$]+)?\s*,?\s*(?:\{([^}]*)\})?\s*from\s*["']([^"']+)["']/g;

function componentNameFromPath(source) {
  const dtAlias = source.match(/^@dt\/([A-Za-z][\w]*)$/);
  if (dtAlias) return dtAlias[1];
  const relativeMatch = source.match(
    /(?:components|patterns)\/(?:animations\/)?([A-Z][\w]*)(?:\/(?:index|\1))?$/,
  );
  if (relativeMatch) return relativeMatch[1];
  return null;
}

/**
 * Map local JSX identifiers to design-system component names for one file.
 * Returns { locals: Map<localName, componentName>, unknownImports: [] }.
 * Named imports are only mapped when the exported name exists in the
 * registry, so utility exports (types, hooks) never produce findings.
 */
export function extractImports(source, registry) {
  const locals = new Map();
  const unknownImports = [];
  for (const match of source.matchAll(IMPORT_RE)) {
    const [, typeOnly, defaultName, namedBlock, modulePath] = match;
    if (typeOnly) continue;
    const isPackage = modulePath === "@digitaltableteur/react";
    const pathComponent = componentNameFromPath(modulePath);
    if (!isPackage && !pathComponent) continue;

    if (defaultName && pathComponent) {
      if (registry[pathComponent]) locals.set(defaultName, pathComponent);
      else if (modulePath.startsWith("@dt/"))
        unknownImports.push({
          local: defaultName,
          component: pathComponent,
          severity: "error",
        });
    }
    for (const raw of (namedBlock ?? "").split(",")) {
      const named = raw.trim();
      if (!named || named.startsWith("type ")) continue;
      const [exported, alias] = named.split(/\s+as\s+/).map((s) => s.trim());
      const local = alias ?? exported;
      if (registry[exported]) locals.set(local, exported);
      else if (
        isPackage &&
        /^[A-Z]/.test(exported) &&
        !exported.endsWith("Props")
      )
        // The package exports helpers (providers, hooks, types) beyond the
        // contract registry, so an unmatched named import is a caution, not
        // proof of a phantom component.
        unknownImports.push({ local, component: exported, severity: "warn" });
    }
  }
  return { locals, unknownImports };
}

/**
 * Tokenize JSX opening tags for the given local names. A tiny scanner (not a
 * parser): from each `<Local` it walks to the matching `>` tracking brace,
 * bracket, paren, quote, and template depth, then splits the attribute
 * region. Elements carrying a spread are flagged so presence checks bail.
 */
export function extractUsages(source, localNames) {
  const usages = [];
  if (localNames.size === 0) return usages;
  const namePattern = [...localNames]
    .map((name) => name.replace(/\$/g, "\\$"))
    .join("|");
  const tagRe = new RegExp(`<(${namePattern})(?=[\\s/<>])`, "g");
  for (const match of source.matchAll(tagRe)) {
    let start = match.index + match[0].length;
    // Skip a generic type argument (<DataTable<Row> ...>) before the
    // attribute region.
    if (source[start] === "<") {
      let genericDepth = 0;
      let cursor = start;
      do {
        if (source[cursor] === "<") genericDepth += 1;
        else if (source[cursor] === ">") genericDepth -= 1;
        cursor += 1;
      } while (cursor < source.length && genericDepth > 0);
      start = cursor;
    }
    let index = start;
    let depth = 0;
    let quote = null;
    while (index < source.length) {
      const char = source[index];
      if (quote) {
        if (char === "\\" && quote !== "`") index += 1;
        else if (char === quote) quote = null;
      } else if (/["'`]/.test(char)) {
        quote = char;
      } else if (char === "{" || char === "(" || char === "[") {
        depth += 1;
      } else if (char === "}" || char === ")" || char === "]") {
        depth -= 1;
      } else if (char === ">" && depth === 0) {
        break;
      }
      index += 1;
    }
    if (index >= source.length) continue;
    const attrRegion = source.slice(start, index);
    const selfClosing = attrRegion.trimEnd().endsWith("/");
    const line = source.slice(0, match.index).split("\n").length;
    usages.push({
      local: match[1],
      line,
      selfClosing,
      hasSpread: /\{\s*\.\.\./.test(attrRegion),
      attributes: parseAttributes(attrRegion),
    });
  }
  return usages;
}

const ATTRIBUTE_RE =
  /([A-Za-z_][\w-]*)\s*(?:=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))?/g;

function parseAttributes(region) {
  // Blank out balanced {...} expression values first so identifiers inside
  // expressions are never mistaken for attribute names.
  let cleaned = "";
  let depth = 0;
  let quote = null;
  for (let index = 0; index < region.length; index += 1) {
    const char = region[index];
    if (quote) {
      if (char === "\\" && quote !== "`") {
        cleaned += depth > 0 ? "  " : char + region[index + 1];
        index += 1;
        continue;
      }
      if (char === quote) quote = null;
      cleaned += depth > 0 ? " " : char;
      continue;
    }
    if (/["'`]/.test(char)) {
      quote = char;
      cleaned += depth > 0 ? " " : char;
      continue;
    }
    if (char === "{") {
      depth += 1;
      cleaned += " ";
      continue;
    }
    if (char === "}") {
      depth -= 1;
      cleaned += " ";
      continue;
    }
    cleaned += depth > 0 ? " " : char;
  }
  const attributes = [];
  for (const match of cleaned.matchAll(ATTRIBUTE_RE)) {
    const [, name, literal] = match;
    if (!name) continue;
    attributes.push({
      name,
      value: literal ? literal.slice(1, -1) : undefined,
      isLiteral: literal !== undefined,
    });
  }
  return attributes;
}

function finiteValuesFor(prop) {
  if (Array.isArray(prop?.values) && prop.values.length > 0) return prop.values;
  return null;
}

/**
 * Validate consumer usage of design-system components against the installed
 * contract manifest. Scans .tsx/.jsx files under --path (default: cwd),
 * optionally narrowed to specific component names.
 */
export async function validate(names = [], options = {}) {
  const { docsRegistry } = await loadRegistry(options);
  const registry = docsRegistry.components ?? {};
  const root = resolve(options.cwd ?? process.cwd(), options.path ?? ".");

  const only = new Set();
  for (const raw of names) {
    const canonical = Object.keys(registry).find(
      (candidate) => candidate.toLocaleLowerCase() === raw.toLocaleLowerCase(),
    );
    if (!canonical) {
      throw new DtCliError(
        `Unknown component "${raw}".`,
        ERROR_CODES.UNKNOWN_COMPONENT,
        Object.keys(registry)
          .filter((candidate) =>
            candidate.toLocaleLowerCase().includes(raw.toLocaleLowerCase()),
          )
          .slice(0, 5)
          .map((name) => ({ name, reason: "partial name match" })),
      );
    }
    only.add(canonical);
  }

  const files = await collectSourceFiles(root);
  if (files.length === 0) {
    throw new DtCliError(
      `No .tsx/.jsx source files found under "${root}".`,
      ERROR_CODES.INVALID_ARGUMENT,
    );
  }

  const findings = [];
  let usageCount = 0;
  let spreadBailouts = 0;
  const componentsSeen = new Set();

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const fileLabel = relative(root, file) || file;
    const { locals, unknownImports } = extractImports(source, registry);
    for (const { component, severity } of unknownImports) {
      if (only.size > 0 && !only.has(component)) continue;
      findings.push({
        severity,
        kind: "unknown-component",
        file: fileLabel,
        component,
        message:
          severity === "error"
            ? `"${component}" is imported as a design-system component but has no contract in the installed registry.`
            : `"${component}" is imported from the package but has no contract in the installed registry (may be a helper export).`,
      });
    }
    const scopedLocals = new Map(
      [...locals].filter(([, component]) =>
        only.size === 0 ? true : only.has(component),
      ),
    );
    for (const usage of extractUsages(source, new Set(scopedLocals.keys()))) {
      const component = scopedLocals.get(usage.local);
      const entry = registry[component];
      if (!entry) continue;
      usageCount += 1;
      componentsSeen.add(component);
      const props = entry.props ?? {};
      const where = { file: fileLabel, line: usage.line, component };

      if (entry.status === "deprecated") {
        findings.push({
          severity: "warn",
          kind: "deprecated-component",
          ...where,
          message: `${component} is deprecated; migrate before the removal window closes.`,
        });
      }

      for (const attribute of usage.attributes) {
        const prop = props[attribute.name];
        if (!prop) {
          if (!isGlobalAttribute(attribute.name)) {
            findings.push({
              severity: "warn",
              kind: "unknown-prop",
              ...where,
              prop: attribute.name,
              message: `${component} contract does not declare "${attribute.name}". Native passthrough attributes are legal but invisible to the contract; verify the spelling.`,
            });
          }
          continue;
        }
        const values = finiteValuesFor(prop);
        if (
          values &&
          attribute.isLiteral &&
          !values.includes(attribute.value)
        ) {
          findings.push({
            severity: "error",
            kind: "invalid-enum-value",
            ...where,
            prop: attribute.name,
            value: attribute.value,
            message: `${component} ${attribute.name}="${attribute.value}" is not a contract value. Allowed: ${values.join(", ")}.`,
          });
        }
      }

      if (usage.hasSpread) {
        spreadBailouts += 1;
      } else {
        const present = new Set(usage.attributes.map(({ name }) => name));
        for (const [propName, prop] of Object.entries(props)) {
          if (prop.optional !== false || present.has(propName)) continue;
          if (propName === "children" && !usage.selfClosing) continue;
          findings.push({
            severity: "error",
            kind: "missing-required-prop",
            ...where,
            prop: propName,
            message: `${component} requires "${propName}" (${prop.type ?? "unknown type"}).`,
          });
        }
      }
    }
  }

  // Inherited native props (e.g. Link's href from the anchor extension) are
  // invisible to contracts by design, so the same unknown-prop warning can
  // repeat across a codebase. Collapse duplicates per component+prop and
  // keep the first location with an occurrence count.
  const deduped = [];
  const seenUnknownProps = new Map();
  for (const finding of findings) {
    if (finding.kind !== "unknown-prop") {
      deduped.push(finding);
      continue;
    }
    const key = `${finding.component}:${finding.prop}`;
    const existing = seenUnknownProps.get(key);
    if (existing) existing.occurrences += 1;
    else {
      const first = { ...finding, occurrences: 1 };
      seenUnknownProps.set(key, first);
      deduped.push(first);
    }
  }
  findings.length = 0;
  findings.push(...deduped);

  const errors = findings.filter(({ severity }) => severity === "error").length;
  const warnings = findings.length - errors;
  const byKind = {};
  for (const finding of findings) {
    byKind[finding.kind] = (byKind[finding.kind] ?? 0) + 1;
  }

  return {
    type: "validate.report",
    data: {
      path: root,
      filter: [...only].sort(),
      filesScanned: files.length,
      usages: usageCount,
      components: [...componentsSeen].sort(),
      findings,
      summary: { errors, warnings, byKind },
      clean: errors === 0,
      ...(spreadBailouts > 0
        ? {
            note: `${spreadBailouts} usage(s) carry a JSX spread; required-prop presence was not checked for those elements.`,
          }
        : {}),
    },
  };
}
