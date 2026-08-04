/**
 * Benchmark harness: disposable worktrees, arm setup, and agent drivers.
 *
 * Arms (the fairness design — see docs/AGENT_BENCH_METHODOLOGY.md):
 * - "with":    the workspace CLAUDE.md points the agent at the design-system
 *              affordances (dt CLI, contracts, agent registry).
 * - "without": the workspace CLAUDE.md is generic. Same repository, same
 *              task, same budget — only the affordance POINTER differs; the
 *              artifacts themselves are not hidden, because deleting them
 *              would change the codebase under test.
 *
 * Agents:
 * - "null":   does nothing (graders must fail — discrimination floor)
 * - "oracle": applies the reference solution (graders must pass — ceiling)
 * - "claude": pinned headless Claude Code runtime with token metering
 */
import { execFile } from "node:child_process";
import { mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BASE_RULES = `# Benchmark workspace

Complete the task described in TASK.md at the repository root.

Rules:
- Only modify the files the task puts in scope.
- Do not run git commands that change history (commit, push, rebase).
- Do not start dev servers or Storybook.
`;

const WITH_AFFORDANCES = `
## Design-system affordances

This repository ships a component design system with machine-readable
contracts and a CLI:

- \`node packages/cli/src/cli.mjs search "<intent>"\` — find components
- \`node packages/cli/src/cli.mjs component <Name>\` — contract, props, usage
- \`node packages/cli/src/cli.mjs example <Name>\` — runnable story sources
- \`node packages/cli/src/cli.mjs validate [--path <dir>]\` — check usage
  against contracts (exit 2 on violations)
- \`node packages/cli/src/cli.mjs upgrade --from <ref> --path <dir> --write\`
  — codemod consumers across contract changes
- \`node packages/cli/src/cli.mjs diff [Component] --from <ref>\` — classify
  contract changes

Components are imported as \`import X from "@dt/<Name>"\` (see each
component's contract for the exact import line). Prefer reusing design-system
components over hand-rolling markup, and validate your work before finishing.
`;

export async function createWorktree(repoRoot) {
  const dir = await mkdtemp(join(tmpdir(), "dt-bench-"));
  const worktree = join(dir, "wt");
  await execFileAsync(
    "git",
    ["worktree", "add", "--detach", worktree, "HEAD"],
    { cwd: repoRoot },
  );
  await symlink(join(repoRoot, "node_modules"), join(worktree, "node_modules"));
  return {
    worktree,
    async destroy() {
      await execFileAsync(
        "git",
        ["worktree", "remove", "--force", worktree],
        { cwd: repoRoot },
      ).catch(() => {});
    },
  };
}

export async function prepareWorkspace(worktree, task, arm) {
  await task.prep(worktree);
  await writeFile(join(worktree, "TASK.md"), `# ${task.title}\n\n${task.brief}\n`);
  await writeFile(
    join(worktree, "CLAUDE.md"),
    arm === "with" ? BASE_RULES + WITH_AFFORDANCES : BASE_RULES,
  );
}

/** Drive one agent over a prepared workspace. Returns metering info. */
export async function runAgent(worktree, task, agent, options = {}) {
  if (agent === "null") {
    return { agent, turns: 0, costUsd: 0, durationMs: 0 };
  }
  if (agent === "oracle") {
    const startedAt = Date.now();
    await task.oracle(worktree);
    return { agent, turns: 0, costUsd: 0, durationMs: Date.now() - startedAt };
  }
  if (agent !== "claude") {
    throw new Error(`Unknown agent "${agent}"`);
  }
  const prompt =
    options.prompt ??
    "Complete the task described in TASK.md at the repository root.";
  const args = [
    "-p",
    prompt,
    "--output-format",
    "json",
    "--max-turns",
    String(options.maxTurns ?? 30),
    "--model",
    options.model ?? "claude-sonnet-5",
    "--dangerously-skip-permissions",
  ];
  const startedAt = Date.now();
  const { stdout } = await execFileAsync("claude", args, {
    cwd: worktree,
    maxBuffer: 64 * 1024 * 1024,
    timeout: options.timeoutMs ?? 20 * 60 * 1000,
  });
  let parsed = null;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    // fall through with raw output preserved
  }
  return {
    agent,
    model: options.model ?? "claude-sonnet-5",
    turns: parsed?.num_turns ?? null,
    costUsd: parsed?.total_cost_usd ?? null,
    usage: parsed?.usage ?? null,
    durationMs: Date.now() - startedAt,
    isError: parsed?.is_error ?? false,
    resultTail:
      typeof parsed?.result === "string" ? parsed.result.slice(-400) : null,
  };
}
