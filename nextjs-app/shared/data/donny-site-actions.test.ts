import { describe, expect, it } from "vitest";

import {
  DONNY_SITE_TARGETS,
  donnyTargetSelector,
  getDonnyTarget,
  getDonnyTargetByPackageId,
  getDonnyProjectTargetId,
  getDonnyTargetCatalog,
  getDonnyTargetsByIntent,
  getDonnyTargetsByRoute,
  isDonnyTargetId,
  isSafeDonnyRoute,
  isStaticDonnySelector,
  resolveDonnyTargetFromNavigationUrl,
  validateDonnySiteRegistry,
  type DonnyTargetId,
} from "./donny-site-actions";

describe("donny-site-actions", () => {
  it("passes registry validation with no errors", () => {
    expect(validateDonnySiteRegistry()).toEqual([]);
  });

  it("uses unique target ids", () => {
    const ids = DONNY_SITE_TARGETS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("requires internal routes only", () => {
    for (const entry of DONNY_SITE_TARGETS) {
      expect(entry.route.startsWith("/")).toBe(true);
      expect(isSafeDonnyRoute(entry.route)).toBe(true);
    }
  });

  it("requires static selectors", () => {
    for (const entry of DONNY_SITE_TARGETS) {
      expect(isStaticDonnySelector(entry.selector)).toBe(true);
      expect(entry.selector).toBe(donnyTargetSelector(entry.id));
    }
  });

  it("resolves targets by id, route, and intent", () => {
    expect(getDonnyTarget("pricing.packages")?.route).toBe("/pricing");
    expect(getDonnyTargetsByRoute("/pricing").map((entry) => entry.id)).toContain(
      "pricing.package.designSystemLiftOff",
    );
    expect(getDonnyTargetsByIntent("contact").map((entry) => entry.id)).toContain(
      "contact.form",
    );
  });

  it("maps consulting package ids to pricing targets", () => {
    expect(getDonnyTargetByPackageId("design-system-lift-off")?.id).toBe(
      "pricing.package.designSystemLiftOff",
    );
    expect(getDonnyTargetByPackageId("ux-sprint")?.id).toBe(
      "pricing.package.uxSprint",
    );
  });

  it("guards route sanitizer", () => {
    expect(isSafeDonnyRoute("/pricing")).toBe(true);
    expect(isSafeDonnyRoute("https://evil.com")).toBe(false);
    expect(isSafeDonnyRoute("//evil.com")).toBe(false);
    expect(isSafeDonnyRoute("/javascript:alert(1)")).toBe(false);
  });

  it("validates fallback target ids", () => {
    for (const entry of DONNY_SITE_TARGETS) {
      if (entry.fallbackTargetId) {
        expect(getDonnyTarget(entry.fallbackTargetId)).toBeDefined();
      }
    }
  });

  it("exposes compact catalog for tools", () => {
    const catalog = getDonnyTargetCatalog();
    expect(catalog.length).toBe(DONNY_SITE_TARGETS.length);
    expect(catalog[0]).toMatchObject({
      id: expect.any(String),
      route: expect.any(String),
      label: expect.any(String),
      summary: expect.any(String),
      allowedModes: expect.any(Array),
    });
  });

  it("narrows target id strings", () => {
    expect(isDonnyTargetId("contact.form")).toBe(true);
    expect(isDonnyTargetId("not.a.real.target")).toBe(false);
  });

  it("includes enterprise proof targets referenced in the plan", () => {
    const proofIds: DonnyTargetId[] = [
      "work.project.sapBuildApps",
      "work.project.helsinkiDesignSystem",
    ];
    for (const id of proofIds) {
      expect(getDonnyTarget(id)?.projectSlug).toBeTruthy();
    }
  });

  it("maps project slugs to registry target ids", () => {
    expect(getDonnyProjectTargetId("sap-build-apps", "root")).toBe(
      "work.project.sapBuildApps",
    );
    expect(getDonnyProjectTargetId("sap-build-apps", "overview")).toBe(
      "work.project.sapBuildApps.overview",
    );
    expect(getDonnyProjectTargetId("sap-build-apps", "proof")).toBe(
      "work.project.sapBuildApps.proof",
    );
    expect(getDonnyProjectTargetId("unknown-project")).toBeUndefined();
  });

  it("maps navigateTo URLs to registry targets", () => {
    expect(resolveDonnyTargetFromNavigationUrl("/work")?.targetId).toBe(
      "work.index",
    );
    expect(resolveDonnyTargetFromNavigationUrl("/pricing")?.targetId).toBe(
      "pricing.packages",
    );
    expect(
      resolveDonnyTargetFromNavigationUrl("/work/sap-build-apps")?.targetId,
    ).toBe("work.project.sapBuildApps");
    expect(
      resolveDonnyTargetFromNavigationUrl("/#services")?.targetId,
    ).toBe("home.services");
  });
});
