import { describe, expect, it } from "vitest";
import {
  filterProjects,
  getProjectNavigation,
  getProjectNavigationCatalog,
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

describe("coming-soon projects are unroutable", () => {
  const comingSoonProjects = projects.filter((project) => project.comingSoon);

  it("has at least one coming-soon project to exercise the guards", () => {
    expect(comingSoonProjects.length).toBeGreaterThan(0);
  });

  it("never surfaces a coming-soon project as previous/next navigation", () => {
    for (const project of projects.filter((p) => !p.comingSoon)) {
      const { previous, next } = getProjectNavigation(project.slug);
      expect(previous?.comingSoon ?? false).toBe(false);
      expect(next?.comingSoon ?? false).toBe(false);
    }
  });

  it("does not resolve navigation queries to coming-soon projects", () => {
    for (const project of comingSoonProjects) {
      expect(resolveProjectNavigationPath(project.slug)).toBeNull();
      expect(resolveProjectNavigationPath(project.title)).toBeNull();
      expect(resolveProjectNavigationPath(`/work/${project.slug}`)).toBeNull();
    }
  });

  it("excludes coming-soon projects from the navigation catalog", () => {
    const slugs = getProjectNavigationCatalog().map((entry) => entry.slug);
    for (const project of comingSoonProjects) {
      expect(slugs).not.toContain(project.slug);
    }
  });

  // The catalog is what app/work/NextWorkNav.tsx builds its prev/next
  // sequence from. It previously mapped sortedProjects itself, unfiltered,
  // which is how "next" from DSharp reached the routeless Precedent page.
  // Stepping the catalog end to end asserts the shipped sequence never
  // offers a route that does not exist.
  it("yields a catalog sequence whose every step is routable", () => {
    const catalog = getProjectNavigationCatalog();
    expect(catalog.length).toBeGreaterThan(1);

    const comingSoonSlugs = new Set(comingSoonProjects.map((p) => p.slug));
    for (const entry of catalog) {
      expect(comingSoonSlugs.has(entry.slug)).toBe(false);
      expect(entry.url).toBe(`/work/${entry.slug}`);
    }
  });
});
