import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DONNY_PAGE_ROUTES, resolveDonnyNavigationPath } from "./donny-navigation";

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

  it("does not pass through paths that are not pages", () => {
    expect(resolveDonnyNavigationPath("/services")).toBe("/#services");
    expect(resolveDonnyNavigationPath("/no-such-page")).toBeNull();
    expect(resolveDonnyNavigationPath("/work/sap-build-apps")).toBe("/work/sap-build-apps");
    expect(resolveDonnyNavigationPath("/pricing#calculator")).toBe("/pricing#calculator");
  });

  it("lists only routes that exist as pages", () => {
    for (const route of DONNY_PAGE_ROUTES) {
      expect(existsSync(join(process.cwd(), "app", route, "page.tsx")), route).toBe(true);
    }
  });

  it("resolves services and Finnish/Swedish page names", () => {
    for (const q of ["services page", "our services", "palvelut", "Palvelut", "palvelusivu", "tjänster"]) {
      expect(resolveDonnyNavigationPath(q), q).toBe("/#services");
    }
    expect(resolveDonnyNavigationPath("service packages")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("hinnoittelu")).toBe("/pricing");
    expect(resolveDonnyNavigationPath("yhteystiedot")).toBe("/contact");
    expect(resolveDonnyNavigationPath("työt")).toBe("/work");
    expect(resolveDonnyNavigationPath("priser")).toBe("/pricing");
  });
});

