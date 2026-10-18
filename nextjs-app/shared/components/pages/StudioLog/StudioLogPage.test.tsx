import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { STUDIO_LOG } from "../../../data/studio-log";
import { StudioLogPage, formatLogDate } from "./StudioLogPage";

describe("StudioLogPage", () => {
  it("groups entries by year, newest first, as dated list items", () => {
    render(
      <StudioLogPage
        entries={[
          { date: "2026-10-17", text: "Ships a release", href: "/blog" },
          { date: "2026-02", text: "Launches a tool" },
          { date: "2009", text: "Starts a practice", href: "/work/illustrations" },
        ]}
      />,
    );

    const years = screen.getAllByRole("heading", { level: 2 });
    expect(years.map((h) => h.textContent)).toEqual(["2026", "2009"]);

    const first = screen.getByRole("region", { name: "2026" });
    const items = within(first).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("time")).toHaveAttribute("dateTime", "2026-10-17");
    expect(screen.getByRole("link", { name: "Ships a release" })).toHaveAttribute("href", "/blog");
    expect(screen.queryByRole("link", { name: "Launches a tool" })).toBeNull();
  });

  it("formats day, month and year-only dates", () => {
    expect(formatLogDate("2026-10-17")).toBe("17 Oct");
    expect(formatLogDate("2026-02")).toBe("Feb");
    expect(formatLogDate("2009")).toBe("");
  });

  it("keeps the log in date order, newest first", () => {
    const dates = STUDIO_LOG.map((e) => e.date.padEnd(10, "-"));
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});
