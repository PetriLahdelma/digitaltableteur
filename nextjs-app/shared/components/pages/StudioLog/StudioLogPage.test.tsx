import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { STUDIO_LOG } from "../../../data/studio-log";
import { StudioLogPage } from "./StudioLogPage";
import { formatLogDate } from "./DatedLog";

const ENTRIES = [
  { date: "2026-10-17", text: "Ships a release", href: "/blog" },
  { date: "2026-02", text: "Launches a tool" },
  { date: "2009", text: "Registers the studio", href: "/work/finnish-transport-agency" },
];

describe("StudioLogPage", () => {
  it("groups entries into one collapsible row per year, newest open", () => {
    render(<StudioLogPage entries={ENTRIES} />);

    const newest = screen.getByRole("button", { name: "2026" });
    const oldest = screen.getByRole("button", { name: "2009" });
    expect(newest).toHaveAttribute("aria-expanded", "true");
    expect(oldest).toHaveAttribute("aria-expanded", "false");

    const items = within(screen.getByRole("region", { name: "2026" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("time")).toHaveAttribute("dateTime", "2026-10-17");
    expect(screen.getByRole("link", { name: "Ships a release" })).toHaveAttribute("href", "/blog");
    expect(screen.queryByRole("link", { name: "Launches a tool" })).toBeNull();
  });

  it("opens a year from the year index and toggles every year at once", () => {
    render(<StudioLogPage entries={ENTRIES} />);
    const index = screen.getByRole("navigation", { name: "Years" });

    const link = within(index).getByRole("link", { name: "2009" });
    expect(link).toHaveAttribute("href", "#trigger-log-2009");
    fireEvent.click(link);
    expect(screen.getByRole("button", { name: "2009" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.getByRole("button", { name: "2026" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Expand all" }));
    expect(screen.getByRole("button", { name: "2009" })).toHaveAttribute("aria-expanded", "true");
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
