import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import defaultMetrics from "../../docs/test-metrics.json";
import { saveRun, type RunRecord } from "./db";

type VitestReport = {
  runId?: string;
  numTotalTestSuites?: number;
  numPassedTestSuites?: number;
  numFailedTestSuites?: number;
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  startTime?: number;
  endTime?: number;
  coverageMap?: Record<string, { s?: Record<string, number>; branchMap?: Record<string, unknown>; b?: Record<string, number[]>; fnMap?: Record<string, unknown>; f?: Record<string, number> }>;
};

const HEALTH_TOKEN = process.env.HEALTH_DASHBOARD_TOKEN;

const defaultCoverageSummary = defaultMetrics.coverage?.summary ?? {
  statements: 0,
  branches: 0,
  functions: 0,
  lines: 0,
};

const coverageFromMap = (coverageMap?: VitestReport["coverageMap"]) => {
  if (!coverageMap) return defaultCoverageSummary;

  let statementTotal = 0;
  let statementCovered = 0;
  let branchTotal = 0;
  let branchCovered = 0;
  let functionTotal = 0;
  let functionCovered = 0;

  for (const entry of Object.values(coverageMap)) {
    const statements = entry.s ?? {};
    statementTotal += Object.keys(statements).length;
    statementCovered += Object.values(statements).filter((value) => value > 0).length;

    const branches = entry.b ?? {};
    branchTotal += Object.keys(branches).length;
    branchCovered += Object.values(branches).filter((branchHits) =>
      branchHits.some((hit) => hit > 0),
    ).length;

    const functions = entry.f ?? {};
    functionTotal += Object.keys(functions).length;
    functionCovered += Object.values(functions).filter((value) => value > 0).length;
  }

  const percent = (covered: number, total: number) =>
    total > 0 ? (covered / total) * 100 : 0;

  return {
    statements: percent(statementCovered, statementTotal) || defaultCoverageSummary.statements,
    branches: percent(branchCovered, branchTotal) || defaultCoverageSummary.branches,
    functions: percent(functionCovered, functionTotal) || defaultCoverageSummary.functions,
    lines: percent(statementCovered, statementTotal) || defaultCoverageSummary.lines,
  };
};

const buildMetrics = (payload: VitestReport) => {
  const vitest = {
    totalSuites: payload.numTotalTestSuites ?? defaultMetrics.vitest.totalSuites,
    passedSuites: payload.numPassedTestSuites ?? defaultMetrics.vitest.passedSuites,
    failedSuites: payload.numFailedTestSuites ?? defaultMetrics.vitest.failedSuites,
    totalTests: payload.numTotalTests ?? defaultMetrics.vitest.totalTests,
    passedTests: payload.numPassedTests ?? defaultMetrics.vitest.passedTests,
    failedTests: payload.numFailedTests ?? defaultMetrics.vitest.failedTests,
    durationMs:
      typeof payload.startTime === "number" && typeof payload.endTime === "number"
        ? payload.endTime - payload.startTime
        : defaultMetrics.vitest.durationMs,
  };

  const coverageSummary = coverageFromMap(payload.coverageMap);

  return {
    ...defaultMetrics,
    generatedAt: new Date().toISOString(),
    vitest,
    coverage: {
      ...defaultMetrics.coverage,
      summary: coverageSummary,
    },
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providedToken = req.headers["x-health-token"];
  if (!HEALTH_TOKEN || providedToken !== HEALTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body as VitestReport;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Missing JSON payload" });
  }

  const runId =
    typeof payload.runId === "string"
      ? payload.runId
      : typeof randomUUID === "function"
      ? randomUUID()
      : `run-${Date.now()}`;

  const metrics = buildMetrics(payload);
  const stored: RunRecord = {
    runId,
    timestamp: new Date().toISOString(),
    status: "completed",
    metrics,
  };

  const branch =
    typeof payload.branch === "string"
      ? payload.branch
      : typeof req.headers["x-ci-branch"] === "string"
        ? req.headers["x-ci-branch"] as string
        : undefined;
  await saveRun({
    ...stored,
    branch,
  });

  return res.status(200).json({ status: "ok", runId });
}
