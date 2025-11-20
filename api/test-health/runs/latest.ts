import type { VercelRequest, VercelResponse } from "@vercel/node";
import defaultMetrics from "../../../docs/test-metrics.json";
import { fetchLatestRun } from "../db";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const latest = await fetchLatestRun();
  if (!latest) {
    return res.status(200).json({
      runId: "placeholder",
      timestamp: new Date().toISOString(),
      branch: "main",
      status: "pending",
      metrics: defaultMetrics,
    });
  }
  return res.status(200).json(latest);
}
