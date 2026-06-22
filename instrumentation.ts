import type { Instrumentation } from "next";

export async function register() {
  // Sentry + OpenTelemetry add ~4s to every cold compile and pull 300+ modules
  // into the instrumentation graph. Skip in local dev.
  if (process.env.NODE_ENV === "development") {
    return;
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  } else {
    await import("./sentry.server.config");
  }
}

// Capture errors thrown while rendering Server Components, route handlers, and
// other server code (Next's App Router error hook). Sentry is imported lazily
// and skipped in dev so it never enters the dev instrumentation graph.
export const onRequestError: Instrumentation.onRequestError = async (
  ...args
) => {
  if (process.env.NODE_ENV === "development") return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
