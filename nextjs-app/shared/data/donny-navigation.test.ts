import { describe, expect, it } from "vitest";
import { resolveDonnyNavigationPath } from "./donny-navigation";

describe("resolveDonnyNavigationPath", () => {
  it("resolves pricing-related phrases to /pricing", () => {
    expect(resolveDonnyNavigationPath("pricing")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("prices")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("the prices")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("show me the prices")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("show me packages")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("/pricing")).toBe("/pricing");
  });

  it("resolves other site pages", () => {
    expect(resolveDonnyNavigationPath("work")).toBe("/work");
    expect(resolveDonnyNavigationPath("show me the portfolio")).toBe("/work");
    expect(resolveDonnyNavigationPath("contact")).toBe("/contact");
    expect(resolveDonnyNavigationPath("/contact")).toBe("/contact");
  });

  it("falls back to project routes", () => {
    expect(resolveDonnyNavigationPath("SAP")).toBe("/work/sap-build-apps");
    expect(resolveDonnyNavigationPath("show me vertaaux")).toBe("/work/vertaaux");
  });
});
