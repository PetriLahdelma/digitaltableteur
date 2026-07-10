import { describe, expect, it } from "vitest";
import {
  filterProjects,
  projects,
  resolveProjectNavigationPath,
} from "./projects";

describe("resolveProjectNavigationPath", () => {
  it("resolves slug aliases", () => {
    expect(resolveProjectNavigationPath("sap")).toBe("/work/sap-build-apps");
    expect(resolveProjectNavigationPath("helsinki")).toBe(
      "/work/helsinki-design-system",
    );
    expect(resolveProjectNavigationPath("vertaaux")).toBe("/work/vertaaux");
  });

  it("resolves project titles", () => {
    expect(resolveProjectNavigationPath("KnobSmith Audio")).toBe(
      "/work/knobsmith-audio",
    );
    expect(resolveProjectNavigationPath("Rhythmguard")).toBe("/work/rhythmguard");
  });

  it("strips navigation phrases before resolving", () => {
    expect(resolveProjectNavigationPath("navigate to SAP")).toBe(
      "/work/sap-build-apps",
    );
    expect(resolveProjectNavigationPath("show me Helsinki Design System")).toBe(
      "/work/helsinki-design-system",
    );
    expect(resolveProjectNavigationPath("open vertaaux")).toBe("/work/vertaaux");
    expect(resolveProjectNavigationPath("go to Project Spine")).toBe(
      "/work/project-spine",
    );
  });

  it("accepts full /work/{slug} paths", () => {
    expect(resolveProjectNavigationPath("/work/dsharp-design-system")).toBe(
      "/work/dsharp-design-system",
    );
  });

  it("returns null for ambiguous or unknown queries", () => {
    expect(resolveProjectNavigationPath("design system")).toBeNull();
    expect(resolveProjectNavigationPath("unknown client")).toBeNull();
    expect(resolveProjectNavigationPath("/contact")).toBeNull();
  });
});

describe("filterProjects", () => {
  it("includes secondary-category projects in the category filter", () => {
    const branding = filterProjects(projects, "branding").map((p) => p.slug);
    const uxDesign = filterProjects(projects, "ux-design").map((p) => p.slug);
    // Garage Junction is primarily ux-design and also branding
    expect(branding).toContain("garage-junction");
    expect(uxDesign).toContain("garage-junction");
  });

  it("returns every project for 'all'", () => {
    expect(filterProjects(projects, "all")).toHaveLength(projects.length);
  });
});
