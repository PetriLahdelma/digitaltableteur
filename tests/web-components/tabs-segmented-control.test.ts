import { fireEvent } from "@testing-library/dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { DtSegmentedControlElement } from "../../packages/web-components/src/native/segmented-control";
import { DtTabsElement } from "../../packages/web-components/src/native/tabs";

beforeAll(() => {
  if (!customElements.get("dt-tabs")) {
    customElements.define("dt-tabs", DtTabsElement);
  }
  if (!customElements.get("dt-segmented-control")) {
    customElements.define("dt-segmented-control", DtSegmentedControlElement);
  }
});

describe("native tabs and segmented control", () => {
  it("renders slotted tabpanels, updates uncontrolled selection, and emits bubbling composed tab-change events", () => {
    const element = document.createElement("dt-tabs") as DtTabsElement;
    element.tabs = [
      { key: "overview", label: "Overview" },
      { key: "details", label: "Details" },
      { key: "notes", label: "Notes" },
    ];
    element.defaultActiveTab = "details";

    const overviewPanel = document.createElement("div");
    overviewPanel.slot = "panel-overview";
    overviewPanel.textContent = "Overview panel";
    const detailsPanel = document.createElement("div");
    detailsPanel.slot = "panel-details";
    detailsPanel.textContent = "Details panel";
    const notesPanel = document.createElement("div");
    notesPanel.slot = "panel-notes";
    notesPanel.textContent = "Notes panel";
    element.append(overviewPanel, detailsPanel, notesPanel);

    const onTabChange = vi.fn();
    element.addEventListener("tab-change", onTabChange);
    document.body.append(element);

    const tablist = element.shadowRoot?.querySelector("[role='tablist']");
    const tabs = element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    const panels = element.shadowRoot?.querySelectorAll<HTMLElement>("[role='tabpanel']");

    expect(tablist).toHaveAttribute("aria-label", "Navigate between tabs");
    expect(tabs?.[1]).toHaveAttribute("aria-selected", "true");
    expect(panels?.[1]?.hidden).toBe(false);
    expect(panels?.[0]?.hidden).toBe(true);

    fireEvent.click(tabs?.[2] as HTMLButtonElement);

    expect(element.activeTab).toBe("notes");
    expect(tabs?.[2]).toHaveAttribute("aria-selected", "true");
    expect(panels?.[2]?.hidden).toBe(false);
    expect((onTabChange.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      activeTab: "notes",
      previousActiveTab: "details",
    });
    expect((onTabChange.mock.calls[0]?.[0] as CustomEvent).bubbles).toBe(true);
    expect((onTabChange.mock.calls[0]?.[0] as CustomEvent).composed).toBe(true);
  });

  it("keeps manual-activation tabs focused but unselected until Enter, skipping disabled tabs", () => {
    const element = document.createElement("dt-tabs") as DtTabsElement;
    element.tabs = [
      { key: "one", label: "One" },
      { key: "two", label: "Two", disabled: true },
      { key: "three", label: "Three" },
    ];
    element.defaultActiveTab = "one";
    document.body.append(element);

    const tabs = element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    const onTabChange = vi.fn();
    element.addEventListener("tab-change", onTabChange);

    tabs?.[0].focus();
    fireEvent.keyDown(tabs?.[0] as HTMLButtonElement, { key: "ArrowRight" });

    expect(element.shadowRoot?.activeElement).toBe(tabs?.[2]);
    expect(tabs?.[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs?.[2]).toHaveAttribute("tabindex", "0");
    expect(onTabChange).not.toHaveBeenCalled();

    fireEvent.keyDown(tabs?.[2] as HTMLButtonElement, { key: "Enter" });

    expect(element.activeTab).toBe("three");
    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect(tabs?.[2]).toHaveAttribute("aria-selected", "true");
  });

  it("keeps controlled tabs on the supplied active-tab until the host updates it, and supports vertical automatic activation", () => {
    const element = document.createElement("dt-tabs") as DtTabsElement;
    element.tabs = [
      { key: "alpha", label: "Alpha" },
      { key: "beta", label: "Beta" },
      { key: "gamma", label: "Gamma" },
    ];
    element.activeTab = "alpha";
    element.orientation = "vertical";
    element.activation = "automatic";
    document.body.append(element);

    const tabs = element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    const onTabChange = vi.fn();
    element.addEventListener("tab-change", onTabChange);

    tabs?.[0].focus();
    fireEvent.keyDown(tabs?.[0] as HTMLButtonElement, { key: "ArrowDown" });

    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect((onTabChange.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      activeTab: "beta",
      previousActiveTab: "alpha",
    });
    expect(tabs?.[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs?.[1]).toHaveAttribute("tabindex", "0");

    element.activeTab = "beta";
    const updatedTabs =
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    expect(updatedTabs?.[1]).toHaveAttribute("aria-selected", "true");
    expect(element.shadowRoot?.querySelector("[role='tablist']")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("renders segmented control as a radiogroup and supports uncontrolled value changes while skipping disabled items", () => {
    const element = document.createElement(
      "dt-segmented-control",
    ) as DtSegmentedControlElement;
    element.items = [
      { value: "day", label: "Day" },
      { value: "week", label: "Week", disabled: true },
      { value: "month", label: "Month" },
    ];
    element.defaultValue = "day";
    element.setAttribute("aria-label", "Range");
    document.body.append(element);

    const segments = element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='radio']");
    const onValueChange = vi.fn();
    element.addEventListener("value-change", onValueChange);

    expect(
      element.shadowRoot?.querySelector("[role='radiogroup']"),
    ).toHaveAttribute("aria-label", "Range");
    expect(segments?.[0]).toHaveAttribute("aria-checked", "true");
    expect(segments?.[1]).toBeDisabled();

    segments?.[0].focus();
    fireEvent.keyDown(segments?.[0] as HTMLButtonElement, { key: "ArrowRight" });

    expect(element.value).toBe("month");
    expect(segments?.[2]).toHaveAttribute("aria-checked", "true");
    expect((onValueChange.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: "month",
      previousValue: "day",
    });
  });

  it("keeps controlled segmented control selection on the supplied value until the host updates it", () => {
    const element = document.createElement(
      "dt-segmented-control",
    ) as DtSegmentedControlElement;
    element.items = [
      { value: "list", label: "List" },
      { value: "grid", label: "Grid" },
      { value: "board", label: "Board" },
    ];
    element.value = "list";
    element.setAttribute("aria-label", "View");
    const onValueChange = vi.fn();
    element.addEventListener("value-change", onValueChange);
    document.body.append(element);

    const segments = element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='radio']");
    fireEvent.click(segments?.[2] as HTMLButtonElement);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(segments?.[0]).toHaveAttribute("aria-checked", "true");
    expect(segments?.[2]).toHaveAttribute("tabindex", "0");

    element.value = "board";
    const updatedSegments =
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>("[role='radio']");
    expect(updatedSegments?.[2]).toHaveAttribute("aria-checked", "true");
  });
});
