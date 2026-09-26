import {
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@digitaltableteur/react";
import { Link as DtLink, List } from "@digitaltableteur/react";
import styles from "./agent.module.css";

type Stats = {
  mean: number;
  sd?: number | null;
  n?: number;
  min: number;
  max: number;
};

type ArmSummary = {
  runs: number;
  firstTryPass: number;
  finalPass: number;
  passViaRepairLoop: number;
  costUsdPerRun: Stats | null;
  dsReuse: { hits: number; eligible: number };
  affordanceUse?: {
    telemeteredRuns: number;
    runsCallingMcp: number;
    meanMcpCalls: number;
    runsCallingDtCli: number;
  };
  outputTokensPerRun?: Stats | null;
  failedChecks?: Record<string, number>;
  phantomTokenRefs?: Stats;
};

type ArmId = "with" | "mcp" | "mcp-pointer" | "without";

type FamilySummary = {
  id: string;
  label: string;
  runtime: string[];
  runs: number;
  arms: Partial<Record<ArmId, ArmSummary>>;
  tasks: AgentBenchArtifact["tasks"];
};

export type AgentBenchArtifact = {
  families?: FamilySummary[];
  generatedAt: string;
  methodology: string;
  runtime: string[];
  totalRuns: number;
  totalCostUsd: number;
  notes: string[];
  armLabels: Partial<Record<ArmId, string>>;
  arms: Partial<Record<ArmId, ArmSummary>>;
  tasks: {
    id: string;
    category: string;
    arms: Partial<Record<ArmId, ArmSummary>>;
  }[];
};

const ARM_ORDER: ArmId[] = ["with", "mcp", "mcp-pointer", "without"];
const ARM_SHORT: Record<ArmId, string> = {
  with: "WITH",
  mcp: "MCP",
  "mcp-pointer": "MCP + POINTER",
  without: "WITHOUT",
};

const firstTry = (arm?: ArmSummary) =>
  arm ? `${arm.firstTryPass}/${arm.runs}` : "n/a";
const finalPass = (arm?: ArmSummary) =>
  arm
    ? `${arm.finalPass}/${arm.runs}${
        arm.passViaRepairLoop > 0 ? ` (${arm.passViaRepairLoop} via repair)` : ""
      }`
    : "n/a";
const reuse = (arm?: ArmSummary) =>
  arm && arm.dsReuse.eligible > 0
    ? `${arm.dsReuse.hits}/${arm.dsReuse.eligible}`
    : "n/a";
const cost = (arm?: ArmSummary) =>
  arm?.costUsdPerRun
    ? `$${arm.costUsdPerRun.mean.toFixed(2)}${
        arm.costUsdPerRun.sd != null ? ` ± ${arm.costUsdPerRun.sd.toFixed(2)}` : ""
      }`
    : arm?.outputTokensPerRun
      ? `subscription, ${Math.round(arm.outputTokensPerRun.mean / 100) / 10}k output tokens`
      : "n/a";
const affordance = (arm?: ArmSummary) => {
  const use = arm?.affordanceUse;
  if (!use) return "n/a";
  return `MCP ${use.runsCallingMcp}/${use.telemeteredRuns}, dt CLI ${use.runsCallingDtCli}/${use.telemeteredRuns}`;
};

/**
 * Measured benchmark distributions, rendered verbatim from the generated
 * public/ds-health/agent-bench.json artifact. Numbers on this page are never
 * hand-written.
 */
export function AgentBenchSection({
  artifact,
}: {
  artifact: AgentBenchArtifact;
}) {
  const arms = ARM_ORDER.filter((arm) => artifact.arms[arm]);
  // Older artifacts have one family; present them the same way.
  const families: FamilySummary[] = artifact.families ?? [
    {
      id: "claude",
      label: "Claude Code",
      runtime: artifact.runtime,
      runs: artifact.totalRuns,
      arms: artifact.arms,
      tasks: artifact.tasks,
    },
  ];
  const perArmRuns = artifact.tasks[0]?.arms[arms[0]]?.runs ?? "?";
  return (
    <section className="mt-12">
      <Title level={2} size="s">
        Agent benchmark
      </Title>
      <Text as="p" size="s" lineHeight="relaxed" className={styles.lede}>
        The same coding agent on the same tasks, in {arms.length} arms that
        differ in one thing only: how the design system is offered to it.{" "}
        {artifact.totalRuns} published runs across{" "}
        {families.map((family) => family.label).join(" and ")}. Metered spend
        on these runs: ${artifact.totalCostUsd.toFixed(2)}; subscription runs
        report output tokens instead, and spend on superseded runs is in the
        notes. Acceptance tests user-visible
        semantics and contract conformance, not implementation; reuse of{" "}
        <code className="text-xs">@dt/*</code> is reported separately and
        never gates a pass. Methodology:{" "}
        <code className="text-xs">{artifact.methodology}</code>.
      </Text>

      <List
        items={arms.map((arm) => artifact.armLabels[arm] ?? ARM_SHORT[arm])}
        listStyleType="disc"
        size="xs"
        lineHeight="relaxed"
        className={styles.notes}
      />

      {families.map((family) => (
        <div key={family.id} className={styles.tableScroll}>
          <Table
            caption={`${family.label}: ${family.runtime[0] ?? ""} (${family.runs} runs)`}
            size="sm"
          >
            <thead>
              <TableRow>
                <TableHeaderCell>Arm</TableHeaderCell>
                <TableHeaderCell>First-try pass</TableHeaderCell>
                <TableHeaderCell>Final pass (repair loop)</TableHeaderCell>
                <TableHeaderCell>Mean cost / run</TableHeaderCell>
                <TableHeaderCell>Affordance used</TableHeaderCell>
                <TableHeaderCell>DS reuse (build tasks)</TableHeaderCell>
              </TableRow>
            </thead>
            <tbody>
              {ARM_ORDER.filter((arm) => family.arms[arm]).map((arm) => (
                <TableRow key={arm}>
                  <TableCell>{ARM_SHORT[arm]}</TableCell>
                  <TableCell>{firstTry(family.arms[arm])}</TableCell>
                  <TableCell>{finalPass(family.arms[arm])}</TableCell>
                  <TableCell>{cost(family.arms[arm])}</TableCell>
                  <TableCell>{affordance(family.arms[arm])}</TableCell>
                  <TableCell>{reuse(family.arms[arm])}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      ))}

      <div className={styles.tableScroll}>
        <Table caption="Agent benchmark first-try pass per task (Claude Code)" size="sm">
          <thead>
            <TableRow>
              <TableHeaderCell>Task</TableHeaderCell>
              {arms.map((arm) => (
                <TableHeaderCell key={arm}>{ARM_SHORT[arm]}</TableHeaderCell>
              ))}
              <TableHeaderCell>
                DS reuse ({arms.map((arm) => ARM_SHORT[arm]).join(" / ")})
              </TableHeaderCell>
            </TableRow>
          </thead>
          <tbody>
            {artifact.tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.category}</TableCell>
                {arms.map((arm) => (
                  <TableCell key={arm}>{firstTry(task.arms[arm])}</TableCell>
                ))}
                <TableCell>
                  {arms.map((arm) => reuse(task.arms[arm])).join(" / ")}
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
        </DtLink>
        . n={perArmRuns} per arm per task; cost is mean ± sample sd. Runs are
        nondeterministic, so treat single deltas as noise and distributions
        as the signal. The earlier two-arm batch (August 2026, 90 runs,
        different isolation) is archived at{" "}
        <DtLink href="/ds-health/agent-bench-2026-08.json" size="sm">
          /ds-health/agent-bench-2026-08.json
        </DtLink>
        .
      </Text>
    </section>
  );
}
