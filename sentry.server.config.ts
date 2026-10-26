import * as Sentry from "@sentry/nextjs";
import { dataCollection } from "./sentry.data-collection";
import { dropMcpClientRequestNoise } from "./sentry.mcp-noise";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sendClientReports: true,
    enabled: true,
    // No PII; see sentry.data-collection.ts.
    dataCollection,
    // v11 attaches a synthetic stack trace to captureMessage() events, which
    // regroups the security and guardrail messages. Keep the v10 grouping.
    attachStacktrace: false,
    // Malformed requests to the public MCP endpoint are client errors, not
    // server faults; see sentry.mcp-noise.ts.
    beforeSend: dropMcpClientRequestNoise,
  });
}
