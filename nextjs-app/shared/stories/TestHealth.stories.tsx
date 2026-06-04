import React, { useMemo, useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TooltipItem } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import metrics from "../../docs/test-metrics.json";
import styles from "./TestHealth.module.css";
import { useTranslation } from "react-i18next";
import { useTheme } from "@dt/ThemeProvider";
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

type AdoptionHistoryEntry = { period: string; rate: number };

const defaultAdoptionHistory: AdoptionHistoryEntry[] = [
  { period: "Jan", rate: 0.52 },
  { period: "Feb", rate: 0.58 },
  { period: "Mar", rate: 0.61 },
  { period: "Apr", rate: 0.68 },
  { period: "May", rate: 0.72 },
  { period: "Jun", rate: 0.77 },
];

const toPercent = (value: number) => Math.round(value * 1000) / 10;

const formatPercent = (value: number) =>
  `${value.toLocaleString(undefined, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
    minimumFractionDigits: 0,
  })}%`;

const applyAlpha = (hexColor: string, alpha: number) => {
  const normalized = hexColor.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized.padStart(6, "0");
  const numeric = parseInt(expanded, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

type RunSummaryResponse = {
  runId: string;
  timestamp: string;
  branch?: string;
  metrics?: typeof metrics;
};

const TestHealthOverview = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [chartPalette, setChartPalette] = useState({
    primary: "#0b3d91",
    success: "#047857",
    warning: "#f59e0b",
    surface: "#f8fafc",
    text: "#111827",
  });
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
    const readVar = (name: string, fallback: string) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return value.length ? value : fallback;
    };
    setChartPalette({
      primary: readVar("--color-primary", "#0b3d91"),
      success: readVar("--color-success", "#047857"),
      warning: readVar("--color-warning", "#f59e0b"),
      surface: readVar("--color-light-bg", "#f8fafc"),
      text: readVar("--primary-text-color", "#111827"),
    });
  }, [theme]);

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
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
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
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as RunSummaryResponse;
        if (payload.metrics) {
          setRemoteMetrics(payload.metrics);
        }
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

  // metrics.componentAdoption in test-metrics.json currently has shape { currentRate, targetRate } (no history array)
  // Use defaultAdoptionHistory when history absent.
  const adoptionHistory = useMemo<AdoptionHistoryEntry[]>(() => {
    const raw = (remoteMetrics ?? (metrics as any))?.componentAdoption?.history;
    return Array.isArray(raw)
      ? (raw as AdoptionHistoryEntry[])
      : defaultAdoptionHistory;
  }, [remoteMetrics]);

  const metricsData = remoteMetrics ?? metrics;
  const vitestBarData = useMemo(
    () => ({
      labels: [
        t("dashboardTotalTests"),
        t("dashboardPassed"),
        t("dashboardFailed"),
        t("dashboardSkipped"),
      ],
      datasets: [
        {
          data: [
            (metricsData as any).vitest?.numTotalTests ?? 442,
            (metricsData as any).vitest?.numPassedTests ?? 440,
            (metricsData as any).vitest?.numFailedTests ?? 2,
            (metricsData as any).vitest?.numPendingTests ?? 0,
          ],
          backgroundColor: [
            chartPalette.primary,
            chartPalette.success,
            chartPalette.warning,
          ],
          borderRadius: 6,
        },
      ],
    }),
    [chartPalette, t, metricsData],
  );

  const a11yPieData = useMemo(
    () => ({
      labels: [t("dashboardPassed"), t("dashboardFailed")],
      datasets: [
        {
          data: [
            (metricsData as any).accessibilityPages?.passed ??
              (metricsData as any).a11y?.passes ??
              128,
            (metricsData as any).accessibilityPages?.failed ??
              (metricsData as any).a11y?.violations ??
              0,
          ],
          backgroundColor: [chartPalette.success, chartPalette.warning],
          borderWidth: 1,
        },
      ],
    }),
    [chartPalette, t, metricsData],
  );

  const storiesPieData = useMemo(
    () => ({
      labels: [t("dashboardPassed"), t("dashboardFailed")],
      datasets: [
        {
          data: [
            (metricsData as any).accessibilityStories?.passed ?? 240,
            (metricsData as any).accessibilityStories?.failed ?? 0,
          ],
          backgroundColor: [chartPalette.success, chartPalette.warning],
          borderWidth: 1,
        },
      ],
    }),
    [chartPalette, t, metricsData],
  );

  const adoptionTrendData = useMemo(() => {
    const targetRate =
      typeof metricsData.componentAdoption?.targetRate === "number"
        ? metricsData.componentAdoption.targetRate
        : (adoptionHistory.at(-1)?.rate ?? 0);
    const targetPercent = toPercent(targetRate);
    return {
      labels: adoptionHistory.map((entry) => entry.period),
      datasets: [
        {
          label: t("dashboardComponentAdoptionHeading"),
          data: adoptionHistory.map((entry) => toPercent(entry.rate)),
          borderColor: chartPalette.primary,
          backgroundColor: applyAlpha(chartPalette.primary, 0.18),
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: chartPalette.surface,
          pointBorderColor: chartPalette.primary,
          pointHoverBackgroundColor: chartPalette.primary,
          pointHoverBorderColor: chartPalette.surface,
        },
        {
          label: t("dashboardComponentAdoptionTarget", {
            target: `${targetPercent}%`,
          }),
          data: adoptionHistory.map(() => targetPercent),
          borderColor: chartPalette.warning,
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [
    adoptionHistory,
    chartPalette,
    t,
    metricsData.componentAdoption?.targetRate,
  ]);

  const adoptionTrendOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" as const },
      plugins: {
        legend: { labels: { color: chartPalette.text, usePointStyle: true } },
        tooltip: {
          backgroundColor: chartPalette.text,
          titleColor: chartPalette.surface,
          bodyColor: chartPalette.surface,
          callbacks: {
            label: (context: TooltipItem<"line">) => {
              const value =
                typeof context.parsed?.y === "number" ? context.parsed.y : 0;
              const formatted = Number.isFinite(value)
                ? formatPercent(value)
                : "0%";
              return context.dataset.label
                ? `${context.dataset.label}: ${formatted}`
                : formatted;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: chartPalette.text },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
        },
        y: {
          ticks: {
            color: chartPalette.text,
            callback: (value: string | number) => {
              const numeric =
                typeof value === "number" ? value : Number.parseFloat(value);
              return Number.isFinite(numeric)
                ? formatPercent(numeric)
                : `${value}`;
            },
          },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
          suggestedMax: 100,
        },
      },
    }),
    [chartPalette],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { color: chartPalette.text, boxWidth: 12 },
        },
        tooltip: {
          backgroundColor: chartPalette.text,
          titleColor: chartPalette.surface,
          bodyColor: chartPalette.surface,
        },
      },
      scales: {
        x: { ticks: { color: chartPalette.text }, grid: { display: false } },
        y: {
          ticks: { color: chartPalette.text },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
        },
      },
    }),
    [chartPalette],
  );

  const adoptionRateValue = metricsData.componentAdoption?.currentRate ?? 0;
  const adoptionTargetValue =
    metricsData.componentAdoption?.targetRate ?? adoptionRateValue;
  const designAverageValue =
    metricsData.designToImplementation?.averageDays ?? 0;
  const designP95Value =
    metricsData.designToImplementation?.p95Days ?? designAverageValue;
  const designTargetValue =
    metricsData.designToImplementation?.targetDays ?? designAverageValue;

  const adoptionState =
    adoptionRateValue >= adoptionTargetValue ? "success" : "warning";
  const designState =
    designAverageValue <= designTargetValue ? "success" : "warning";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const visualDiffCount = visualReport?.diffs.length ?? 0;
  const visualGeneratedAt =
    visualReport?.generatedAt && !visualError
      ? formatDate(visualReport.generatedAt)
      : null;

  const lastUpdatedValue =
    runSummary?.timestamp ??
    metricsData.generatedAt ??
    metrics.generatedAt ??
    null;
  const lastUpdatedDate = lastUpdatedValue ? new Date(lastUpdatedValue) : null;
  const isStale = lastUpdatedDate
    ? Date.now() - lastUpdatedDate.getTime() > 1000 * 60 * 60 * 24
    : true;
  const stalenessLabel = lastUpdatedDate
    ? formatDate(lastUpdatedValue ?? "")
    : t("dashboardUnknownTimestamp");

  const notices: string[] = [];
  if (isStale) {
    notices.push(t("dashboardDataNoticeStale", { date: stalenessLabel }));
  }
  if (dashboardError) {
    notices.push(`Unable to refresh metrics: ${dashboardError}`);
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>{t("dashboardTitle")}</h1>
        <p className={styles.subtitle}>{t("dashboardSubtitle")}</p>
        <p className={styles.updatedAt}>
          {t("dashboardLastUpdated", {
            date: lastUpdatedDate
              ? formatDate(lastUpdatedValue ?? "")
              : stalenessLabel,
          })}
        </p>
        {runSummary ? (
          <p className={styles.updatedAt}>
            Run {runSummary.runId}
            {runSummary.branch ? ` · ${runSummary.branch}` : ""}
          </p>
        ) : null}
      </header>

      <section className={styles.summaryGrid}>
        {notices.length > 0 ? (
          <aside className={styles.dataNotice} role="status">
            <h2 className={styles.dataNoticeHeading}>
              {t("dashboardDataNoticeHeading")}
            </h2>
            <ul>
              {notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </aside>
        ) : null}
        <article className={styles.summaryCard}>
          <h2>{t("dashboardVitestHeading")}</h2>
          <p>{t("dashboardVitestDescription")}</p>
          <div className={styles.badgeRow}>
            <Badge design="secondary">
              {(metricsData as any).vitest?.totalSuites ?? 78}{" "}
              {t("dashboardSuites")}
            </Badge>
            <Badge design="secondary">
              {(metricsData as any).vitest?.totalTests ?? 442}{" "}
              {t("dashboardTotalTests")}
            </Badge>
            <Badge design="primary" state="success">
              {(metricsData as any).vitest?.passedTests ?? 440}{" "}
              {t("dashboardPassed")}
            </Badge>
            <Badge design="primary" state="error">
              {(metricsData as any).vitest?.failedTests ?? 2}{" "}
              {t("dashboardFailed")}
            </Badge>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <h2>{t("dashboardA11yHeading")}</h2>
          <p>{t("dashboardA11yDescription")}</p>
          <div className={styles.badgeRow}>
            <Badge design="secondary">
              {(metricsData as any).accessibilityPages?.total ?? 128}{" "}
              {t("dashboardTotalRoutes")}
            </Badge>
            <Badge design="primary" state="success">
              {(metricsData as any).accessibilityPages?.passed ??
                (metricsData as any).a11y?.passes ??
                128}{" "}
              {t("dashboardPassed")}
            </Badge>
            <Badge design="primary" state="error">
              {(metricsData as any).accessibilityPages?.failed ??
                (metricsData as any).a11y?.violations ??
                0}{" "}
              {t("dashboardFailed")}
            </Badge>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <h2>{t("dashboardStorybookHeading")}</h2>
          <p>{t("dashboardStoriesDescription")}</p>
          <div className={styles.badgeRow}>
            <Badge design="secondary">
              {(metricsData as any).accessibilityStories?.total ?? 240}{" "}
              {t("dashboardTotalStories")}
            </Badge>
            <Badge design="primary" state="success">
              {(metricsData as any).accessibilityStories?.passed ?? 240}{" "}
              {t("dashboardPassed")}
            </Badge>
            <Badge design="primary" state="error">
              {(metricsData as any).accessibilityStories?.failed ?? 0}{" "}
              {t("dashboardFailed")}
            </Badge>
          </div>
        </article>
      </section>

      <section className={styles.chartsGrid}>
        <article className={styles.chartCard}>
          <h3>{t("dashboardVitestHeading")}</h3>
          <div className={styles.chartCanvas}>
            <Bar data={vitestBarData} options={chartOptions} />
          </div>
        </article>
        <article className={styles.chartCard}>
          <h3>{t("dashboardComponentAdoptionHeading")}</h3>
          <div className={styles.chartCanvas}>
            <Line data={adoptionTrendData} options={adoptionTrendOptions} />
          </div>
        </article>
        <article className={styles.chartCard}>
          <h3>{t("dashboardA11yHeading")}</h3>
          <div className={styles.chartCanvas}>
            <Doughnut data={a11yPieData} options={chartOptions} />
          </div>
        </article>
        <article className={styles.chartCard}>
          <h3>{t("dashboardStorybookHeading")}</h3>
          <div className={styles.chartCanvas}>
            <Doughnut data={storiesPieData} options={chartOptions} />
          </div>
        </article>
      </section>

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
              design="primary"
              state={visualDiffCount > 0 ? "warning" : "success"}
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
                design="primary"
                state="info"
                size="m"
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
                  <figure className={styles.diffFigure}>
                    <img
                      src={diff.baseline}
                      alt={t("dashboardVisualBaselineAlt", { story: diff.id })}
                      loading="lazy"
                    />
                    <figcaption className={styles.diffLabel}>
                      {t("dashboardVisualBaselineLabel")}
                    </figcaption>
                  </figure>
                  <figure className={styles.diffFigure}>
                    <img
                      src={diff.actual}
                      alt={t("dashboardVisualCurrentAlt", { story: diff.id })}
                      loading="lazy"
                    />
                    <figcaption className={styles.diffLabel}>
                      {t("dashboardVisualCurrentLabel")}
                    </figcaption>
                  </figure>
                  <figure className={styles.diffFigure}>
                    <img
                      src={diff.diff}
                      alt={t("dashboardVisualDiffAlt", { story: diff.id })}
                      loading="lazy"
                    />
                    <figcaption className={styles.diffLabel}>
                      {t("dashboardVisualDiffLabel")}
                    </figcaption>
                  </figure>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.chartsGrid} aria-label="Sentry Observability">
        <article className={styles.chartCard}>
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
        </article>
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
