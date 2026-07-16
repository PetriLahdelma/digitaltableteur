import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DtGroupLabelElement } from "../../packages/web-components/src/native/group-label";
import { DtMacWindowFrameElement } from "../../packages/web-components/src/native/mac-window-frame";

const GROUP_LABEL_TAG = "dt-group-label";
const MAC_WINDOW_FRAME_TAG = "dt-mac-window-frame";

beforeAll(() => {
  if (!customElements.get(GROUP_LABEL_TAG)) {
    customElements.define(GROUP_LABEL_TAG, DtGroupLabelElement);
  }
  if (!customElements.get(MAC_WINDOW_FRAME_TAG)) {
    customElements.define(MAC_WINDOW_FRAME_TAG, DtMacWindowFrameElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

function nextTick() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

describe("native group label and mac window frame", () => {
  it("names a grouped control, exposes optional and hint states, and forwards focus into the group", () => {
    const group = document.createElement("div");
    group.id = "delivery-group";
    group.setAttribute("role", "group");

    const street = document.createElement("input");
    street.type = "text";
    street.setAttribute("aria-label", "Street");

    const city = document.createElement("input");
    city.type = "text";
    city.setAttribute("aria-label", "City");

    group.append(street, city);
    document.body.append(group);

    const label = document.createElement(GROUP_LABEL_TAG) as DtGroupLabelElement;
    label.htmlFor = "delivery-group";
    label.content = "Delivery address";
    label.optional = true;
    label.hint = "Used for shipping updates.";
    document.body.append(label);

    expect(label.id).toMatch(/^dt-group-label-/);
    expect(group.getAttribute("aria-labelledby")).toContain(label.id);
    expect(group.getAttribute("aria-describedby")).toContain(`${label.id}-hint`);

    const optional = label.shadowRoot?.querySelector('[part="optional-indicator"]');
    const hint = label.shadowRoot?.querySelector('[part="hint"]');
    expect(optional).toHaveTextContent("Optional");
    expect(hint).toHaveTextContent("Used for shipping updates.");
    expect(hint).toHaveAttribute("id", `${label.id}-hint`);

    label.shadowRoot
      ?.querySelector("label")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.activeElement).toBe(street);
  });

  it("preserves unrelated accessible-description tokens when retargeted or removed", () => {
    const first = document.createElement("div");
    first.id = "first-group";
    first.setAttribute("aria-describedby", "first-help");
    const second = document.createElement("div");
    second.id = "second-group";
    second.setAttribute("aria-describedby", "second-help");
    document.body.append(first, second);

    const label = document.createElement(GROUP_LABEL_TAG) as DtGroupLabelElement;
    label.htmlFor = first.id;
    label.content = "Delivery address";
    label.hint = "Used for shipping updates.";
    document.body.append(label);

    expect(first.getAttribute("aria-describedby")?.split(/\s+/)).toEqual([
      "first-help",
      `${label.id}-hint`,
    ]);

    label.htmlFor = second.id;
    expect(first).toHaveAttribute("aria-describedby", "first-help");
    expect(second.getAttribute("aria-describedby")?.split(/\s+/)).toEqual([
      "second-help",
      `${label.id}-hint`,
    ]);

    label.remove();
    expect(second).toHaveAttribute("aria-describedby", "second-help");
  });

  it("keeps checkbox semantics for direct targets and prioritizes title over tooltip text", () => {
    const checkbox = document.createElement("input");
    checkbox.id = "updates-checkbox";
    checkbox.type = "checkbox";
    document.body.append(checkbox);

    const label = document.createElement(GROUP_LABEL_TAG) as DtGroupLabelElement;
    label.htmlFor = "updates-checkbox";
    label.content = "Receive updates";
    label.required = true;
    label.tooltipText = "Secondary";
    label.tooltip = "Primary";
    document.body.append(label);

    const shadowLabel = label.shadowRoot?.querySelector("label");
    expect(shadowLabel).toHaveAttribute("title", "Primary");
    expect(
      label.shadowRoot?.querySelector('[part="required-indicator"]'),
    ).toHaveTextContent("*");
    expect(label.shadowRoot?.querySelector('[part="required-text"]')).toHaveTextContent(
      "(required)",
    );

    shadowLabel?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(checkbox.checked).toBe(true);
    expect(document.activeElement).toBe(checkbox);
  });

  it("renders decorative chrome with localized defaults, presentational structure, and reduced-motion plus forced-colors hooks", () => {
    const frame = document.createElement(
      MAC_WINDOW_FRAME_TAG,
    ) as DtMacWindowFrameElement;
    frame.textContent = "Framed content";
    document.body.append(frame);

    const root = frame.shadowRoot?.querySelector('[part~="frame"]');
    const title = frame.shadowRoot?.querySelector('[part="title"]');
    const body = frame.shadowRoot?.querySelector('[part="body"]');
    const controls = frame.shadowRoot?.querySelector('[part="controls"]');
    const style = frame.shadowRoot?.querySelector("style")?.textContent ?? "";

    expect(root).toHaveAttribute("data-component-id", "mac_window_frame");
    expect(title).toHaveTextContent("Using Early LLMs");
    expect(body).toHaveAttribute("role", "group");
    expect(body).toHaveAttribute("aria-label", "Window content");
    expect(frame.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
    expect(frame.getAttribute("role")).not.toBe("dialog");
    expect(controls).toHaveAttribute("aria-hidden", "true");
    expect(frame.shadowRoot?.querySelector('[part="action"]')).toBeNull();
    expect(frame.shadowRoot?.querySelector('[part="toolbar-placeholder"]')).toBeInTheDocument();
    expect(style).toContain("@media (prefers-reduced-motion: reduce)");
    expect(style).toContain("@media (forced-colors: active)");

    frame.lang = "fi";
    expect(frame.shadowRoot?.querySelector('[part="title"]')).toHaveTextContent(
      "Varhaiset LLM:t käytössä",
    );
    expect(frame.shadowRoot?.querySelector('[part="body"]')).toHaveAttribute(
      "aria-label",
      "Ikkunan sisältö",
    );
  });

  it("supports title, toolbar, and content slots and dispatches an action event without pretending to be a real window", async () => {
    const frame = document.createElement(
      MAC_WINDOW_FRAME_TAG,
    ) as DtMacWindowFrameElement;
    frame.actionLabelKey = "macWindowFrame.action";

    const title = document.createElement("span");
    title.slot = "title";
    title.textContent = "Custom title";
    frame.append(title);

    const toolbar = document.createElement("button");
    toolbar.type = "button";
    toolbar.slot = "toolbar";
    toolbar.textContent = "Download";
    frame.append(toolbar);

    const content = document.createElement("pre");
    content.slot = "content";
    content.textContent = "Slot content";
    frame.append(content);

    const onAction = vi.fn();
    const actionEvents = vi.fn();
    frame.onAction = onAction;
    frame.addEventListener("action-click", actionEvents);
    document.body.append(frame);

    const titleSlot = frame.shadowRoot?.querySelector(
      'slot[name="title"]',
    ) as HTMLSlotElement | null;
    const toolbarSlot = frame.shadowRoot?.querySelector(
      'slot[name="toolbar"]',
    ) as HTMLSlotElement | null;
    const contentSlot = frame.shadowRoot?.querySelector(
      'slot[name="content"]',
    ) as HTMLSlotElement | null;

    expect(titleSlot?.assignedElements({ flatten: true })[0]).toBe(title);
    expect(toolbarSlot?.assignedElements({ flatten: true })[0]).toBe(toolbar);
    expect(contentSlot?.assignedElements({ flatten: true })[0]).toBe(content);
    expect(frame.shadowRoot?.querySelector('[part="action"]')).toBeNull();
    expect(frame.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();

    frame.removeChild(toolbar);
    await nextTick();
    frame.shadowRoot
      ?.querySelector<HTMLButtonElement>('[part="action"]')
      ?.click();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(actionEvents).toHaveBeenCalledTimes(1);
  });
});
