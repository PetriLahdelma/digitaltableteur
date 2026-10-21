import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { SITE_CHANGELOG } from "../../../data/site-changelog.generated";
import { SiteChangelogPage } from "./SiteChangelogPage";

describe("SiteChangelogPage", () => {
  it("groups commits by month, newest open, each linked to its commit", () => {
    render(
      <SiteChangelogPage
        entries={[
          { date: "2026-10-21", sha: "abc123def", area: "Site", text: "Years collapse" },
          { date: "2026-10-02", sha: "def456abc", area: "Design system", text: "Adds a token" },
          { date: "2026-09-30", sha: "0123456ab", area: "Donny", text: "Answers faster" },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "October 2026" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "September 2026" })).toHaveAttribute("aria-expanded", "false");

    const october = within(screen.getByRole("region", { name: "October 2026" }));
    expect(october.getAllByRole("listitem")).toHaveLength(2);
    expect(october.getByRole("link", { name: /Years collapse/ })).toHaveAttribute(
      "href",
      "https://github.com/PetriLahdelma/digitaltableteur/commit/abc123def",
    );
    expect(october.getByText("Design system")).toBeInTheDocument();
  });

  it("ships generated entries newest first, in house style", () => {
    expect(SITE_CHANGELOG.length).toBeGreaterThan(0);
    const dates = SITE_CHANGELOG.map((e) => e.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const entry of SITE_CHANGELOG) {
      expect(entry.text).not.toMatch(/[—·]/);
    }
  });
});
