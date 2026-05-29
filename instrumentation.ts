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
