import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Client Sentry initialises only in production builds: local dev stays
// noise-free and the SDK never runs during `next dev` (mirrors the server-side
// dev skip in instrumentation.ts). The DSN is public by design.
if (dsn && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    // Performance tracing for a 10% sample of sessions.
    tracesSampleRate: 0.1,
    // Session Replay: 10% of sessions, 100% of sessions that hit an error.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      // Replay must be added explicitly — the sample rates above do nothing
      // without this integration. Mask text + media for privacy (GDPR).
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    // Do not attach PII (IP, cookies) to events.
    sendDefaultPii: false,
  });
}

// Required so Sentry can instrument App Router client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
