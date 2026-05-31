import { describe, expect, it } from "vitest";
import {
  draftLeadFollowUp,
  getLeadCaseStudies,
  recommendLeadPackage,
  resolveLeadPersona,
} from "./donny-lead-routing";

describe("donny-lead-routing", () => {
  it("resolves recruiter persona from natural language", () => {
    expect(resolveLeadPersona("recruiter")).toBe("recruiter");
    expect(resolveLeadPersona("hiring manager")).toBe("recruiter");
  });

  it("returns persona-specific case studies", () => {
    const client = getLeadCaseStudies({ persona: "client", limit: 3 });
    expect(client.persona).toBe("client");
    expect(client.projects.length).toBeGreaterThan(0);
    expect(client.projects[0]?.slug).toBe("dsharp-design-system");

    const recruiter = getLeadCaseStudies({ persona: "recruiter", limit: 2 });
    expect(recruiter.projects.some((p) => p.slug === "sap-build-apps")).toBe(
      true,
    );
  });

  it("recommends AI package for designops problems", () => {
    const result = recommendLeadPackage({
      problem: "We need AI designops automation for our team",
    });
    expect(result.recommendedPackageId).toBe("ai-ready-designops");
    expect(result.packages).toHaveLength(3);
  });

  it("drafts follow-up with disclaimer for clients", () => {
    const draft = draftLeadFollowUp({
      persona: "client",
      recipientName: "Alex",
      need: "Design system audit",
      recommendedPackageId: "design-system-lift-off",
      caseSlugs: ["dsharp-design-system"],
    });
    expect(draft.subject).toContain("Design systems");
    expect(draft.body).toContain("Alex");
    expect(draft.disclaimer).toContain("never sends email");
    expect(draft.contactUrl).toBe("/contact");
  });
});
