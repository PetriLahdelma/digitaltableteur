import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import Tabs, { TabItem, getTabPanelProps } from "@dt/Tabs";

// Mock the package translation adapter.
const mockT = vi.fn((key: string, defaultValue: string = key) => {
  const translations: { [key: string]: string } = {
    "tabs.navigation": "Navigate between tabs",
  };
  return translations[key] || defaultValue;
});

vi.mock("../../lib/translation", () => ({
  useTranslate: () => mockT,
  useLocalization: () => ({
    translate: mockT,
    language: "en",
    resolvedLanguage: "en",
    changeLanguage: vi.fn(),
    getResourceBundle: vi.fn(),
  }),
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

  it("uses a caller-provided tablist label when supplied", () => {
    render(<Tabs tabs={defaultTabs} ariaLabel="Contact options" />);

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "Contact options",
    );
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
    render(<Tabs tabs={defaultTabs} defaultActiveTab="tab2" />);

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
    render(<Tabs tabs={defaultTabs} activeTab="tab3" />);

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
    // Component uses disabled attribute, not aria-disabled (to avoid redundancy)
    expect(tabs[1]).toBeDisabled();
    expect(tabs[1]).not.toHaveAttribute("aria-disabled");

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
    render(<Tabs tabs={defaultTabs} variant="pills" size="lg" />);

    const tablist = screen.getByRole("tablist");
    expect(tablist.className).toContain("pills");
    expect(tablist.className).toContain("lg");
  });

  it("renders a single sliding selection indicator", () => {
    const { container } = render(
      <Tabs tabs={defaultTabs} variant="underline" />,
    );
    const indicators = container.querySelectorAll("[data-tab-indicator]");
    expect(indicators).toHaveLength(1);
    expect(indicators[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a leading icon without polluting the accessible name", () => {
    const tabsWithIcon: TabItem[] = [
      { key: "home", label: "Home", icon: "house" },
      { key: "profile", label: "Profile" },
    ];
    render(<Tabs tabs={tabsWithIcon} />);
    // Label remains the accessible name; the decorative icon is hidden from AT.
    const home = screen.getByRole("tab", { name: "Home" });
    expect(home.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("renders a trailing count as part of the tab", () => {
    const tabsWithCount: TabItem[] = [
      { key: "inbox", label: "Inbox", count: 3 },
      { key: "sent", label: "Sent" },
    ];
    render(<Tabs tabs={tabsWithCount} />);
    const inbox = screen.getByRole("tab", { name: /Inbox/ });
    expect(inbox).toHaveTextContent("3");
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

  describe("accessibility", () => {
    it("should have unique id on each tab", () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabElements = screen.getAllByRole("tab");
      const ids = tabElements.map((tab) => tab.id);
      expect(new Set(ids).size).toBe(defaultTabs.length);
      ids.forEach((id) => expect(id).toMatch(/^tab-/));
    });

    it("should have aria-controls pointing to tabpanel id", () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabElements = screen.getAllByRole("tab");
      tabElements.forEach((tab, index) => {
        expect(tab).toHaveAttribute(
          "aria-controls",
          `tabpanel-${defaultTabs[index].key}`,
        );
      });
    });

    it("should not have redundant aria-disabled when disabled", () => {
      const tabsWithDisabled = [
        { key: "tab1", label: "Tab 1" },
        { key: "tab2", label: "Tab 2", disabled: true },
      ];
      render(<Tabs tabs={tabsWithDisabled} />);
      const disabledTab = screen.getByRole("tab", { name: "Tab 2" });
      expect(disabledTab).toBeDisabled();
      // aria-disabled should not be present when disabled attribute is used
      expect(disabledTab).not.toHaveAttribute("aria-disabled");
    });
  });
});

describe("getTabPanelProps", () => {
  it("should return correct props for active panel", () => {
    const props = getTabPanelProps("profile", true);
    expect(props).toEqual({
      id: "tabpanel-profile",
      role: "tabpanel",
      "aria-labelledby": "tab-profile",
      hidden: false,
      tabIndex: 0,
    });
  });

  it("should return correct props for inactive panel", () => {
    const props = getTabPanelProps("settings", false);
    expect(props).toEqual({
      id: "tabpanel-settings",
      role: "tabpanel",
      "aria-labelledby": "tab-settings",
      hidden: true,
      tabIndex: -1,
    });
  });
});
