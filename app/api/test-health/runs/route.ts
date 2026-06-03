import { NextRequest, NextResponse } from "next/server";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { saveRun, type RunRecord } from "../db";
// Import default metrics from the root docs directory
import defaultMetrics from "@/docs/test-metrics.json";
import { createCorsHeaders } from "../../chat-shared";

type VitestReport = {
  runId?: string;
  branch?: string;
  numTotalTestSuites?: number;
  numPassedTestSuites?: number;
  numFailedTestSuites?: number;
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  startTime?: number;
  endTime?: number;
  coverageMap?: Record<
    string,
    {
      s?: Record<string, number>;
      branchMap?: Record<string, unknown>;
      b?: Record<string, number[]>;
      fnMap?: Record<string, unknown>;
      f?: Record<string, number>;
    }
  >;
};

const HEALTH_TOKEN = process.env.HEALTH_DASHBOARD_TOKEN;

/**
 * Constant-time string comparison to prevent timing attacks.
 * Pads both strings to the same length to avoid leaking length information.
 */
function constantTimeCompare(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length, 1);
  const bufA = Buffer.alloc(maxLen);
  const bufB = Buffer.alloc(maxLen);
  Buffer.from(a, "utf8").copy(bufA);
  Buffer.from(b, "utf8").copy(bufB);
  return timingSafeEqual(bufA, bufB) && a.length === b.length;
}

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
    statementCovered += Object.values(statements).filter(
      (value) => value > 0,
    ).length;

    const branches = entry.b ?? {};
    branchTotal += Object.keys(branches).length;
    branchCovered += Object.values(branches).filter((branchHits) =>
      branchHits.some((hit) => hit > 0),
    ).length;

    const functions = entry.f ?? {};
    functionTotal += Object.keys(functions).length;
    functionCovered += Object.values(functions).filter(
      (value) => value > 0,
    ).length;
  }

  const percent = (covered: number, total: number) =>
    total > 0 ? (covered / total) * 100 : 0;

  return {
    statements:
      percent(statementCovered, statementTotal) ||
      defaultCoverageSummary.statements,
    branches:
      percent(branchCovered, branchTotal) || defaultCoverageSummary.branches,
    functions:
      percent(functionCovered, functionTotal) ||
      defaultCoverageSummary.functions,
    lines:
      percent(statementCovered, statementTotal) || defaultCoverageSummary.lines,
  };
};

const buildMetrics = (payload: VitestReport) => {
  const vitest = {
    totalSuites:
      payload.numTotalTestSuites ?? defaultMetrics.vitest.totalSuites,
    passedSuites:
      payload.numPassedTestSuites ?? defaultMetrics.vitest.passedSuites,
    failedSuites:
      payload.numFailedTestSuites ?? defaultMetrics.vitest.failedSuites,
    totalTests: payload.numTotalTests ?? defaultMetrics.vitest.totalTests,
    passedTests: payload.numPassedTests ?? defaultMetrics.vitest.passedTests,
    failedTests: payload.numFailedTests ?? defaultMetrics.vitest.failedTests,
    durationMs:
      typeof payload.startTime === "number" &&
      typeof payload.endTime === "number"
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

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Headers":
        "Content-Type, X-Health-Token, X-CI-Branch",
    },
  });
}

// POST handler for submitting test runs
export async function POST(request: NextRequest) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));

  const providedToken = request.headers.get("x-health-token");
  if (
    !HEALTH_TOKEN ||
    !providedToken ||
    !constantTimeCompare(providedToken, HEALTH_TOKEN)
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }

  let payload: VitestReport;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400, headers: corsHeaders },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Missing JSON payload" },
      { status: 400, headers: corsHeaders },
    );
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
      : (request.headers.get("x-ci-branch") ?? undefined);

  await saveRun({
    ...stored,
    branch,
  });

  return NextResponse.json(
    { status: "ok", runId },
    {
      status: 200,
      headers: corsHeaders,
    },
  );
}
