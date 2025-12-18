import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import Tabs, { TabItem } from "@dt/Tabs";

// Mock react-i18next
const mockT = vi.fn((key: string, defaultValue: string = key) => {
  const translations: { [key: string]: string } = {
    "tabs.navigation": "Navigate between tabs",
  };
  return translations[key] || defaultValue;
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe("Tabs", () => {
  const defaultTabs: TabItem[] = [
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all tabs with proper roles and accessibility attributes", () => {
    render(<Tabs tabs={defaultTabs} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "Navigate between tabs",
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent("Tab 1");
    expect(tabs[1]).toHaveTextContent("Tab 2");
    expect(tabs[2]).toHaveTextContent("Tab 3");
  });

  it("activates first tab by default when no default is provided", () => {
    render(<Tabs tabs={defaultTabs} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");

    expect(tabs[0]).toHaveAttribute("tabIndex", "0");
    expect(tabs[1]).toHaveAttribute("tabIndex", "-1");
    expect(tabs[2]).toHaveAttribute("tabIndex", "-1");
  });

  it("activates specified default tab", () => {
    render(<Tabs tabs={defaultTabs} defaultActiveTabKey="tab2" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("switches tabs when clicked (uncontrolled)", () => {
    render(<Tabs tabs={defaultTabs} />);

    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[2]);

    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  });

  it("calls onTabChange when tab is clicked", () => {
    const mockOnTabChange = vi.fn();
    render(<Tabs tabs={defaultTabs} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[1]);

    expect(mockOnTabChange).toHaveBeenCalledWith("tab2");
  });

  it("respects controlled active tab", () => {
    render(<Tabs tabs={defaultTabs} activeTabKey="tab3" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  });

  it("handles disabled tabs correctly", () => {
    const tabsWithDisabled: TabItem[] = [
      { key: "tab1", label: "Tab 1" },
      { key: "tab2", label: "Tab 2", disabled: true },
      { key: "tab3", label: "Tab 3" },
    ];

    const mockOnTabChange = vi.fn();
    render(<Tabs tabs={tabsWithDisabled} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]).toHaveAttribute("aria-disabled", "true");
    expect(tabs[1]).toBeDisabled();

    fireEvent.click(tabs[1]);
    expect(mockOnTabChange).not.toHaveBeenCalled();
  });

  it("handles keyboard navigation with arrow keys", () => {
    render(<Tabs tabs={defaultTabs} />);

    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();

    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[1]);

    fireEvent.keyDown(tabs[1], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("handles keyboard navigation with home and end keys", () => {
    render(<Tabs tabs={defaultTabs} />);

    const tabs = screen.getAllByRole("tab");
    tabs[1].focus();

    fireEvent.keyDown(tabs[1], { key: "Home" });
    expect(document.activeElement).toBe(tabs[0]);

    fireEvent.keyDown(tabs[0], { key: "End" });
    expect(document.activeElement).toBe(tabs[2]);
  });

  it("activates tab with Enter and Space keys", () => {
    const mockOnTabChange = vi.fn();
    render(<Tabs tabs={defaultTabs} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole("tab");

    fireEvent.keyDown(tabs[1], { key: "Enter" });
    expect(mockOnTabChange).toHaveBeenCalledWith("tab2");

    fireEvent.keyDown(tabs[2], { key: " " });
    expect(mockOnTabChange).toHaveBeenCalledWith("tab3");
  });

  it("applies custom className", () => {
    render(<Tabs tabs={defaultTabs} className="custom-tabs" />);

    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveClass("custom-tabs");
  });

  it("applies variant and size classes", () => {
    render(<Tabs tabs={defaultTabs} variant="pills" size="l" />);

    const tablist = screen.getByRole("tablist");
    expect(tablist.className).toContain("pills");
    expect(tablist.className).toContain("l");
  });

  it("renders underline indicator for underline variant", () => {
    render(<Tabs tabs={defaultTabs} variant="underline" />);

    const indicators = screen
      .getAllByRole("tab")
      .map((tab) => tab.querySelector("[aria-hidden='true']"));
    expect(indicators[0]).toBeInTheDocument();
    expect(indicators[1]).toBeInTheDocument();
    expect(indicators[2]).toBeInTheDocument();
  });

  it("returns null when no tabs are provided", () => {
    const { container } = render(<Tabs tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("wraps around with arrow key navigation", () => {
    render(<Tabs tabs={defaultTabs} />);

    const tabs = screen.getAllByRole("tab");

    // From first to last with ArrowLeft
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[2]);

    // From last to first with ArrowRight
    tabs[2].focus();
    fireEvent.keyDown(tabs[2], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[0]);
  });
});
