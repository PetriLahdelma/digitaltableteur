import {
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@digitaltableteur/react";
import DtLink from "@dt/Link";
import List from "@dt/List";
import styles from "./agent.module.css";

type ArmSummary = {
  runs: number;
  firstTryPass: number;
  finalPass: number;
  passViaRepairLoop: number;
  costUsdPerRun: {
    mean: number;
    sd?: number | null;
    min: number;
    max: number;
  } | null;
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
      <Title level={2} size="s">
        Agent benchmark (A/B)
      </Title>
      <Text as="p" size="s" lineHeight="relaxed" className={styles.lede}>
        The same coding agent, twice per task: WITH the design-system
        affordances documented in its workspace vs WITHOUT (identical
        repository access). {artifact.totalRuns} runs, {artifact.runtime[0]},{" "}
        total spend ${artifact.totalCostUsd.toFixed(2)}. Acceptance tests
        semantics, not implementation — reuse of <code className="text-xs">@dt/*</code>{" "}
        is reported separately. Methodology:{" "}
        <code className="text-xs">{artifact.methodology}</code>.
      </Text>

      <div className={styles.tableScroll}>
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
                    ? `$${arms[arm].costUsdPerRun.mean.toFixed(2)}${
                        arms[arm].costUsdPerRun.sd != null
                          ? ` ± ${arms[arm].costUsdPerRun.sd.toFixed(2)}`
                          : ""
                      }`
                    : "—"}
                </TableCell>
                <TableCell>{reuse(arms[arm])}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <div className={styles.tableScroll}>
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

      <List
        items={artifact.notes}
        listStyleType="disc"
        size="xs"
        lineHeight="relaxed"
        className={styles.notes}
      />
      <Text as="p" size="xs" className={styles.footnote}>
        Raw artifact:{" "}
        <DtLink href="/ds-health/agent-bench.json" size="sm">
          /ds-health/agent-bench.json
        </DtLink>{" "}
        · n={tasks[0]?.with.runs ?? "?"} per arm per task; cost is mean ±
        sample sd. Runs are nondeterministic, so treat single deltas as noise
        and distributions as the signal.
      </Text>
    </section>
  );
}
