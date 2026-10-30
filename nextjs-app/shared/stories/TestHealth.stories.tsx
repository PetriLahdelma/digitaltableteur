import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Code from "@dt/Code";
import CodeBlock from "@dt/CodeBlock";
import StatusDot from "@dt/StatusDot";
import metrics from "../../../docs/test-metrics.json";
import {
  GuideFacts,
  GuideGaps,
  GuidePage,
  GuideSection,
  GuideTable,
} from "../../../.storybook/blocks/guide/GuidePage";
import {
  a11yFigures,
  formatDate,
  usageFigures,
} from "../../../.storybook/blocks/guide/guideData";

/**
 * Test health: a dated snapshot of the last full local run, read from
 * docs/test-metrics.json at build time. CI is not the source of truth here,
 * so the page says when and from which commit the figures were taken instead
 * of pretending to be live.
 */

type CoverageMetric = "lines" | "statements" | "functions" | "branches";
const COVERAGE_METRICS: CoverageMetric[] = [
  "lines",
  "statements",
  "functions",
  "branches",
];

const label = (metric: CoverageMetric) =>
  metric.charAt(0).toUpperCase() + metric.slice(1);

const percent = (value: number) => `${value.toFixed(1)}%`;

function Verdict({ ok }: { ok: boolean }) {
  return (
    <StatusDot tone={ok ? "success" : "warning"} size="md">
      {ok ? "Meets target" : "Below target"}
    </StatusDot>
  );
}

const TestHealthOverview = () => {
  const { vitest, coverage, accessibilityPages, provenance } = metrics;
  const commit = provenance?.sourceCommit?.slice(0, 9);
  const belowTarget = COVERAGE_METRICS.filter(
    (metric) => coverage.summary[metric] < coverage.thresholds[metric],
  );

  return (
    <GuidePage
      kicker="Overview"
      title="Test health"
      lede={
        <>
          A snapshot of the last full local run, taken {formatDate(metrics.generatedAt)}
          {commit ? (
            <>
              {" "}
              at commit <Code size="inherit">{commit}</Code>
            </>
          ) : null}
          . The local gate is the source of truth, so these figures are dated
          rather than live.
        </>
      }
    >
      <GuideFacts
        facts={[
          {
            value: vitest.passedTests.toLocaleString("en-GB"),
            of: vitest.totalTests.toLocaleString("en-GB"),
            label: "Tests passing",
            note: `${vitest.failedTests} failing, in ${vitest.totalSuites.toLocaleString("en-GB")} suites`,
          },
          {
            value: percent(coverage.summary.lines),
            label: "Line coverage",
            note: `Target ${coverage.thresholds.lines}%`,
          },
          {
            value: accessibilityPages.passed,
            of: accessibilityPages.total,
            label: "Site pages passing axe",
          },
          {
            value: a11yFigures.accessibilityTree,
            of: a11yFigures.total,
            label: "Components with verified accessibility trees",
          },
        ]}
      />

      <GuideSection
        title="Coverage"
        intro="Vitest coverage across the shared components, patterns and libraries, against the thresholds in vitest.config.mts."
      >
        <GuideTable
          caption="Coverage against thresholds"
          columns={["Metric", "Covered", "Target", "Result"]}
          rows={COVERAGE_METRICS.map((metric) => [
            label(metric),
            percent(coverage.summary[metric]),
            `${coverage.thresholds[metric]}%`,
            <Verdict
              key={metric}
              ok={coverage.summary[metric] >= coverage.thresholds[metric]}
            />,
          ])}
        />
      </GuideSection>

      <GuideSection
        title="Accessibility"
        intro="Page checks run axe against the built site. Component checks are recorded in each contract when its evidence is captured."
      >
        <GuideTable
          caption="Accessibility checks"
          columns={["Check", "Result"]}
          rows={[
            [
              "Site pages (axe)",
              `${accessibilityPages.passed} of ${accessibilityPages.total} passing`,
            ],
            [
              "Reviewed accessibility record",
              `${a11yFigures.reviewed} of ${a11yFigures.total} components`,
            ],
            [
              "Forced colours in a real browser",
              `${a11yFigures.realBrowserForcedColors} of ${a11yFigures.total} components`,
            ],
          ]}
        />
      </GuideSection>

      <GuideSection
        title="Package consumption"
        intro={`From the component usage report of ${formatDate(usageFigures.generatedAt)}.`}
      >
        <GuideTable
          caption="Package consumption"
          columns={["Measure", "Components"]}
          rows={[
            [
              "Imported directly from @digitaltableteur/react",
              `${usageFigures.strictConsumedCount} of ${usageFigures.governedCount}`,
            ],
            [
              "Rendered on a production page",
              `${usageFigures.transitiveConsumedCount} of ${usageFigures.governedCount}`,
            ],
            [
              "Exported from the package",
              `${usageFigures.exportedCount} of ${usageFigures.governedCount}`,
            ],
          ]}
        />
      </GuideSection>

      {belowTarget.length > 0 ? (
        <GuideSection title="Needs attention">
          <GuideGaps
            items={belowTarget.map(
              (metric) =>
                `${label(metric)} coverage is ${percent(coverage.summary[metric])}, below the ${coverage.thresholds[metric]}% target.`,
            )}
          />
        </GuideSection>
      ) : null}

      <GuideSection
        title="Refresh the snapshot"
        intro="Run the full suite with coverage, then rebuild Storybook. The usage report has its own command."
      >
        <CodeBlock
          language="bash"
          copyable
          code={[
            "node scripts/build-test-metrics.mjs   # tests, coverage and axe page results",
            "npm run report:component-usage        # package consumption",
          ].join("\n")}
        />
      </GuideSection>
    </GuidePage>
  );
};

const meta: Meta<typeof TestHealthOverview> = {
  title: "Overview/Test health",
  component: TestHealthOverview,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", wip: { disabled: true } },
};

export default meta;

export const Dashboard: StoryObj<typeof TestHealthOverview> = {
  render: () => <TestHealthOverview />,
};
