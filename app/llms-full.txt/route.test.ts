import { describe, expect, it, vi } from "vitest";

import { projects } from "@/nextjs-app/shared/data/projects";
import {
  getCaseStudies,
  getCaseStudyBySlug,
} from "@/nextjs-app/shared/data/consulting-catalog";
import { GET } from "./route";

vi.mock("../blog/postMetadata", () => ({ getVisiblePosts: () => [] }));

// Coming-soon teasers have no page: every surface that prints /work links
// must leave them out or say "coming soon", never link to a 404.
const comingSoon = projects.filter((project) => project.comingSoon);

describe("coming-soon projects never get a /work link", () => {
  it("has teasers to check", () => {
    expect(comingSoon.map((project) => project.slug)).toEqual(
      expect.arrayContaining(["vr-design-system", "process-genius-design-system"]),
    );
  });

  it("llms-full.txt", async () => {
    const body = await (await GET()).text();
    for (const project of comingSoon) {
      expect(body).not.toContain(`/work/${project.slug}`);
      expect(body).toContain(`### ${project.title}`);
    }
  });

  it("consulting catalog case studies", () => {
    const slugs = getCaseStudies().map((study) => study.slug);
    for (const project of comingSoon) {
      expect(slugs).not.toContain(project.slug);
      expect(getCaseStudyBySlug(project.slug)).toBeUndefined();
    }
  });
});
