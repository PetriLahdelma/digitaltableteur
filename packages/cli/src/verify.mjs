import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { loadRegistry } from "./data.mjs";
import { DtCliError, ERROR_CODES } from "./errors.mjs";
import { validate } from "./validate.mjs";

const execFileAsync = promisify(execFile);

const COMPONENT_ROOTS = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/components/animations",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];

export const VERIFY_CHECKS = ["contract", "usage", "tests", "types"];

async function repoRootFor(cwd) {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["rev-parse", "--show-toplevel"],
      { cwd },
    );
    return stdout.trim();
  } catch {
    throw new DtCliError(
      "dt verify runs scoped repository checks and needs to run inside the design-system repository.",
      ERROR_CODES.GIT_CONTEXT_UNAVAILABLE,
    );
  }
}

async function componentDir(repoRoot, name) {
  for (const root of COMPONENT_ROOTS) {
    const dir = join(repoRoot, root, name);
    try {
      await access(join(dir, `${name}.contract.json`), constants.R_OK);
      return { dir, relative: `${root}/${name}` };
    } catch {
      // try the next root
    }
  }
  return null;
}

function tail(text, lines = 12) {
  return String(text ?? "")
    .trim()
    .split("\n")
    .slice(-lines)
    .join("\n");
}

async function timed(run) {
  const startedAt = Date.now();
  const result = await run();
  return { ...result, durationMs: Date.now() - startedAt };
}

/**
 * Scoped verification for one or more components: the contract exists and
 * parses, consumer usage passes `dt validate`, the component's own tests
 * pass (rendered proof), and the repository typechecks (compiled proof).
 * Every check reports pass/fail with evidence; `verified` is true only when
 * nothing failed. Individual checks can be skipped with --skip.
 */
export async function verify(names = [], options = {}) {
  if (!names || names.length === 0) {
    throw new DtCliError(
      "Provide at least one component name, e.g. `dt verify Badge`.",
      ERROR_CODES.MISSING_ARGUMENT,
    );
  }
  const skip = new Set(
    String(options.skip ?? "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean),
  );
  for (const token of skip) {
    if (!VERIFY_CHECKS.includes(token)) {
      throw new DtCliError(
        `Unknown check "${token}". Valid checks: ${VERIFY_CHECKS.join(", ")}.`,
        ERROR_CODES.INVALID_ARGUMENT,
      );
    }
  }
  const repoRoot = await repoRootFor(options.cwd ?? process.cwd());
  const { docsRegistry } = await loadRegistry(options);
  const registry = docsRegistry.components ?? {};

  const components = [];
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
    components.push(canonical);
  }

  const checks = [];

  if (!skip.has("contract")) {
    for (const name of components) {
      checks.push(
        await timed(async () => {
          const located = await componentDir(repoRoot, name);
          if (!located) {
            return {
              id: "contract",
              component: name,
              status: "fail",
              detail: `No ${name}.contract.json found under the component roots.`,
            };
          }
          try {
            const contract = JSON.parse(
              await readFile(
                join(located.dir, `${name}.contract.json`),
                "utf8",
              ),
            );
            return {
              id: "contract",
              component: name,
              status: "pass",
              detail: `${located.relative} [${contract.status}] group=${contract.group}`,
            };
          } catch (error) {
            return {
              id: "contract",
              component: name,
              status: "fail",
              detail: `Contract does not parse: ${error.message}`,
            };
          }
        }),
      );
    }
  }

  if (!skip.has("usage")) {
    checks.push(
      await timed(async () => {
        try {
          const report = await validate(components, {
            cwd: options.cwd,
            path: options.path,
            dataDirectory: options.dataDirectory,
          });
          const { errors, warnings } = report.data.summary;
          return {
            id: "usage",
            status: errors === 0 ? "pass" : "fail",
            detail: `${report.data.usages} usage(s), ${errors} error(s), ${warnings} warning(s)${
              errors > 0
                ? `: ${report.data.findings
                    .filter(({ severity }) => severity === "error")
                    .slice(0, 3)
                    .map(
                      ({ file, line, message }) => `${file}:${line} ${message}`,
                    )
                    .join(" | ")}`
                : ""
            }`,
          };
        } catch (error) {
          return {
            id: "usage",
            status: "fail",
            detail: `dt validate errored: ${error.message}`,
          };
        }
      }),
    );
  }

  if (!skip.has("tests")) {
    checks.push(
      await timed(async () => {
        const dirs = [];
        for (const name of components) {
          const located = await componentDir(repoRoot, name);
          if (located) dirs.push(located.relative);
        }
        if (dirs.length === 0) {
          return {
            id: "tests",
            status: "fail",
            detail: "No component directories resolved for a scoped test run.",
          };
        }
        try {
          const { stdout } = await execFileAsync(
            "npx",
            ["vitest", "run", ...dirs],
            { cwd: repoRoot, maxBuffer: 32 * 1024 * 1024 },
          );
          const summary =
            stdout.split("\n").find((line) => line.includes("Tests ")) ?? "";
          return {
            id: "tests",
            status: "pass",
            detail: summary.trim() || `vitest run ${dirs.join(" ")} passed`,
          };
        } catch (error) {
          return {
            id: "tests",
            status: "fail",
            detail: tail(`${error.stdout ?? ""}\n${error.stderr ?? ""}`),
          };
        }
      }),
    );
  }

  if (!skip.has("types")) {
    checks.push(
      await timed(async () => {
        try {
          await execFileAsync("npm", ["run", "-s", "typecheck"], {
            cwd: repoRoot,
            maxBuffer: 32 * 1024 * 1024,
          });
          return {
            id: "types",
            status: "pass",
            detail: "Repository typecheck (next typegen + tsc --noEmit) clean.",
          };
        } catch (error) {
          return {
            id: "types",
            status: "fail",
            detail: tail(`${error.stdout ?? ""}\n${error.stderr ?? ""}`),
          };
        }
      }),
    );
  }

  const failed = checks.filter(({ status }) => status === "fail");
  return {
    type: "verify.report",
    data: {
      components,
      skipped: [...skip].sort(),
      checks,
      verified: failed.length === 0,
      summary: {
        pass: checks.length - failed.length,
        fail: failed.length,
        durationMs: checks.reduce(
          (total, check) => total + check.durationMs,
          0,
        ),
      },
    },
  };
}
