import { spawn, execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const metricsPath = path.join(projectRoot, "docs", "test-metrics.json");
const designSystemPath = path.join(
  projectRoot,
  "docs",
  "design-system-report.json",
);
const coverageDir = path.join(projectRoot, "coverage");
const vitestReportPath = path.join(coverageDir, "vitest-report.json");
const coverageSummaryPath = path.join(coverageDir, "coverage-summary.json");

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(
          new Error(`${command} ${args.join(" ")} exited with code ${code}`),
        );
      }
    });
  });

const buildProvenance = () => {
  const git = (args) =>
    execFileSync("git", args, { cwd: projectRoot, encoding: "utf8" }).trim();
  try {
    return {
      sourceCommit: git(["rev-parse", "HEAD"]),
      workingTreeClean: git(["status", "--porcelain"]).length === 0,
      generator: { name: "build-test-metrics", node: process.version },
    };
  } catch {
    return null;
  }
};

const parseNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const loadPreviousMetrics = () => {
  try {
    if (fs.existsSync(metricsPath)) {
      return JSON.parse(fs.readFileSync(metricsPath, "utf8"));
    }
  } catch (error) {
    console.warn("Failed to read existing metrics file", error);
  }
  return null;
};

const ensureCoverageArtifacts = async () => {
  const hasReport = fs.existsSync(vitestReportPath);
  const hasSummary = fs.existsSync(coverageSummaryPath);
  if (hasReport && hasSummary) {
    return;
  }

  console.log(
    "[metrics] Coverage artifacts missing; running Vitest with coverage...",
  );
  fs.mkdirSync(coverageDir, { recursive: true });
  await runCommand("npx", [
    "vitest",
    "run",
    "--config",
    "vitest.config.mts",
    "--coverage",
    // Explicit coverage reporters: the config's list is not honored when the
    // run is invoked this way, and coverage-summary.json is required below.
    "--coverage.reporter=json-summary",
    "--coverage.reporter=lcov",
    "--reporter=json",
    `--outputFile=${vitestReportPath}`,
  ]);
};

const readCoverageSummary = () => {
  if (!fs.existsSync(coverageSummaryPath)) {
    throw new Error(
      `Coverage summary not found at ${coverageSummaryPath}. Did you run Vitest with coverage?`,
    );
  }
  return JSON.parse(fs.readFileSync(coverageSummaryPath, "utf8"));
};

const resolveCoverageThresholds = () => {
  const defaults = {
    statements: 65,
    branches: 75,
    functions: 65,
    lines: 65,
  };
  return Object.fromEntries(
    Object.entries(defaults).map(([metric, value]) => {
      const envKey = `COVERAGE_THRESHOLD_${metric.toUpperCase()}`;
      return [metric, parseNumber(process.env[envKey]) ?? value];
    }),
  );
};

const validateCoverage = (summary, thresholds) => {
  const totals = summary.total ?? {};
  const coveragePercentages = {
    statements: totals.statements?.pct ?? 0,
    branches: totals.branches?.pct ?? 0,
    functions: totals.functions?.pct ?? 0,
    lines: totals.lines?.pct ?? 0,
  };

  const violations = Object.entries(thresholds)
    .map(([metric, required]) => ({
      metric,
      required,
      actual: coveragePercentages[metric] ?? 0,
    }))
    .filter(({ actual, required }) => actual < required);

  if (violations.length > 0) {
    const message = violations
      .map(
        ({ metric, actual, required }) =>
          `${metric}: ${actual.toFixed(2)}% < required ${required}%`,
      )
      .join("; ");
    // Truthfulness over gating: the metrics artifact must always record the
    // real numbers, otherwise the checked-in fallback freezes at the last
    // passing run (observed: a November 2025 fallback surviving into August
    // 2026). Threshold failures are reported in the payload and only fail the
    // process under --enforce, for callers using this script as a gate.
    console.warn(`[metrics] Coverage below thresholds: ${message}`);
    if (process.argv.includes("--enforce")) {
      throw new Error(
        `Coverage below required thresholds. Please add or update tests. Details: ${message}`,
      );
    }
  }

  return { coveragePercentages, violations };
};

const generateMetrics = async () => {
  await ensureCoverageArtifacts();

  if (!fs.existsSync(vitestReportPath)) {
    throw new Error(
      `Vitest JSON report not found at ${vitestReportPath}. Coverage run likely failed.`,
    );
  }

  const report = JSON.parse(fs.readFileSync(vitestReportPath, "utf8"));
  const coverageSummary = readCoverageSummary();
  const coverageThresholds = resolveCoverageThresholds();
  const { coveragePercentages, violations: coverageViolations } =
    validateCoverage(coverageSummary, coverageThresholds);

  const vitestSummary = {
    totalSuites: report.numTotalTestSuites ?? 0,
    passedSuites: report.numPassedTestSuites ?? 0,
    failedSuites: report.numFailedTestSuites ?? 0,
    totalTests: report.numTotalTests ?? 0,
    passedTests: report.numPassedTests ?? 0,
    failedTests: report.numFailedTests ?? 0,
    durationMs:
      report.testResults?.reduce((sum, suite) => {
        const start = suite.startTime ?? 0;
        const end = suite.endTime ?? start;
        return sum + Math.max(0, end - start);
      }, 0) ?? 0,
  };

  const findSuiteMetrics = (predicate) => {
    const suite = report.testResults?.find((result) =>
      predicate(result.name ?? ""),
    );
    if (!suite) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
      };
    }

    const total = suite.assertionResults?.length ?? 0;
    const passed =
      suite.assertionResults?.filter(
        (assertion) => assertion.status === "passed",
      ).length ?? 0;
    const failed =
      suite.assertionResults?.filter(
        (assertion) => assertion.status === "failed",
      ).length ?? 0;

    return { total, passed, failed };
  };

  const accessibilityPages = findSuiteMetrics((name) =>
    name.includes("accessibility-pages"),
  );
  const accessibilityStories = findSuiteMetrics((name) =>
    name.includes("accessibility-stories"),
  );

  const previousMetrics = loadPreviousMetrics();

  if (!fs.existsSync(designSystemPath)) {
    throw new Error(
      "Design system report not found. Please provide docs/design-system-report.json with component usage and design cycle data.",
    );
  }

  const designSystem = JSON.parse(fs.readFileSync(designSystemPath, "utf8"));

  const adoptionConfig = designSystem.componentUsage ?? {};
  const designCycleConfig = designSystem.designCycle ?? {};

  const adoptionRateFromConfig = (() => {
    const totalViews = parseNumber(adoptionConfig.totalViews);
    const adoptedViews = parseNumber(adoptionConfig.adoptedViews);
    if (!totalViews || totalViews <= 0) {
      throw new Error(
        "componentUsage.totalViews must be a positive number in design-system-report.json",
      );
    }
    if (!adoptedViews || adoptedViews < 0) {
      throw new Error(
        "componentUsage.adoptedViews must be a non-negative number in design-system-report.json",
      );
    }
    return Math.min(1, Math.max(0, adoptedViews / totalViews));
  })();

  const adoptionRate =
    parseNumber(process.env.COMPONENT_ADOPTION_RATE) ?? adoptionRateFromConfig;
  const adoptionTarget =
    parseNumber(process.env.COMPONENT_ADOPTION_TARGET) ??
    parseNumber(adoptionConfig.targetRate) ??
    adoptionRate;

  const designCycleDurations = (() => {
    const records = Array.isArray(designCycleConfig.records)
      ? designCycleConfig.records
      : [];
    if (records.length === 0) {
      throw new Error(
        "designCycle.records must contain at least one entry in design-system-report.json",
      );
    }
    const durations = records
      .map((record) => {
        const start = new Date(
          record.designApproved ??
            record.designReady ??
            record.designPublished ??
            "",
        );
        const end = new Date(
          record.developmentComplete ?? record.implemented ?? "",
        );
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          throw new Error(
            `Invalid design cycle record: ${JSON.stringify(record)}. Expected ISO date strings for designApproved and developmentComplete.`,
          );
        }
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) {
          throw new Error(
            `Development complete date precedes design approval for record ${JSON.stringify(record)}`,
          );
        }
        return diffMs / (1000 * 60 * 60 * 24);
      })
      .filter((value) => Number.isFinite(value));

    if (durations.length === 0) {
      throw new Error("No valid design cycle durations could be computed.");
    }

    return durations;
  })();

  const computeAverage = (values) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const computePercentile = (values, percentile) => {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.ceil((percentile / 100) * sorted.length) - 1),
    );
    return sorted[index];
  };

  const designAverage =
    parseNumber(process.env.DESIGN_TO_IMPLEMENTATION_AVG_DAYS) ??
    computeAverage(designCycleDurations);
  const designP95 =
    parseNumber(process.env.DESIGN_TO_IMPLEMENTATION_P95_DAYS) ??
    computePercentile(designCycleDurations, 95);
  const designTarget =
    parseNumber(process.env.DESIGN_TO_IMPLEMENTATION_TARGET_DAYS) ??
    parseNumber(designCycleConfig.targetDays) ??
    designAverage;

  const metricsPayload = {
    generatedAt: new Date().toISOString(),
    provenance: buildProvenance(),
    vitest: vitestSummary,
    accessibilityPages,
    accessibilityStories,
    coverage: {
      summary: coveragePercentages,
      rawTotals: {
        statements: coverageSummary.total?.statements ?? null,
        branches: coverageSummary.total?.branches ?? null,
        functions: coverageSummary.total?.functions ?? null,
        lines: coverageSummary.total?.lines ?? null,
      },
      thresholds: coverageThresholds,
      thresholdStatus:
        coverageViolations.length === 0
          ? { ok: true, violations: [] }
          : { ok: false, violations: coverageViolations },
    },
    componentAdoption: {
      currentRate: adoptionRate,
      targetRate: adoptionTarget,
    },
    designToImplementation: {
      averageDays: designAverage,
      p95Days: designP95,
      targetDays: designTarget,
    },
  };

  fs.writeFileSync(
    metricsPath,
    `${JSON.stringify(metricsPayload, null, 2)}\n`,
    "utf8",
  );
  console.log(`Test metrics written to ${metricsPath}`);
};

generateMetrics().catch((error) => {
  console.error("Failed to build test metrics", error);
  process.exitCode = 1;
});
