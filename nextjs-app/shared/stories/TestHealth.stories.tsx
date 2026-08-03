import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import metrics from "../../../docs/test-metrics.json";
import styles from "./TestHealth.module.css";
import { useTranslation } from "react-i18next";
import Badge from "@dt/Badge";
import SentrySummaryCard from "@dt/SentrySummaryCard";
import Icon from "@dt/Icon";

type VisualDiffEntry = {
  id: string;
  actual: string;
  baseline: string;
  diff: string;
};

type VisualDiffReport = {
  generatedAt: string | null;
  diffs: VisualDiffEntry[];
};

type RunSummaryResponse = {
  runId: string;
  timestamp: string;
  branch?: string;
  metrics?: typeof metrics;
};

type Tone = "success" | "warning";

const num = (n: number) => Math.round(n).toLocaleString();
const formatPercent = (v: number) =>
  `${v.toLocaleString(undefined, {
    maximumFractionDigits: v % 1 === 0 ? 0 : 1,
  })}%`;
const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** A slim value bar with an optional target/threshold tick. */
function Meter({
  value,
  target,
  tone,
}: {
  value: number;
  target?: number;
  tone: Tone;
}) {
  return (
    <div className={styles.meter}>
      <span
        className={`${styles.meterFill} ${
          tone === "success" ? styles.meterFillSuccess : styles.meterFillWarning
        }`}
        style={{ inlineSize: `${clamp(value)}%` }}
      />
      {typeof target === "number" ? (
        <span
          className={styles.meterTarget}
          style={{ insetInlineStart: `${clamp(target)}%` }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

/** A pass/total KPI tile: big count, pass-rate meter, pass/fail split. */
function StatTile({
  label,
  total,
  passed,
  failed,
  t,
}: {
  label: string;
  total: number;
  passed: number;
  failed: number;
  t: (k: string, o?: Record<string, unknown>) => string;
}) {
  const rate = total > 0 ? (passed / total) * 100 : 100;
  const tone: Tone = failed > 0 ? "warning" : "success";
  return (
    <article className={styles.statTile}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{num(total)}</p>
      <Meter value={rate} tone={tone} />
      <div className={styles.statMeta}>
        <span className={styles.metaPass}>
          {num(passed)} {t("dashboardPassed")}
        </span>
        <span className={failed > 0 ? styles.metaFail : styles.metaMuted}>
          {num(failed)} {t("dashboardFailed")}
        </span>
        <span className={styles.metaRate}>
          {formatPercent(rate)} {t("dashboardPassRate")}
        </span>
      </div>
    </article>
  );
}

const TestHealthOverview = () => {
  const { t } = useTranslation();
  const [visualReport, setVisualReport] = useState<VisualDiffReport | null>(
    null,
  );
  const [visualError, setVisualError] = useState<string | null>(null);
  const [remoteMetrics, setRemoteMetrics] = useState<typeof metrics | null>(
    null,
  );
  const [runSummary, setRunSummary] = useState<RunSummaryResponse | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const loadVisualReport = async () => {
      try {
        const reportUrl = new URL(
          "visual-diff/report.json",
          document.baseURI,
        ).toString();
        const response = await fetch(reportUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as VisualDiffReport;
        if (!cancelled) {
          setVisualReport(payload);
          setVisualError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setVisualReport({ generatedAt: null, diffs: [] });
          setVisualError(error instanceof Error ? error.message : "unknown");
        }
      }
    };
    void loadVisualReport();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const controller = new AbortController();
    const loadRunSummary = async () => {
      try {
        const response = await fetch("/api/test-health/runs/latest", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as RunSummaryResponse;
        if (payload.metrics) setRemoteMetrics(payload.metrics);
        setRunSummary(payload);
        setDashboardError(null);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDashboardError(
            error instanceof Error ? error.message : "Unable to load metrics",
          );
        }
      }
    };
    void loadRunSummary();
    return () => {
      controller.abort();
    };
  }, []);

  const data = (remoteMetrics ?? metrics) as typeof metrics;

  const vitest = data.vitest ?? {
    totalSuites: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
  };
  const a11yPages = data.accessibilityPages ?? { total: 0, passed: 0, failed: 0 };
  const a11yStories =
    data.accessibilityStories ?? { total: 0, passed: 0, failed: 0 };
  const coverage = data.coverage?.summary ?? {
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
  };
  const thresholds = data.coverage?.thresholds ?? {
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
  };
  const adoption = data.componentAdoption ?? { currentRate: 0, targetRate: 0 };
  const d2d = data.designToImplementation ?? {
    averageDays: 0,
    p95Days: 0,
    targetDays: 0,
  };

  const coverageRows = [
    { key: "Lines", value: coverage.lines, threshold: thresholds.lines },
    {
      key: "Statements",
      value: coverage.statements,
      threshold: thresholds.statements,
    },
    { key: "Branches", value: coverage.branches, threshold: thresholds.branches },
    {
      key: "Functions",
      value: coverage.functions,
      threshold: thresholds.functions,
    },
  ];

  const totalFailures =
    (vitest.failedTests ?? 0) +
    (a11yPages.failed ?? 0) +
    (a11yStories.failed ?? 0);
  const coverageBelow = coverageRows.some((r) => r.value < r.threshold);
  const healthy = totalFailures === 0 && !coverageBelow;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const lastUpdatedValue =
    runSummary?.timestamp ?? data.generatedAt ?? metrics.generatedAt ?? null;
  const lastUpdatedDate = lastUpdatedValue ? new Date(lastUpdatedValue) : null;
  const isStale = lastUpdatedDate
    ? Date.now() - lastUpdatedDate.getTime() > 1000 * 60 * 60 * 24
    : true;
  const stalenessLabel = lastUpdatedDate
    ? formatDate(lastUpdatedValue ?? "")
    : t("dashboardUnknownTimestamp");

  const notices: string[] = [];
  if (isStale) notices.push(t("dashboardDataNoticeStale", { date: stalenessLabel }));
  if (dashboardError) notices.push(`Unable to refresh metrics: ${dashboardError}`);
  // Surface the checked-in fallback's provenance so the dashboard and the
  // generated JSON visibly report the same commit (health-freshness gate).
  const fallbackProvenance = (
    metrics as {
      provenance?: { sourceCommit?: string | null; workingTreeClean?: boolean };
    }
  ).provenance;
  if (fallbackProvenance?.sourceCommit) {
    notices.push(
      `Fallback metrics generated at commit ${fallbackProvenance.sourceCommit.slice(0, 9)}${
        fallbackProvenance.workingTreeClean === false ? " (dirty tree)" : ""
      }.`,
    );
  }

  const visualDiffCount = visualReport?.diffs.length ?? 0;
  const visualGeneratedAt =
    visualReport?.generatedAt && !visualError
      ? formatDate(visualReport.generatedAt)
      : null;

  const adoptionRate = adoption.currentRate * 100;
  const adoptionTarget = adoption.targetRate * 100;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1>{t("dashboardTitle")}</h1>
          <span
            className={`${styles.statusPill} ${
              healthy ? styles.statusPillOk : styles.statusPillWarn
            }`}
          >
            <span className={styles.statusDot} aria-hidden />
            {healthy
              ? t("dashboardStatusHealthy")
              : t("dashboardStatusAttention")}
          </span>
        </div>
        <p className={styles.subtitle}>{t("dashboardSubtitle")}</p>
        <p className={styles.updatedAt}>
          {t("dashboardLastUpdated", { date: stalenessLabel })}
          {runSummary
            ? ` · ${runSummary.runId}${
                runSummary.branch ? ` (${runSummary.branch})` : ""
              }`
            : ""}
        </p>
      </header>

      {notices.length > 0 ? (
        <aside className={styles.dataNotice} role="status">
          <Icon name="warning" decorative />
          <div>
            <p className={styles.dataNoticeHeading}>
              {t("dashboardDataNoticeHeading")}
            </p>
            <ul>
              {notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </div>
        </aside>
      ) : null}

      {/* KPI tiles */}
      <section className={styles.kpiGrid} aria-label={t("dashboardTitle")}>
        <StatTile
          label={t("dashboardTestsLabel")}
          total={vitest.totalTests ?? 0}
          passed={vitest.passedTests ?? 0}
          failed={vitest.failedTests ?? 0}
          t={t}
        />
        <StatTile
          label={t("dashboardA11yHeading")}
          total={a11yPages.total ?? 0}
          passed={a11yPages.passed ?? 0}
          failed={a11yPages.failed ?? 0}
          t={t}
        />
        <StatTile
          label={t("dashboardStorybookHeading")}
          total={a11yStories.total ?? 0}
          passed={a11yStories.passed ?? 0}
          failed={a11yStories.failed ?? 0}
          t={t}
        />
      </section>

      {/* Coverage + delivery */}
      <section className={styles.splitGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>{t("dashboardCoverageHeading")}</h2>
            <Badge variant="secondary">
              {vitest.totalSuites ?? 0} {t("dashboardSuites")}
            </Badge>
          </div>
          <ul className={styles.coverageMetrics}>
            {coverageRows.map((row) => (
              <li key={row.key} className={styles.coverageMetric}>
                <div className={styles.coverageMetricHeader}>
                  <span>{row.key}</span>
                  <span>{formatPercent(row.value)}</span>
                </div>
                <Meter
                  value={row.value}
                  target={row.threshold}
                  tone={row.value >= row.threshold ? "success" : "warning"}
                />
                <div className={styles.coverageMetricFooter}>
                  <span>
                    {t("dashboardCoverageTargetLabel", {
                      target: formatPercent(row.threshold),
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <div className={styles.miniStack}>
          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>{t("dashboardComponentAdoptionHeading")}</h2>
            </div>
            <p className={styles.bigStat}>{formatPercent(adoptionRate)}</p>
            <Meter
              value={adoptionRate}
              target={adoptionTarget}
              tone={adoptionRate >= adoptionTarget ? "success" : "warning"}
            />
            <p className={styles.miniFoot}>
              {t("dashboardComponentAdoptionTarget", {
                target: formatPercent(adoptionTarget),
              })}
            </p>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>{t("dashboardDesignToDevHeading")}</h2>
            </div>
            <p className={styles.bigStat}>
              {d2d.averageDays.toFixed(1)}
              <span className={styles.bigStatUnit}>d avg</span>
            </p>
            <Meter
              value={(d2d.averageDays / (d2d.targetDays || 1)) * 100}
              target={100}
              tone={d2d.averageDays <= d2d.targetDays ? "success" : "warning"}
            />
            <p className={styles.miniFoot}>
              p95 {d2d.p95Days.toFixed(1)}d ·{" "}
              {t("dashboardDesignToDevTarget", { days: d2d.targetDays })}
            </p>
          </article>
        </div>
      </section>

      {/* Visual regression */}
      <section className={styles.visualSection}>
        <header className={styles.visualHeader}>
          <div>
            <h2>{t("dashboardVisualHeading")}</h2>
            <p className={styles.visualSubtitle}>
              {t("dashboardVisualSubtitle")}
            </p>
          </div>
          <div className={styles.visualMeta}>
            <Badge
              variant="primary"
              tone={visualDiffCount > 0 ? "warning" : "success"}
            >
              {t("dashboardVisualChangeCount", { count: visualDiffCount })}
            </Badge>
            {visualGeneratedAt ? (
              <span className={styles.visualTimestamp}>
                {t("dashboardVisualLastRun", { date: visualGeneratedAt })}
              </span>
            ) : null}
            {visualError ? (
              <Badge
                variant="primary"
                tone="info"
                size="md"
                icon={<Icon name="info" ariaLabel="Info" />}
                title={visualError}
              >
                {t("dashboardVisualError")}
              </Badge>
            ) : null}
          </div>
        </header>

        {!visualReport ? (
          <div className={styles.visualPlaceholder}>
            <h3>{t("dashboardVisualLoadingTitle")}</h3>
            <p>{t("dashboardVisualLoadingBody")}</p>
          </div>
        ) : visualDiffCount === 0 ? (
          <div className={styles.visualPlaceholder}>
            <h3>{t("dashboardVisualNoChangesTitle")}</h3>
            <p>{t("dashboardVisualNoChangesBody")}</p>
          </div>
        ) : (
          <div className={styles.visualGrid}>
            {visualReport.diffs.map((diff) => (
              <article key={diff.id} className={styles.diffCard}>
                <header className={styles.diffHeader}>
                  <h3>{diff.id}</h3>
                </header>
                <div className={styles.diffImages}>
                  {(
                    [
                      ["baseline", diff.baseline, "dashboardVisualBaselineLabel", "dashboardVisualBaselineAlt"],
                      ["actual", diff.actual, "dashboardVisualCurrentLabel", "dashboardVisualCurrentAlt"],
                      ["diff", diff.diff, "dashboardVisualDiffLabel", "dashboardVisualDiffAlt"],
                    ] as const
                  ).map(([kind, src, labelKey, altKey]) => (
                    <figure key={kind} className={styles.diffFigure}>
                      <img
                        src={src}
                        alt={t(altKey, { story: diff.id })}
                        loading="lazy"
                      />
                      <figcaption className={styles.diffLabel}>
                        {t(labelKey)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Observability */}
      <section aria-label="Sentry Observability">
        <SentrySummaryCard
          dataOverride={{
            generatedAt: new Date().toISOString(),
            project: "frontend",
            filters: { unresolved: true, environment: "production" },
            count: 1,
            issues: [
              {
                id: "storybook-1",
                title: "TypeError: Cannot read property 'foo' of undefined",
                culprit: "TestHealthOverview",
                level: "error",
                userCount: 3,
                status: "unresolved",
                isUnhandled: true,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                permalink: "https://sentry.io/issue/storybook-1",
                environment: "production",
              },
            ],
          }}
        />
      </section>
    </div>
  );
};

const meta: Meta<typeof TestHealthOverview> = {
  title: "Overview/Test Health Overview",
  component: TestHealthOverview,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["00 Overview", ["Test Health Overview"], "Components"],
      },
    },
  },
};

export default meta;

export const Dashboard: StoryObj = { parameters: { a11y: { disable: true } } };
