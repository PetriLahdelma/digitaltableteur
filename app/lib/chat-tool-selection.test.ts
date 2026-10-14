import { describe, expect, it } from "vitest";
import { recentUserTexts, selectDonnyToolsForChat } from "./chat-tool-selection";

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

  const names = (text: string, recent: string[] = []) =>
    Object.keys(selectDonnyToolsForChat(allTools, text, recent));

  it("offers composeMailRequest for portfolio and work-sample requests", () => {
    expect(names("Can I request a portfolio with work samples?")).toContain("studio.composeMailRequest");
    expect(names("Could you email me your portfolio?")).toContain("studio.composeMailRequest");
    expect(names("Can I get Petri's CV?")).toContain("studio.composeMailRequest");
  });

  it("does not offer composeMailRequest for browsing the portfolio", () => {
    expect(names("Show me your portfolio")).not.toContain("studio.composeMailRequest");
  });

  it("offers expression tools for plural and FI/SV phrasing", () => {
    for (const text of ["What expressions can you make?", "Mitä ilmeitä sinulla on?", "Vilka uttryck kan du göra?"]) {
      expect(names(text)).toEqual(expect.arrayContaining(["studio.listExpressions", "studio.showExpression"]));
    }
  });

  it("offers createLead on a consent reply with no lead keywords", () => {
    expect(names("Yes, you can follow up. I'm Anna, anna@example.com.")).toContain("studio.createLead");
  });

  it("keeps lead tools across a multi-turn triage", () => {
    const recent = ["I want to hire you for a design system project", "I'm a client"];
    expect(names("We start in January", recent)).toEqual(
      expect.arrayContaining(["studio.getServicePackages", "studio.createLead"]),
    );
  });

  it("answers cost questions with packages instead of navigation", () => {
    const picked = names("How much does a design system audit cost?");
    expect(picked).toContain("studio.getServicePackages");
    expect(picked).not.toContain("studio.navigateTo");
  });

  it("keeps navigateTo when the visitor asks to open the pricing page", () => {
    expect(names("Take me to the pricing page")).toContain("studio.navigateTo");
  });

  it("collects the last user messages from UI parts and plain content", () => {
    const messages = [
      { role: "user", parts: [{ type: "text", text: "one" }] },
      { role: "assistant", content: "reply" },
      { role: "user", content: "two" },
      { role: "user", content: [{ type: "text", text: "three" }] },
      { role: "user", content: "four" },
    ];
    expect(recentUserTexts(messages)).toEqual(["two", "three", "four"]);
  });

  it("matches Finnish and Swedish intents despite ä/ö and inflections", () => {
    expect(names("Mitä palveluita tarjoatte?")).toContain("studio.services");
    expect(names("Vilka är era öppettider?")).toContain("studio.openHours");
    expect(names("Onko sivusto saavutettava?")).toContain("studio.vertaauxAccessibility");
    const fiPrice = names("Paljonko auditointi maksaa?");
    expect(fiPrice).toContain("studio.getServicePackages");
    expect(fiPrice).not.toContain("studio.navigateTo");
  });
});
