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
      // `blockAllMedia` does not cover iframes; block them too so rrweb never
      // hooks the load of cross-origin frames (the Cal.com booking embed on
      // /contact threw "Blocked a frame with origin ... from accessing a
      // cross-origin frame" from inside the recorder, 120 events).
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
        block: ["iframe"],
      }),
    ],
    // Do not attach PII (IP, cookies) to events.
    sendDefaultPii: false,
    // Third-party noise that is not ours to fix. Browser extensions inject
    // scripts (e.g. `executors/200.js` reading `M_ID`) and Microsoft
    // Outlook/Edge SafeLinks previews reject with "Object Not Found Matching
    // Id"; none of it originates from our bundles.
    ignoreErrors: [
      /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/,
      /Blocked a frame with origin .* from accessing a cross-origin frame/,
      /Cannot read properties of undefined \(reading 'M_ID'\)/,
    ],
    denyUrls: [
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^safari(-web)?-extension:\/\//i,
      /\/executors\/\d+\.js$/i,
    ],
  });
}

// Required so Sentry can instrument App Router client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
