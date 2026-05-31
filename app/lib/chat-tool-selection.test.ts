import { describe, expect, it } from "vitest";
import { selectDonnyToolsForChat } from "./chat-tool-selection";

describe("selectDonnyToolsForChat", () => {
  const allTools = {
    "studio.openHours": {},
    "studio.services": {},
    "studio.projectShowcase": {},
    "studio.navigateTo": {},
    "studio.getCaseStudies": {},
    "studio.getServicePackages": {},
    "studio.createLead": {},
    "studio.draftFollowUp": {},
    "studio.bookCall": {},
    "studio.composeMailRequest": {},
    "studio.listExpressions": {},
    "studio.showExpression": {},
    "studio.vertaauxAccessibility": {},
    "studio.contactCard": {},
  };

  it("selects lead tools for budget and sprint messages", () => {
    const picked = selectDonnyToolsForChat(
      allTools,
      "Let's go with the UX sprint, budget 15k",
    );

    expect(Object.keys(picked)).toEqual(
      expect.arrayContaining([
        "studio.getServicePackages",
        "studio.getCaseStudies",
        "studio.createLead",
        "studio.navigateTo",
      ]),
    );
    expect(Object.keys(picked)).not.toContain("studio.openHours");
    expect(Object.keys(picked)).not.toContain("studio.listExpressions");
  });

  it("selects bookCall for scheduling intent", () => {
    const picked = selectDonnyToolsForChat(allTools, "Can we book a call next week?");

    expect(Object.keys(picked)).toContain("studio.bookCall");
  });
});
