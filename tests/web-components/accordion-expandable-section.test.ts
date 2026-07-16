import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  DtAccordionElement,
  type DtAccordionItem,
} from "../../packages/web-components/src/native/accordion";
import { DtExpandableSectionElement } from "../../packages/web-components/src/native/expandable-section";

const ACCORDION_TAG = "dt-test-accordion";
const EXPANDABLE_TAG = "dt-test-expandable-section";

beforeAll(() => {
  if (!customElements.get(ACCORDION_TAG)) {
    customElements.define(ACCORDION_TAG, DtAccordionElement);
  }
  if (!customElements.get(EXPANDABLE_TAG)) {
    customElements.define(EXPANDABLE_TAG, DtExpandableSectionElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

function renderAccordion({
  items = [
    { id: "one", title: "First Item", content: "First content" },
    { id: "two", title: "Second Item", content: "Second content" },
    { id: "three", title: "Third Item", content: "Third content" },
  ],
  type,
  variant,
  defaultOpenId,
  defaultOpenIds,
  openIds,
  slottedContent,
}: {
  items?: DtAccordionItem[];
  type?: "single" | "multiple";
  variant?: "contained" | "enclosed" | "divided";
  defaultOpenId?: string;
  defaultOpenIds?: string[];
  openIds?: string[];
  slottedContent?: Array<{ slot: string; text: string; tag?: string }>;
} = {}) {
  const element = document.createElement(ACCORDION_TAG) as DtAccordionElement;
  element.items = items;
  if (type) element.type = type;
  if (variant) element.variant = variant;
  if (defaultOpenId) element.defaultOpenId = defaultOpenId;
  if (defaultOpenIds) element.defaultOpenIds = defaultOpenIds;
  if (openIds) element.openIds = openIds;
  for (const entry of slottedContent ?? []) {
    const node = document.createElement(entry.tag ?? "div");
    node.slot = entry.slot;
    node.textContent = entry.text;
    element.append(node);
  }
  document.body.append(element);
  return element;
}

function triggerFor(
  element: DtAccordionElement,
  id: string,
): HTMLButtonElement {
  const button = element.shadowRoot?.querySelector<HTMLButtonElement>(
    `button[id$="-${CSS.escape(id)}"]`,
  );
  if (!button) throw new Error(`Missing trigger for ${id}`);
  return button;
}

function panelFor(element: DtAccordionElement, id: string): HTMLElement {
  const panel = element.shadowRoot?.querySelector<HTMLElement>(
    `div[role="region"][id$="-${CSS.escape(id)}"]`,
  );
  if (!panel) throw new Error(`Missing panel for ${id}`);
  return panel;
}

function slotText(slot: HTMLSlotElement | null | undefined): string {
  return (
    slot
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim() ?? ""
  );
}

function isAccordionOpen(element: DtAccordionElement, id: string): boolean {
  return (
    panelFor(element, id).parentElement?.parentElement?.dataset.open === "true"
  );
}

function renderExpandable({
  collapsedLabel = "Show more",
  expandedLabel,
  defaultExpanded,
  expanded,
  content = "Hidden tail",
}: {
  collapsedLabel?: string;
  expandedLabel?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  content?: string;
} = {}) {
  const element = document.createElement(
    EXPANDABLE_TAG,
  ) as DtExpandableSectionElement;
  element.collapsedLabel = collapsedLabel;
  if (expandedLabel !== undefined) element.expandedLabel = expandedLabel;
  if (defaultExpanded) element.defaultExpanded = true;
  if (expanded !== undefined) element.expanded = expanded;
  element.append(content);
  document.body.append(element);
  return element;
}

function expandableTrigger(
  element: DtExpandableSectionElement,
): HTMLButtonElement {
  const button = element.shadowRoot?.querySelector<HTMLButtonElement>("button");
  if (!button) throw new Error("Missing expandable trigger");
  return button;
}

function expandablePanel(element: DtExpandableSectionElement): HTMLElement {
  const panel =
    element.shadowRoot?.querySelector<HTMLElement>('[role="region"]');
  if (!panel) throw new Error("Missing expandable panel");
  return panel;
}

describe("DtAccordionElement", () => {
  it("renders all accordion items and preserves mounted panels", () => {
    const element = renderAccordion();

    expect(triggerFor(element, "one")).toHaveTextContent("First Item");
    expect(triggerFor(element, "two")).toHaveTextContent("Second Item");
    expect(triggerFor(element, "three")).toHaveTextContent("Third Item");
    expect(panelFor(element, "one")).toBeInTheDocument();
    expect(panelFor(element, "two")).toBeInTheDocument();
    expect(panelFor(element, "three")).toBeInTheDocument();
    expect(isAccordionOpen(element, "one")).toBe(false);
  });

  it("marks closed panels inert and aria-hidden; open panels clear both", async () => {
    const user = userEvent.setup();
    const element = renderAccordion();

    expect(panelFor(element, "one")).toHaveAttribute("aria-hidden", "true");
    expect(panelFor(element, "one")).toHaveAttribute("inert");

    await user.click(triggerFor(element, "one"));

    expect(panelFor(element, "one")).not.toHaveAttribute("aria-hidden");
    expect(panelFor(element, "one")).not.toHaveAttribute("inert");
  });

  it("supports default single-open and multiple-open uncontrolled state", async () => {
    const user = userEvent.setup();
    const single = renderAccordion({ defaultOpenId: "two" });
    expect(isAccordionOpen(single, "two")).toBe(true);
    expect(isAccordionOpen(single, "one")).toBe(false);

    const multiple = renderAccordion({
      type: "multiple",
      defaultOpenIds: ["one", "two"],
    });
    expect(isAccordionOpen(multiple, "one")).toBe(true);
    expect(isAccordionOpen(multiple, "two")).toBe(true);

    await user.click(triggerFor(single, "three"));
    expect(isAccordionOpen(single, "two")).toBe(false);
    expect(isAccordionOpen(single, "three")).toBe(true);
  });

  it("treats default open IDs as seed-only after user interaction", async () => {
    const user = userEvent.setup();
    const element = renderAccordion({ defaultOpenId: "one" });

    await user.click(triggerFor(element, "two"));
    element.defaultOpenId = "three";

    expect(isAccordionOpen(element, "two")).toBe(true);
    expect(isAccordionOpen(element, "three")).toBe(false);
  });

  it("supports controlled state and emits bubbled composed open-change events", async () => {
    const user = userEvent.setup();
    const host = document.createElement("div");
    document.body.append(host);
    const element = document.createElement(ACCORDION_TAG) as DtAccordionElement;
    element.items = [
      { id: "shipping", title: "Shipping", content: "3-5 days" },
      { id: "returns", title: "Returns", content: "Free within 30 days" },
    ];
    element.type = "multiple";
    element.openIds = ["shipping"];
    host.append(element);

    const listener = vi.fn();
    host.addEventListener("open-change", listener);

    await user.click(triggerFor(element, "returns"));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({
      detail: { openIds: ["shipping", "returns"] },
      bubbles: true,
      composed: true,
    });
    expect(isAccordionOpen(element, "returns")).toBe(false);

    element.openIds = ["shipping", "returns"];
    expect(isAccordionOpen(element, "returns")).toBe(true);
  });

  it("keeps disabled items inert and wires heading/region semantics", async () => {
    const user = userEvent.setup();
    const element = renderAccordion({
      items: [
        { id: "available", title: "Available section", content: "This opens." },
        {
          id: "soon",
          title: "Coming soon",
          content: "Not reachable yet.",
          disabled: true,
        },
      ],
    });

    const disabled = triggerFor(element, "soon");
    const panel = panelFor(element, "available");

    expect(disabled).toBeDisabled();
    expect(disabled.closest("h3")).toBeInTheDocument();
    expect(disabled).toHaveAttribute(
      "aria-controls",
      panelFor(element, "soon").id,
    );
    expect(panel).toHaveAttribute(
      "aria-labelledby",
      triggerFor(element, "available").id,
    );

    await user.click(disabled);
    expect(isAccordionOpen(element, "soon")).toBe(false);
  });

  it("toggles from keyboard and supports slotted rich content", async () => {
    const element = renderAccordion({
      items: [{ id: "one", title: "Question", content: "Fallback" }],
      slottedContent: [
        { slot: "content-one", tag: "p", text: "Rich answer" },
        { slot: "title-one", tag: "strong", text: "Question" },
      ],
    });

    const trigger = triggerFor(element, "one");
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(isAccordionOpen(element, "one")).toBe(true);
    const slot = panelFor(element, "one").querySelector<HTMLSlotElement>(
      'slot[name="content-one"]',
    );
    expect(slotText(slot)).toBe("Rich answer");
  });

  it("applies the requested variant class", () => {
    const element = renderAccordion({ variant: "divided" });
    expect(element.shadowRoot?.querySelector('[part="root"]')).toHaveClass(
      "accordion",
      "divided",
    );
  });
});

describe("DtExpandableSectionElement", () => {
  it("starts collapsed, toggles from the trigger, and swaps to expandedLabel", async () => {
    const user = userEvent.setup();
    const element = renderExpandable({
      collapsedLabel: "Show more",
      expandedLabel: "Show less",
    });

    expect(expandableTrigger(element)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(expandableTrigger(element)).toHaveTextContent("Show more");

    await user.click(expandableTrigger(element));

    expect(expandableTrigger(element)).toHaveAttribute("aria-expanded", "true");
    expect(expandableTrigger(element)).toHaveTextContent("Show less");
    expect(expandablePanel(element)).not.toHaveAttribute("aria-hidden");
  });

  it("treats defaultExpanded as a seed-only value", async () => {
    const user = userEvent.setup();
    const element = renderExpandable();

    await user.click(expandableTrigger(element));
    element.defaultExpanded = false;

    expect(expandableTrigger(element)).toHaveAttribute("aria-expanded", "true");
  });

  it("supports controlled expansion and emits bubbled composed expanded-change events", async () => {
    const user = userEvent.setup();
    const host = document.createElement("div");
    document.body.append(host);
    const element = renderExpandable({
      collapsedLabel: "Show changelog",
      expandedLabel: "Hide changelog",
      expanded: false,
    });
    host.append(element);

    const listener = vi.fn();
    host.addEventListener("expanded-change", listener);

    await user.click(expandableTrigger(element));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({
      detail: { expanded: true },
      bubbles: true,
      composed: true,
    });
    expect(expandableTrigger(element)).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    element.expanded = true;
    expect(expandableTrigger(element)).toHaveAttribute("aria-expanded", "true");
  });

  it("respects defaultExpanded and keeps button/region semantics wired", () => {
    const element = renderExpandable({
      collapsedLabel: "Show details",
      defaultExpanded: true,
      content: "Visible tail",
    });

    expect(expandableTrigger(element)).toHaveAttribute("aria-expanded", "true");
    expect(expandablePanel(element)).toHaveAttribute(
      "aria-labelledby",
      expandableTrigger(element).id,
    );
    expect(
      slotText(expandablePanel(element).querySelector<HTMLSlotElement>("slot")),
    ).toBe("Visible tail");
  });

  it("toggles from the keyboard with Enter and Space", async () => {
    const element = renderExpandable({ collapsedLabel: "Details" });

    const trigger = expandableTrigger(element);
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(expandableTrigger(element)).toHaveAttribute("aria-expanded", "true");
    expandableTrigger(element).dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true }),
    );
    expect(expandableTrigger(element)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
