/**
 * Benchmark harness: disposable worktrees, arm setup, and agent drivers.
 *
 * Arms (the fairness design — see docs/AGENT_BENCH_METHODOLOGY.md):
 * - "with":    the workspace CLAUDE.md points the agent at the design-system
 *              affordances (dt CLI, contracts, agent registry).
 * - "mcp":     the workspace CLAUDE.md is the generic control text; the only
 *              difference is the design-system MCP server attached over
 *              stdio. Its tool descriptions and server instructions ARE the
 *              affordance, which is what any design system can ship.
 * - "mcp-pointer": the mcp arm plus ONE line in the workspace CLAUDE.md
 *              naming the server. Isolates "does the agent know it exists?"
 * - "without": the workspace CLAUDE.md is generic. Same repository, same
 *              task, same budget — only the affordance POINTER differs; the
 *              artifacts themselves are not hidden, because deleting them
 *              would change the codebase under test.
 *
 * Isolation (v2, 2026-09): every paid run passes --strict-mcp-config and
 * --setting-sources project,local, so the operator's user-level CLAUDE.md,
 * skills, plugins, hooks and MCP servers never reach the agent. v1 runs
 * (2026-08) loaded them in both arms: symmetric, but not reproducible by a
 * third party.
 *
 * Agents:
 * - "null":   does nothing (graders must fail — discrimination floor)
 * - "oracle": applies the reference solution (graders must pass — ceiling)
 * - "naive":  applies a plausible-but-wrong solution (graders must fail —
 *             proves a task discriminates beyond "did nothing")
 * - "claude": pinned headless Claude Code runtime with token metering
 */
import { execFile, spawn } from "node:child_process";
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

// The mcp-pointer arm's whole difference from the mcp arm: one line.
const MCP_POINTER = `
This repository's design system is available through the \`design-system\` MCP server; use its tools to find components and validate usage before finishing.
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
  // Arms may run as parallel processes; git serialises worktree metadata
  // with lock files, so retry briefly on lock contention.
  for (let attempt = 1; ; attempt += 1) {
    try {
      await execFileAsync(
        "git",
        ["worktree", "add", "--detach", worktree, "HEAD"],
        { cwd: repoRoot },
      );
      break;
    } catch (error) {
      if (attempt >= 6 || !/lock/i.test(String(error.stderr ?? error))) throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1500 * attempt));
    }
  }
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
    arm === "with"
      ? BASE_RULES + WITH_AFFORDANCES
      : arm === "mcp-pointer"
        ? BASE_RULES + MCP_POINTER
        : BASE_RULES,
  );
}

/** MCP config for the "mcp" arm: the repo's own stdio design-system server. */
async function writeMcpConfig(worktree) {
  const dir = await mkdtemp(join(tmpdir(), "dt-bench-mcp-"));
  const path = join(dir, "mcp.json");
  await writeFile(
    path,
    JSON.stringify({
      mcpServers: {
        "design-system": {
          command: join(worktree, "node_modules/.bin/tsx"),
          args: [join(worktree, "scripts/design-system/ds-mcp-stdio.ts")],
          env: { DT_REPO_ROOT: worktree },
        },
      },
    }),
  );
  return path;
}

/**
 * Run the CLI with stream-json so tool use is observable per run, and keep
 * the final result envelope for metering. Never rejects: non-zero exits
 * (e.g. error_max_turns) still carry valid benchmark data.
 */
function runClaude(args, { cwd, timeoutMs }) {
  return new Promise((resolvePromise) => {
    const child = spawn("claude", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const toolCalls = {};
    let result = null;
    let mcpServers = [];
    let buffer = "";
    const consume = (line) => {
      if (!line.trim()) return;
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        return;
      }
      if (event.type === "result") result = event;
      if (event.type === "system" && event.subtype === "init") {
        mcpServers = event.mcp_servers ?? [];
      }
      if (event.type === "assistant") {
        for (const block of event.message?.content ?? []) {
          if (block.type !== "tool_use") continue;
          const name =
            block.name === "Bash" &&
            /packages\/cli\/src\/cli\.mjs|\bdt\s/.test(block.input?.command ?? "")
              ? "Bash(dt-cli)"
              : block.name;
          toolCalls[name] = (toolCalls[name] ?? 0) + 1;
        }
      }
    };
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let index;
      while ((index = buffer.indexOf("\n")) >= 0) {
        consume(buffer.slice(0, index));
        buffer = buffer.slice(index + 1);
      }
    });
    const timer = setTimeout(() => child.kill("SIGTERM"), timeoutMs);
    child.on("close", () => {
      clearTimeout(timer);
      consume(buffer);
      resolvePromise({ result, toolCalls, mcpServers });
    });
  });
}

/** Drive one agent over a prepared workspace. Returns metering info. */
export async function runAgent(worktree, task, agent, options = {}) {
  if (agent === "null") {
    return { agent, turns: 0, costUsd: 0, durationMs: 0 };
  }
  if (agent === "oracle" || agent === "naive") {
    const apply = agent === "oracle" ? task.oracle : task.naive;
    if (!apply) throw new Error(`Task ${task.id} has no ${agent} solution`);
    const startedAt = Date.now();
    await apply(worktree);
    return { agent, turns: 0, costUsd: 0, durationMs: Date.now() - startedAt };
  }
  if (agent !== "claude") {
    throw new Error(`Unknown agent "${agent}"`);
  }
  const prompt =
    options.prompt ??
    "Complete the task described in TASK.md at the repository root.";
  const model = options.model ?? "claude-sonnet-5";
  const args = [
    "-p",
    prompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--max-turns",
    String(options.maxTurns ?? 30),
    "--model",
    model,
    "--dangerously-skip-permissions",
    "--strict-mcp-config",
    "--setting-sources",
    "project,local",
  ];
  if (options.arm === "mcp" || options.arm === "mcp-pointer") {
    args.push("--mcp-config", await writeMcpConfig(worktree));
  }
  const startedAt = Date.now();
  const { result: parsed, toolCalls, mcpServers } = await runClaude(args, {
    cwd: worktree,
    timeoutMs: options.timeoutMs ?? 20 * 60 * 1000,
  });
  return {
    agent,
    model,
    isolation: "strict-mcp-config;setting-sources=project,local",
    toolCalls,
    mcpServers,
    turns: parsed?.num_turns ?? null,
    costUsd: parsed?.total_cost_usd ?? null,
    usage: parsed?.usage ?? null,
    durationMs: Date.now() - startedAt,
    isError: parsed?.is_error ?? false,
    terminalReason: parsed?.terminal_reason ?? null,
    resultTail:
      typeof parsed?.result === "string" ? parsed.result.slice(-400) : null,
  };
}
