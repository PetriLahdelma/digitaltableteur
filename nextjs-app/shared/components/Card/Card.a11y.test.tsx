import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Card, { CardTab } from "@dt/Card";

describe("Card accessibility - tabs", () => {
  const tabs: CardTab[] = [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "more", label: "More" },
  ];

  it("renders a tablist with one active tab", () => {
    render(<Card title="Tabbed" tabs={tabs} defaultActiveTabKey="overview" />);
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    const allTabs = screen.getAllByRole("tab");
    expect(allTabs.length).toBe(3);
    const selected = allTabs.filter(
      (t) => t.getAttribute("aria-selected") === "true",
    );
    expect(selected.length).toBe(1);
    expect(selected[0]).toHaveTextContent("Overview");
  });

  it("updates aria-selected correctly when switching tabs (uncontrolled)", () => {
    render(<Card title="Tabbed" tabs={tabs} defaultActiveTabKey="overview" />);
    const detailsTab = screen.getByRole("tab", { name: /details/i });
    fireEvent.click(detailsTab);
    const allTabs = screen.getAllByRole("tab");
    const selected = allTabs.filter(
      (t) => t.getAttribute("aria-selected") === "true",
    );
    expect(selected.length).toBe(1);
    expect(selected[0]).toHaveTextContent("Details");
  });
});
