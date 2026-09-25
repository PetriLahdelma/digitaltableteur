/**
 * Acceptance executors for the agent benchmark. Every check returns
 * { id, kind, pass, detail } and never throws — a grader crash is a fail
 * with evidence, not an exception that hides the run.
 */
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { validate } from "../../../packages/cli/src/api.mjs";
import {
  extractImports,
  extractUsages,
} from "../../../packages/cli/src/validate.mjs";
import { loadRegistry } from "../../../packages/cli/src/data.mjs";
import {
  extractCssDefinitions,
  extractCssReferences,
  extractTsxDefinitions,
} from "../phantom-tokens-lib.mjs";

const execFileAsync = promisify(execFile);

async function walkFiles(root) {
  const files = [];
  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) await walk(full);
      else files.push(full);
    }
  }
  await walk(root);
  return files.sort();
}

async function usageScan(worktree, check) {
  const { docsRegistry } = await loadRegistry({ cwd: worktree });
  const registry = docsRegistry.components ?? {};
  const problems = [];
  for (const relativePath of check.files) {
    let source;
    try {
      source = await readFile(join(worktree, relativePath), "utf8");
    } catch {
      problems.push(`${relativePath}: unreadable`);
      continue;
    }
    const { locals } = extractImports(source, registry);
    const relevant = new Map(
      [...locals].filter(([, component]) => component === check.component),
    );
    const usages = extractUsages(source, new Set(relevant.keys()));
    if (usages.length === 0) {
      problems.push(`${relativePath}: no ${check.component} usage found`);
      continue;
    }
    // forbidProp must hold for EVERY usage; requireProp is satisfied when
    // AT LEAST ONE usage in the file passes it (files can legitimately mix
    // usages that never carried the renamed prop).
    let requireHit = !check.requireProp;
    for (const usage of usages) {
      const names = usage.attributes.map(({ name }) => name);
      if (check.forbidProp && names.includes(check.forbidProp)) {
        problems.push(
          `${relativePath}:${usage.line} still passes ${check.forbidProp}`,
        );
      }
      if (check.requireProp && names.includes(check.requireProp)) {
        requireHit = true;
      }
    }
    if (!requireHit) {
      problems.push(
        `${relativePath}: no usage passes ${check.requireProp}`,
      );
    }
  }
  return {
    pass: problems.length === 0,
    detail: problems.length ? problems.join(" | ") : "all scoped usages migrated",
  };
}

async function validateCheck(worktree, check) {
  const report = await validate(check.components ?? [], {
    cwd: worktree,
    path: check.path,
  });
  if (check.prop) {
    const hits = report.data.findings.filter(
      (finding) => finding.prop === check.prop,
    );
    return {
      pass: hits.length === 0,
      detail: hits.length
        ? hits
            .map((hit) => `${hit.file}:${hit.line ?? "?"} ${hit.kind}`)
            .join(" | ")
        : `no findings for prop "${check.prop}"`,
    };
  }
  const { errors, warnings } = report.data.summary;
  return {
    pass: errors === 0,
    detail: `${report.data.usages} usage(s), ${errors} error(s), ${warnings} warning(s)${
      errors
        ? `: ${report.data.findings
            .filter(({ severity }) => severity === "error")
            .slice(0, 3)
            .map(({ file, line, message }) => `${file}:${line} ${message}`)
            .join(" | ")}`
        : ""
    }`,
  };
}

async function vitestCheck(worktree, check) {
  try {
    const { stdout } = await execFileAsync(
      "npx",
      ["vitest", "run", ...check.paths],
      { cwd: worktree, maxBuffer: 32 * 1024 * 1024 },
    );
    const summary =
      stdout.split("\n").find((line) => line.includes("Tests ")) ?? "passed";
    return { pass: true, detail: summary.trim() };
  } catch (error) {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    return {
      pass: false,
      detail: output.trim().split("\n").slice(-10).join("\n"),
    };
  }
}

async function sourceScan(worktree, check) {
  const files = await walkFiles(join(worktree, check.dir));
  if (files.length === 0) {
    return { pass: false, detail: `${check.dir} is empty or missing` };
  }
  const problems = [];
  let anyRequireHit = !check.requireAnyPattern;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (check.forbidPattern && new RegExp(check.forbidPattern).test(source)) {
      problems.push(`${file.slice(worktree.length + 1)} matches forbidden ${check.forbidPattern}`);
    }
    if (
      check.requireAnyPattern &&
      check.requireAnyPattern.some((pattern) => source.includes(pattern))
    ) {
      anyRequireHit = true;
    }
  }
  if (!anyRequireHit) {
    problems.push(
      `no file matches any of: ${check.requireAnyPattern.join(", ")}`,
    );
  }
  return {
    pass: problems.length === 0,
    detail: problems.length ? problems.join(" | ") : "source scan clean",
  };
}

// Roots whose custom-property definitions count as the design system's
// token vocabulary (mirrors check-phantom-tokens.mjs DEFINITION_ROOTS).
const TOKEN_DEFINITION_ROOTS = ["app", "nextjs-app"];
const SKIP_DIRECTORIES = new Set([".next", "dist", "node_modules", "storybook-static"]);
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/;
const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;
const NAMED_COLOR_VALUE =
  /:\s*[^;{}]*\b(?:white|black|red|green|blue|gray|grey|silver|navy|orange|yellow|purple|pink|teal|maroon|olive|lime|aqua|fuchsia|gold|crimson|tomato|coral|indigo|violet|beige|ivory|khaki|salmon|tan|brown|cyan|magenta|whitesmoke|gainsboro|lightgray|lightgrey|darkgray|darkgrey)\b/i;

const tokenVocabularyCache = new Map();

async function designSystemTokens(worktree) {
  if (tokenVocabularyCache.has(worktree)) {
    return tokenVocabularyCache.get(worktree);
  }
  const defined = new Set();
  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) await walk(full);
      } else if (entry.name.endsWith(".css") && !entry.name.endsWith(".min.css")) {
        for (const token of extractCssDefinitions(await readFile(full, "utf8"))) {
          defined.add(token);
        }
      } else if (/\.tsx?$/.test(entry.name)) {
        for (const token of extractTsxDefinitions(await readFile(full, "utf8"))) {
          defined.add(token);
        }
      }
    }
  }
  for (const root of TOKEN_DEFINITION_ROOTS) await walk(join(worktree, root));
  tokenVocabularyCache.set(worktree, defined);
  return defined;
}

/**
 * Token discipline: no color literals anywhere in the workspace, every
 * referenced custom property resolves (to a design-system token or a
 * workspace-local definition), and each required token family is used via a
 * real design-system token. A phantom reference with a fallback still fails:
 * the brief asks for the system's tokens, and the fallback hides the miss.
 */
async function tokenDiscipline(worktree, check) {
  const files = await walkFiles(join(worktree, check.dir));
  const styled = files.filter((file) => /\.(css|tsx?)$/.test(file));
  if (styled.length === 0) {
    return { pass: false, detail: `${check.dir} is empty or missing` };
  }
  const vocabulary = await designSystemTokens(worktree);
  const local = new Set();
  const references = [];
  const problems = [];
  for (const file of styled) {
    const source = await readFile(file, "utf8");
    const relativePath = file.slice(worktree.length + 1);
    const isCss = file.endsWith(".css");
    for (const token of isCss
      ? extractCssDefinitions(source)
      : extractTsxDefinitions(source)) {
      local.add(token);
    }
    for (const reference of extractCssReferences(source)) {
      references.push({ ...reference, file: relativePath });
    }
    const lines = source.split("\n");
    lines.forEach((line, index) => {
      const literal =
        HEX_COLOR.test(line) ||
        COLOR_FUNCTION.test(line) ||
        (isCss && NAMED_COLOR_VALUE.test(line));
      if (literal) {
        problems.push(`${relativePath}:${index + 1} color literal: ${line.trim().slice(0, 60)}`);
      }
    });
  }
  const phantoms = references.filter(
    ({ token }) => !vocabulary.has(token) && !local.has(token),
  );
  for (const { file, line, token } of phantoms) {
    problems.push(`${file}:${line} ${token} is not defined by the design system`);
  }
  for (const family of check.requireTokenFamilies ?? []) {
    const used = references.some(
      ({ token }) => token.startsWith(family) && vocabulary.has(token),
    );
    if (!used) problems.push(`no design-system ${family}* token referenced`);
  }
  return {
    pass: problems.length === 0,
    detail: problems.length
      ? problems.slice(0, 8).join(" | ")
      : `${references.length} token reference(s), 0 phantom, 0 color literals`,
    phantomCount: phantoms.length,
  };
}

export async function runCheck(worktree, check) {
  try {
    let outcome;
    switch (check.kind) {
      case "usage-scan":
        outcome = await usageScan(worktree, check);
        break;
      case "validate-clean":
      case "validate-no-finding":
        outcome = await validateCheck(worktree, check);
        break;
      case "vitest":
        outcome = await vitestCheck(worktree, check);
        break;
      case "source-scan":
        outcome = await sourceScan(worktree, check);
        break;
      case "token-discipline":
        outcome = await tokenDiscipline(worktree, check);
        break;
      default:
        outcome = { pass: false, detail: `unknown check kind ${check.kind}` };
    }
    return { id: check.id, kind: check.kind, ...outcome };
  } catch (error) {
    return {
      id: check.id,
      kind: check.kind,
      pass: false,
      detail: `grader error: ${error.message}`,
    };
  }
}

export async function gradeTask(worktree, task) {
  const acceptance = [];
  for (const check of task.acceptance) {
    acceptance.push(await runCheck(worktree, check));
  }
  const metrics = [];
  for (const metric of task.metrics ?? []) {
    const outcome = await runCheck(worktree, metric);
    metrics.push({ id: metric.id, value: outcome.pass, detail: outcome.detail });
  }
  return {
    pass: acceptance.every(({ pass }) => pass),
    acceptance,
    metrics,
  };
}
