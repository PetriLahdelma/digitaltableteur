# Storybook Test Health Dashboard Outline

## Question: Vercel project
You can build the ingestion API and dashboard within the existing secure-proxy Vercel project. It already serves the frontend and could host the `/api/test-health` functions plus the Storybook dashboard story. No separate Vercel project is required (just add the necessary environment variables and secrets).

## Architecture
1. **Data store** – we now persist each run into Postgres via `test_health_runs` so the dashboard can show history. Run your migration:

   ```sql
   CREATE TABLE test_health_runs (
     run_id TEXT PRIMARY KEY,
     branch TEXT,
     status TEXT NOT NULL,
     metrics JSONB NOT NULL,
     inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

   Insert queries use `ON CONFLICT (run_id)` to keep the latest snapshot, and `GET /api/test-health/runs/latest` pulls the most recent `inserted_at`.  
2. **API Endpoints** – 
   - `POST /api/test-health/runs` expects the Vitest reporter JSON (plus optional `runId`) and stores a metrics snapshot after validating `X-Health-Token`.  
   - `GET /api/test-health/runs/latest` returns the most recent run + metrics for Storybook.  
   - The APIs read `TEST_HEALTH_DATABASE_URL` (Postgres connection string) and `HEALTH_DASHBOARD_TOKEN` from the environment; configure those in Vercel and your CI runner before enabling the ingestion workflow.
3. **CI Ingestion** – after `npm run test:coverage`, POST `coverage/vitest-report.json` to the ingestion endpoint using the shared secret in your CI secrets so every run lands in Postgres and can be shown in the dashboard.  
4. **Dashboard Story** – the existing Storybook dashboard (`TestHealthOverview`) now fetches `/api/test-health/runs/latest` and displays the live totals, falling back to the static `docs/test-metrics.json` when the endpoint is unavailable.

## CI snippet
```bash
curl -X POST https://your-app.vercel.app/api/test-health/runs \
  -H "Content-Type: application/json" \
  -H "X-Health-Token: $HEALTH_DASHBOARD_TOKEN" \
  --data-binary @coverage/vitest-report.json
```

Set `HEALTH_DASHBOARD_TOKEN` as a Vercel/GitHub secret and reuse the same token for the Storybook build (since the dashboard also hits `/api/test-health/runs/latest`). With Postgres in place already, the ingestion endpoint now persists every run to `test_health_runs`, giving you history for the dashboard.
