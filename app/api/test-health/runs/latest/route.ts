import { NextResponse } from "next/server";
import { fetchLatestRun } from "../../db";
// Import default metrics from the root docs directory
import defaultMetrics from "@/docs/test-metrics.json";

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// GET handler for fetching the latest test run
export async function GET() {
  const latest = await fetchLatestRun();
  if (!latest) {
    return NextResponse.json(
      {
        runId: "placeholder",
        timestamp: new Date().toISOString(),
        branch: "main",
        status: "pending",
        metrics: defaultMetrics,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
  return NextResponse.json(latest, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
