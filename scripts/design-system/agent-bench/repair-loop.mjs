/**
 * Automatic validate → repair-guidance → revalidate loop (Astryx-gap
 * Phase 3). After an agent finishes, failing acceptance checks are turned
 * into concrete guidance — validate findings plus the relevant contract
 * lines — and the agent gets a bounded number of repair rounds. The loop is
 * arm-neutral: guidance comes from the same machine findings both arms are
 * graded with.
 */
import { component, validate } from "../../../packages/cli/src/api.mjs";
import { gradeTask } from "./grade.mjs";
import { runAgent } from "./harness.mjs";

async function guidanceFor(worktree, task, grade) {
  const lines = ["Your previous attempt does not meet acceptance yet."];
  const componentsToExplain = new Set();

  for (const check of grade.acceptance.filter(({ pass }) => !pass)) {
    lines.push(`\nFailed check "${check.id}" (${check.kind}):`);
    lines.push(check.detail);
    if (check.kind === "validate-clean" || check.kind === "validate-no-finding") {
      const scoped = task.acceptance.find((entry) => entry.id === check.id);
      const report = await validate(scoped.components ?? [], {
        cwd: worktree,
        path: scoped.path,
      }).catch(() => null);
      for (const finding of report?.data.findings ?? []) {
        lines.push(
          `- ${finding.file}:${finding.line ?? "?"} [${finding.severity}] ${finding.message}`,
        );
        componentsToExplain.add(finding.component);
      }
    }
  }

  for (const name of componentsToExplain) {
    const detail = await component(name, {
      cwd: worktree,
      section: "props",
    }).catch(() => null);
    if (detail) {
      lines.push(`\nContract for ${name}:`);
      lines.push(JSON.stringify(detail.data.props));
    }
  }

  lines.push(
    "\nFix the issues above, staying within the task's file scope, then finish.",
  );
  return lines.join("\n");
}

/**
 * Run up to `maxRounds` repair rounds. Returns the final grade plus the
 * per-round history so convergence is reportable.
 */
export async function repairLoop(worktree, task, initialGrade, options = {}) {
  const maxRounds = options.maxRounds ?? 2;
  const rounds = [];
  let grade = initialGrade;
  for (let round = 1; round <= maxRounds && !grade.pass; round += 1) {
    const guidance = await guidanceFor(worktree, task, grade);
    const metering = await runAgent(worktree, task, "claude", {
      ...options,
      prompt: guidance,
    });
    grade = await gradeTask(worktree, task);
    rounds.push({ round, metering, pass: grade.pass });
  }
  return { grade, rounds };
}
