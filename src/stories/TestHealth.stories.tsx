import React, { useMemo, useState, useEffect } from "react";
import type { Meta } from "@storybook/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import metrics from "../../docs/test-metrics.json";
import styles from "./TestHealth.module.css";
import { useTranslation } from "react-i18next";
import { useTheme } from "@dt/ThemeProvider";
import Badge from "@dt/Badge";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

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
  const [visualReport, setVisualReport] = useState<VisualDiffReport | null>(null);
  const [visualError, setVisualError] = useState<string | null>(null);

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
        const reportUrl = new URL("visual-diff/report.json", document.baseURI).toString();
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

  const vitestBarData = useMemo(
    () => ({
      labels: [
        t("dashboardTotalTests"),
        t("dashboardPassed"),
        t("dashboardFailed"),
      ],
      datasets: [
        {
          label: t("dashboardTestsLabel"),
          data: [
            metrics.vitest.totalTests,
            metrics.vitest.passedTests,
            metrics.vitest.failedTests,
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
    [chartPalette, t],
  );

  const a11yPieData = useMemo(
    () => ({
      labels: [t("dashboardPassed"), t("dashboardFailed")],
      datasets: [
        {
          data: [
            metrics.accessibilityPages.passed,
            metrics.accessibilityPages.failed,
          ],
          backgroundColor: [chartPalette.success, chartPalette.warning],
          borderWidth: 1,
        },
      ],
    }),
    [chartPalette, t],
  );

  const storiesPieData = useMemo(
    () => ({
      labels: [t("dashboardPassed"), t("dashboardFailed")],
      datasets: [
        {
          data: [
            metrics.accessibilityStories.passed,
            metrics.accessibilityStories.failed,
          ],
          backgroundColor: [chartPalette.success, chartPalette.warning],
          borderWidth: 1,
        },
      ],
    }),
    [chartPalette, t],
  );

  const chartOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            color: chartPalette.text,
            boxWidth: 12,
          },
        },
        tooltip: {
          backgroundColor: chartPalette.text,
          titleColor: chartPalette.surface,
          bodyColor: chartPalette.surface,
        },
      },
      scales: {
        x: {
          ticks: { color: chartPalette.text },
          grid: { display: false },
        },
        y: {
          ticks: { color: chartPalette.text },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
        },
      },
    }),
    [chartPalette],
  );

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

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>{t("dashboardTitle")}</h1>
        <p className={styles.subtitle}>{t("dashboardSubtitle")}</p>
        <p className={styles.updatedAt}>
          {t("dashboardLastUpdated", { date: formatDate(metrics.generatedAt) })}
        </p>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <h2>{t("dashboardVitestHeading")}</h2>
          <p>{t("dashboardVitestDescription")}</p>
          <div className={styles.badgeRow}>
            <Badge design="secondary">
              {metrics.vitest.totalSuites} {t("dashboardSuites")}
            </Badge>
            <Badge design="secondary">
              {metrics.vitest.totalTests} {t("dashboardTotalTests")}
            </Badge>
            <Badge design="primary" state="success">
              {metrics.vitest.passedTests} {t("dashboardPassed")}
            </Badge>
            <Badge design="primary" state="error">
              {metrics.vitest.failedTests} {t("dashboardFailed")}
            </Badge>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <h2>{t("dashboardA11yHeading")}</h2>
          <p>{t("dashboardA11yDescription")}</p>
          <div className={styles.badgeRow}>
            <Badge design="secondary">
              {metrics.accessibilityPages.total} {t("dashboardTotalRoutes")}
            </Badge>
            <Badge design="primary" state="success">
              {metrics.accessibilityPages.passed} {t("dashboardPassed")}
            </Badge>
            <Badge design="primary" state="error">
              {metrics.accessibilityPages.failed} {t("dashboardFailed")}
            </Badge>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <h2>{t("dashboardStorybookHeading")}</h2>
          <p>{t("dashboardStoriesDescription")}</p>
          <div className={styles.badgeRow}>
            <Badge design="secondary">
              {metrics.accessibilityStories.total} {t("dashboardTotalStories")}
            </Badge>
            <Badge design="primary" state="success">
              {metrics.accessibilityStories.passed} {t("dashboardPassed")}
            </Badge>
            <Badge design="primary" state="error">
              {metrics.accessibilityStories.failed} {t("dashboardFailed")}
            </Badge>
          </div>
        </article>
      </section>

      <section className={styles.chartsGrid}>
        <article className={styles.chartCard}>
          <h3>{t("dashboardVitestHeading")}</h3>
          <Bar data={vitestBarData} options={chartOptions} />
        </article>
        <article className={styles.chartCard}>
          <h3>{t("dashboardA11yHeading")}</h3>
          <Doughnut data={a11yPieData} options={chartOptions} />
        </article>
        <article className={styles.chartCard}>
          <h3>{t("dashboardStorybookHeading")}</h3>
          <Doughnut data={storiesPieData} options={chartOptions} />
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
              <span className={styles.visualError}>
                {t("dashboardVisualError")}
              </span>
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
    </div>
  );
};

const meta: Meta<typeof TestHealthOverview> = {
  title: "Overview/Test Health Overview",
  component: TestHealthOverview,
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

export const Dashboard = {};
Dashboard.parameters = {
  a11y: { disable: true },
};
