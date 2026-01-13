import { NextResponse } from "next/server";
import { fetchLatestRun } from "../../db";
// Import default metrics from the root docs directory
import defaultMetrics from "@/docs/test-metrics.json";
import { createCorsHeaders } from "../../../chat-shared";

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET handler for fetching the latest test run
export async function GET(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));

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
        headers: corsHeaders,
      },
    );
  }
  return NextResponse.json(latest, {
    status: 200,
    headers: corsHeaders,
  });
}
