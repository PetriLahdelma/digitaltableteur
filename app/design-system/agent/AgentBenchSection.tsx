import { Table } from "../../../nextjs-app/shared/components/Table/Table";
import { TableRow } from "../../../nextjs-app/shared/components/TableRow/TableRow";
import { TableHeaderCell } from "../../../nextjs-app/shared/components/TableHeaderCell/TableHeaderCell";
import { TableCell } from "../../../nextjs-app/shared/components/TableCell/TableCell";

type ArmSummary = {
  runs: number;
  firstTryPass: number;
  finalPass: number;
  passViaRepairLoop: number;
  costUsdPerRun: { mean: number; min: number; max: number } | null;
  dsReuse: { hits: number; eligible: number };
};

export type AgentBenchArtifact = {
  generatedAt: string;
  methodology: string;
  runtime: string[];
  totalRuns: number;
  totalCostUsd: number;
  notes: string[];
  arms: { with: ArmSummary; without: ArmSummary };
  tasks: {
    id: string;
    category: string;
    with: ArmSummary;
    without: ArmSummary;
  }[];
};

const passRate = (arm: ArmSummary) => `${arm.finalPass}/${arm.runs}`;
const reuse = (arm: ArmSummary) =>
  arm.dsReuse.eligible > 0
    ? `${arm.dsReuse.hits}/${arm.dsReuse.eligible}`
    : "—";
const repairNote = (arm: ArmSummary) =>
  arm.passViaRepairLoop > 0 ? ` (${arm.passViaRepairLoop} via repair)` : "";

/**
 * Measured A/B benchmark distributions, rendered verbatim from the
 * generated public/ds-health/agent-bench.json artifact — numbers on this
 * page are never hand-written.
 */
export function AgentBenchSection({
  artifact,
}: {
  artifact: AgentBenchArtifact;
}) {
  const { arms, tasks } = artifact;
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold">
        Agent benchmark (A/B)
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The same coding agent, twice per task: WITH the design-system
        affordances documented in its workspace vs WITHOUT (identical
        repository access). {artifact.totalRuns} runs, {artifact.runtime[0]},{" "}
        total spend ${artifact.totalCostUsd.toFixed(2)}. Acceptance tests
        semantics, not implementation — reuse of <code className="text-xs">@dt/*</code>{" "}
        is reported separately. Methodology:{" "}
        <code className="text-xs">{artifact.methodology}</code>.
      </p>

      <div className="mt-4 overflow-x-auto">
        <Table caption="Agent benchmark arm summary" size="sm">
          <thead>
            <TableRow>
              <TableHeaderCell>Arm</TableHeaderCell>
              <TableHeaderCell>First-try pass</TableHeaderCell>
              <TableHeaderCell>Final pass (repair loop)</TableHeaderCell>
              <TableHeaderCell>Mean cost / run</TableHeaderCell>
              <TableHeaderCell>DS reuse (build tasks)</TableHeaderCell>
            </TableRow>
          </thead>
          <tbody>
            {(["with", "without"] as const).map((arm) => (
              <TableRow key={arm}>
                <TableCell>{arm === "with" ? "WITH" : "WITHOUT"}</TableCell>
                <TableCell>
                  {arms[arm].firstTryPass}/{arms[arm].runs}
                </TableCell>
                <TableCell>
                  {passRate(arms[arm])}
                  {repairNote(arms[arm])}
                </TableCell>
                <TableCell>
                  {arms[arm].costUsdPerRun
                    ? `$${arms[arm].costUsdPerRun.mean.toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell>{reuse(arms[arm])}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table caption="Agent benchmark per task" size="sm">
          <thead>
            <TableRow>
              <TableHeaderCell>Task</TableHeaderCell>
              <TableHeaderCell>WITH</TableHeaderCell>
              <TableHeaderCell>WITHOUT</TableHeaderCell>
              <TableHeaderCell>DS reuse (with / without)</TableHeaderCell>
            </TableRow>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.category}</TableCell>
                <TableCell>
                  {passRate(task.with)}
                  {repairNote(task.with)}
                </TableCell>
                <TableCell>
                  {passRate(task.without)}
                  {repairNote(task.without)}
                </TableCell>
                <TableCell>
                  {reuse(task.with)} / {reuse(task.without)}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
        {artifact.notes.map((note) => (
          <li key={note.slice(0, 40)}>{note}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Raw artifact:{" "}
        <a
          href="/ds-health/agent-bench.json"
          className="underline underline-offset-2"
        >
          /ds-health/agent-bench.json
        </a>{" "}
        · n=3 per arm per task; runs are nondeterministic, so treat single
        deltas as noise and distributions as the signal.
      </p>
    </section>
  );
}
