import React from "react";

/**
 * Stub for `next/dynamic` under Vitest.
 * Does not invoke the loader — async imports after test teardown caused
 * EnvironmentTeardownError (Icon, EnhancedProjectCard, etc.).
 * Tests that need lazy-loaded UI should override with vi.mock("next/dynamic").
 */
export default function dynamic(
  _loader: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
) {
  function LoadableStub(_props: Record<string, unknown>) {
    return null;
  }
  LoadableStub.displayName = "LoadableMock";
  return LoadableStub;
}
