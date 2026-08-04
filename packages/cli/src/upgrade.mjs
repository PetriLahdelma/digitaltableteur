import { readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { diff } from "./diff.mjs";
import { loadRegistry } from "./data.mjs";
import { DtCliError, ERROR_CODES } from "./errors.mjs";
import {
  collectSourceFiles,
  extractImports,
  extractUsages,
} from "./validate.mjs";

/**
 * Locate one attribute inside a JSX attribute region. Walks the region at
 * expression depth 0 (skipping quoted strings and balanced braces) so
 * identifiers inside expression values are never mistaken for attribute
 * names. Returns { start, end, nameStart, nameEnd } — `start` includes the
 * leading whitespace so a removal leaves no double spaces — or null.
 */
export function attributeSpan(region, attrName) {
  let index = 0;
  while (index < region.length) {
    const char = region[index];
    if (/["'`]/.test(char)) {
      const quote = char;
      index += 1;
      while (index < region.length) {
        if (region[index] === "\\" && quote !== "`") index += 1;
        else if (region[index] === quote) break;
        index += 1;
      }
      index += 1;
      continue;
    }
    if (char === "{") {
      let depth = 1;
      index += 1;
      while (index < region.length && depth > 0) {
        const inner = region[index];
        if (/["'`]/.test(inner)) {
          const quote = inner;
          index += 1;
          while (index < region.length) {
            if (region[index] === "\\" && quote !== "`") index += 1;
            else if (region[index] === quote) break;
            index += 1;
          }
        } else if (inner === "{") depth += 1;
        else if (inner === "}") depth -= 1;
        index += 1;
      }
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      const nameStart = index;
      while (index < region.length && /[\w-]/.test(region[index])) index += 1;
      const name = region.slice(nameStart, index);
      let cursor = index;
      while (cursor < region.length && /\s/.test(region[cursor])) cursor += 1;
      let valueEnd = index;
      if (region[cursor] === "=") {
        cursor += 1;
        while (cursor < region.length && /\s/.test(region[cursor])) cursor += 1;
        const valueChar = region[cursor];
        if (/["']/.test(valueChar)) {
          cursor += 1;
          while (cursor < region.length && region[cursor] !== valueChar)
            cursor += 1;
          valueEnd = cursor + 1;
        } else if (valueChar === "{") {
          let depth = 1;
          cursor += 1;
          while (cursor < region.length && depth > 0) {
            const inner = region[cursor];
            if (/["'`]/.test(inner)) {
              const quote = inner;
              cursor += 1;
              while (cursor < region.length) {
                if (region[cursor] === "\\" && quote !== "`") cursor += 1;
                else if (region[cursor] === quote) break;
                cursor += 1;
              }
            } else if (inner === "{") depth += 1;
            else if (inner === "}") depth -= 1;
            cursor += 1;
          }
          valueEnd = cursor;
        }
      }
      if (name === attrName) {
        let start = nameStart;
        while (start > 0 && /\s/.test(region[start - 1])) start -= 1;
        return {
          start,
          end: valueEnd,
          nameStart,
          nameEnd: nameStart + name.length,
        };
      }
      index = Math.max(valueEnd, index);
      continue;
    }
    index += 1;
  }
  return null;
}

function renderDefaultAttribute(prop, value) {
  if (typeof value === "string") return `${prop}="${value}"`;
  if (value === true) return prop;
  if (value === false) return `${prop}={false}`;
  if (typeof value === "number") return `${prop}={${value}}`;
  return null;
}

/**
 * Turn one component's classified contract changes into a codemod plan.
 * Only mechanically safe rewrites become actions; everything requiring
 * judgment lands in `manual`. Rename pairing is deliberately conservative:
 * exactly one removed and one added prop with an identical declared type.
 */
export function planComponentUpgrade(report) {
  const actions = { renames: [], removals: [], defaults: [] };
  const manual = [];
  const conditional = { valuesRemoved: [], nowRequired: [] };

  const removed = report.changes.filter(({ kind }) => kind === "prop-removed");
  const added = report.changes.filter(({ kind }) => kind === "prop-added");
  let renamePair = null;
  if (
    removed.length === 1 &&
    added.length === 1 &&
    removed[0].propType &&
    removed[0].propType === added[0].propType
  ) {
    renamePair = { from: removed[0].prop, to: added[0].prop };
    actions.renames.push(renamePair);
  }

  for (const change of report.changes) {
    switch (change.kind) {
      case "prop-removed":
        if (renamePair?.from !== change.prop)
          actions.removals.push(change.prop);
        break;
      case "prop-added":
        if (change.required && renamePair?.to !== change.prop)
          conditional.nowRequired.push(change.prop);
        break;
      case "prop-default-changed": {
        const attribute = renderDefaultAttribute(change.prop, change.from);
        if (attribute) actions.defaults.push({ prop: change.prop, attribute });
        else
          manual.push({
            kind: change.kind,
            prop: change.prop,
            message: `${report.name} ${change.prop} default changed to a non-primitive; review usages that relied on the old default.`,
          });
        break;
      }
      case "prop-values-removed":
        conditional.valuesRemoved.push({
          prop: change.prop,
          values: change.values ?? [],
        });
        break;
      case "prop-now-required":
        conditional.nowRequired.push(change.prop);
        break;
      case "component-removed":
        manual.push({
          kind: change.kind,
          message: `${report.name} was removed; migrate every usage to a replacement component.`,
        });
        break;
      case "status-changed":
        if (change.detail.endsWith("-> deprecated"))
          manual.push({
            kind: "component-deprecated",
            message: `${report.name} is now deprecated; plan a migration.`,
          });
        break;
      default:
        break;
    }
  }
  return { actions, manual, conditional };
}

function editsForUsage(source, usage, plan, component) {
  const region = source.slice(usage.regionStart, usage.regionEnd);
  const edits = [];
  const manual = [];
  const present = new Set(usage.attributes.map(({ name }) => name));

  for (const rename of plan.actions.renames) {
    const span = attributeSpan(region, rename.from);
    if (span) {
      edits.push({
        start: usage.regionStart + span.nameStart,
        end: usage.regionStart + span.nameEnd,
        replacement: rename.to,
        kind: "prop-renamed",
        prop: rename.from,
        detail: `${rename.from} -> ${rename.to}`,
      });
    }
  }
  for (const prop of plan.actions.removals) {
    const span = attributeSpan(region, prop);
    if (span) {
      edits.push({
        start: usage.regionStart + span.start,
        end: usage.regionStart + span.end,
        replacement: "",
        kind: "prop-removed",
        prop,
        detail: `removed dead prop ${prop}`,
      });
    }
  }
  for (const insert of plan.actions.defaults) {
    if (present.has(insert.prop) || usage.hasSpread) continue;
    edits.push({
      start: usage.regionStart,
      end: usage.regionStart,
      replacement: ` ${insert.attribute}`,
      kind: "default-pinned",
      prop: insert.prop,
      detail: `pinned previous default: ${insert.attribute}`,
    });
  }
  for (const { prop, values } of plan.conditional.valuesRemoved) {
    const attribute = usage.attributes.find(
      (candidate) => candidate.name === prop && candidate.isLiteral,
    );
    if (attribute && values.includes(attribute.value)) {
      manual.push({
        kind: "prop-values-removed",
        prop,
        message: `${component} ${prop}="${attribute.value}" is no longer a contract value; pick a replacement.`,
      });
    }
  }
  for (const prop of plan.conditional.nowRequired) {
    if (!present.has(prop) && !usage.hasSpread && prop !== "children") {
      manual.push({
        kind: "prop-now-required",
        prop,
        message: `${component} now requires "${prop}"; supply a value.`,
      });
    }
  }
  return { edits, manual };
}

/**
 * Apply a set of upgrade plans to one source file. Returns the rewritten
 * source plus the edit and manual records. Edits are applied back-to-front
 * so earlier offsets stay valid; re-running on the output is a no-op.
 */
export function applyUpgradeToSource(source, locals, plansByComponent) {
  const relevant = new Map(
    [...locals].filter(([, component]) => plansByComponent.has(component)),
  );
  const edits = [];
  const manual = [];
  for (const usage of extractUsages(source, new Set(relevant.keys()))) {
    const component = relevant.get(usage.local);
    const plan = plansByComponent.get(component);
    const result = editsForUsage(source, usage, plan, component);
    for (const edit of result.edits)
      edits.push({ ...edit, component, line: usage.line });
    for (const item of result.manual)
      manual.push({ ...item, component, line: usage.line });
  }
  let output = source;
  const ordered = [...edits].sort((a, b) => b.start - a.start);
  for (const edit of ordered) {
    output =
      output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
  }
  return { output, edits, manual };
}

/**
 * Diff-coupled consumer codemod: classify contract changes between two refs
 * (default HEAD -> worktree), derive mechanically safe rewrites, and apply
 * them to the consumer sources under --path. Dry-run by default; --write
 * persists. Judgment calls are reported as `manual` items instead of being
 * guessed.
 */
export async function upgrade(names = [], options = {}) {
  const write = options.write === true;
  const diffReport = await diff(names.length === 1 ? names[0] : undefined, {
    from: options.from,
    to: options.to,
    cwd: options.cwd,
  });
  let reports = diffReport.data.components;
  if (names.length > 1) {
    const wanted = new Set(names.map((name) => name.toLocaleLowerCase()));
    reports = reports.filter((report) =>
      wanted.has(report.name.toLocaleLowerCase()),
    );
  }

  const plansByComponent = new Map();
  const globalManual = [];
  for (const report of reports) {
    const plan = planComponentUpgrade(report);
    for (const item of plan.manual)
      globalManual.push({ ...item, component: report.name });
    if (
      plan.actions.renames.length ||
      plan.actions.removals.length ||
      plan.actions.defaults.length ||
      plan.conditional.valuesRemoved.length ||
      plan.conditional.nowRequired.length
    ) {
      plansByComponent.set(report.name, plan);
    }
  }

  const root = resolve(options.cwd ?? process.cwd(), options.path ?? ".");
  // Nothing planned means nothing to scan — identical refs stay cheap.
  const files = plansByComponent.size > 0 ? await collectSourceFiles(root) : [];
  if (files.length === 0 && plansByComponent.size > 0) {
    throw new DtCliError(
      `No .tsx/.jsx source files found under "${root}".`,
      ERROR_CODES.INVALID_ARGUMENT,
    );
  }

  const allEdits = [];
  const allManual = [...globalManual];
  let changedFiles = 0;
  if (plansByComponent.size > 0) {
    const { docsRegistry } = await loadRegistry(options);
    const registry = docsRegistry.components ?? {};
    // Components can be missing from the installed registry when the diff
    // says they were removed; map imports for planned components regardless.
    for (const name of plansByComponent.keys()) {
      if (!registry[name]) registry[name] = { name };
    }
    for (const file of files) {
      const source = await readFile(file, "utf8");
      const fileLabel = relative(root, file) || file;
      const { locals } = extractImports(source, registry);
      const { output, edits, manual } = applyUpgradeToSource(
        source,
        locals,
        plansByComponent,
      );
      for (const edit of edits)
        allEdits.push({ ...edit, file: fileLabel, applied: write });
      for (const item of manual) allManual.push({ ...item, file: fileLabel });
      if (edits.length > 0) {
        changedFiles += 1;
        if (write) await writeFile(file, output);
      }
    }
  }

  return {
    type: "upgrade.report",
    data: {
      from: diffReport.data.from,
      to: diffReport.data.to,
      path: root,
      dryRun: !write,
      componentsWithChanges: reports.map(({ name }) => name),
      componentsPlanned: [...plansByComponent.keys()],
      filesScanned: files.length,
      changedFiles,
      edits: allEdits.map(({ start, end, replacement, ...edit }) => edit),
      manual: allManual,
      summary: {
        edits: allEdits.length,
        manual: allManual.length,
        applied: write ? allEdits.length : 0,
      },
    },
  };
}
