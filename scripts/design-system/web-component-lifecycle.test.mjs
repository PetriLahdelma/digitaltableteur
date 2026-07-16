import { describe, expect, it } from "vitest";
import { validateImplementationLifecycle } from "./web-component-lifecycle.mjs";

const contract = { status: "stable" };
const base = {
  tagName: "dt-example",
  contract: "Example",
  implementationStatus: "beta",
  implementationConsumers: [],
};

describe("web-component implementation lifecycle", () => {
  it("allows a beta implementation of a stable canonical contract", () => {
    expect(() => validateImplementationLifecycle(base, contract)).not.toThrow();
  });

  it("rejects implementation maturity above the canonical contract", () => {
    expect(() =>
      validateImplementationLifecycle(
        { ...base, implementationStatus: "stable" },
        { status: "beta" },
      ),
    ).toThrow(/cannot exceed canonical/);
  });

  it("rejects stable without a production consumer", () => {
    expect(() =>
      validateImplementationLifecycle(
        { ...base, implementationStatus: "stable" },
        contract,
      ),
    ).toThrow(/production implementationConsumer/);
  });

  it("rejects stable without native accessibility evidence", () => {
    expect(() =>
      validateImplementationLifecycle(
        {
          ...base,
          implementationStatus: "stable",
          implementationConsumers: [
            { repo: "acme/app", path: "src/page.ts", since: "2026-07-16" },
          ],
        },
        contract,
      ),
    ).toThrow(/accessibility-tree/);
  });

  it("accepts stable with canonical, accessibility, and production evidence", () => {
    expect(() =>
      validateImplementationLifecycle(
        {
          ...base,
          implementationStatus: "stable",
          implementationConsumers: [
            { repo: "acme/app", path: "src/page.ts", since: "2026-07-16" },
          ],
          implementationA11y: {
            accessibilityTreeVerified: true,
            realBrowserForcedColorsVerified: true,
          },
        },
        contract,
      ),
    ).not.toThrow();
  });
});
