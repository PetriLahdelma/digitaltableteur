import { Pool } from "pg";

const connectionString = process.env.TEST_HEALTH_DATABASE_URL;
const pool = connectionString ? new Pool({ connectionString }) : null;

export type RunRecord = {
  runId: string;
  branch?: string;
  status: "pending" | "completed";
  timestamp: string;
  metrics: Record<string, unknown>;
};

export const saveRun = async (record: RunRecord): Promise<boolean> => {
  if (!pool) {
    console.warn(
      "TEST_HEALTH_DATABASE_URL is not configured; skipping run persistence.",
    );
    return false;
  }
  const query = `
    INSERT INTO test_health_runs (run_id, branch, status, metrics, inserted_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (run_id)
    DO UPDATE SET branch = EXCLUDED.branch, status = EXCLUDED.status, metrics = EXCLUDED.metrics, inserted_at = NOW();
  `;
  try {
    await pool.query(query, [
      record.runId,
      record.branch ?? null,
      record.status,
      record.metrics,
    ]);
    return true;
  } catch (error) {
    console.error("Failed to persist test run:", error);
    return false;
  }
};

export const fetchLatestRun = async (): Promise<RunRecord | null> => {
  if (!pool) {
    return null;
  }
  try {
    const result = await pool.query(
      "SELECT run_id, branch, status, metrics, inserted_at FROM test_health_runs ORDER BY inserted_at DESC LIMIT 1;",
    );
    if (!result.rows.length) {
      return null;
    }
    const row = result.rows[0];
    return {
      runId: row.run_id,
      branch: row.branch ?? undefined,
      status: row.status,
      timestamp: new Date(row.inserted_at).toISOString(),
      metrics: row.metrics,
    };
  } catch (error) {
    console.error("Failed to read latest test run:", error);
    return null;
  }
};
