import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { DtIconElement } from "../../packages/web-components/src/native/icon";
import { DtButtonElement } from "../../packages/web-components/src/native/button";
import { DtIconButtonElement } from "../../packages/web-components/src/native/icon-button";
import {
  DtModalElement,
  type DtModalDismissReason,
} from "../../packages/web-components/src/native/modal";
import { DtTooltipElement } from "../../packages/web-components/src/native/tooltip";

beforeAll(() => {
  if (!customElements.get("dt-button")) {
    customElements.define("dt-button", DtButtonElement);
  }
  if (!customElements.get("dt-icon")) {
    customElements.define("dt-icon", DtIconElement);
  }
  if (!customElements.get("dt-icon-button")) {
    customElements.define("dt-icon-button", DtIconButtonElement);
  }
  if (!customElements.get("dt-modal")) {
    customElements.define("dt-modal", DtModalElement);
  }
  if (!customElements.get("dt-tooltip")) {
    customElements.define("dt-tooltip", DtTooltipElement);
  }
});

beforeEach(() => {
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

afterEach(() => {
  document.body.replaceChildren();
  document.body.style.overflow = "";
  vi.clearAllTimers();
  vi.useRealTimers();
});

function nextTick() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

describe("native modal and tooltip", () => {
  it("treats close-icon-name as data instead of executable markup", () => {
    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Safe dialog";
    modal.showCloseIcon = true;
    modal.closeIconName = 'x\"><img src=x onerror="globalThis.injected=true">';
    modal.defaultOpen = true;
    document.body.append(modal);

    const closeButton = modal.shadowRoot?.querySelector("dt-icon-button");
    const button = closeButton?.shadowRoot?.querySelector("dt-button");
    const icon = button?.shadowRoot?.querySelector("dt-icon");
    expect(closeButton).toHaveAttribute("part", "close-button");
    expect(closeButton).toHaveAttribute("label", "Close dialog");
    expect(closeButton).toHaveAttribute("variant", "tertiary");
    expect(closeButton).toHaveAttribute("icon", modal.closeIconName);
    expect(icon?.getAttribute("name")).toBe(modal.closeIconName);
    expect(icon?.shadowRoot?.querySelector("img, [onerror]")).toBeNull();
    expect(
      modal.shadowRoot?.querySelector(
        "img, dt-icon-button img, dt-icon-button [onerror]",
      ),
    ).toBeNull();
  });

  it("uses the design-system IconButton for its close control", () => {
    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Composable dialog";
    modal.showCloseIcon = true;
    modal.defaultOpen = true;
    document.body.append(modal);

    const closeButton = modal.shadowRoot?.querySelector(
      '[part="close-button"]',
    );
    expect(closeButton?.tagName).toBe("DT-ICON-BUTTON");
    expect(closeButton).toHaveAttribute("icon", "x");
    expect(closeButton).toHaveAttribute("size", "md");
  });

  it("uses the design-system Button for its default acknowledgement", () => {
    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Acknowledgement";
    modal.defaultOpen = true;
    document.body.append(modal);

    const action = modal.shadowRoot?.querySelector('[part="default-action"]');
    expect(action?.tagName).toBe("DT-BUTTON");
    expect(action).toHaveAttribute("label", "OK");
  });

  it("renders modal dialog semantics and closes itself when uncontrolled", async () => {
    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Confirm changes";
    modal.description = "Your edits will be applied immediately.";
    modal.showCloseIcon = true;
    modal.defaultOpen = true;
    modal.textContent = "Modal body";
    document.body.append(modal);

    const panel =
      modal.shadowRoot?.querySelector<HTMLElement>('[role="dialog"]');
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    expect(panel?.getAttribute("aria-labelledby")).toContain("dt-modal-title-");
    expect(panel?.getAttribute("aria-describedby")).toContain(
      "dt-modal-description-",
    );

    const dismissEvents: DtModalDismissReason[] = [];
    const openChanges: Array<{ open: boolean; reason: string }> = [];
    modal.addEventListener("dismiss-request", (event) => {
      dismissEvents.push(
        (event as CustomEvent<{ reason: DtModalDismissReason }>).detail.reason,
      );
    });
    modal.addEventListener("open-change", (event) => {
      openChanges.push(
        (event as CustomEvent<{ open: boolean; reason: string }>).detail,
      );
    });

    modal.shadowRoot
      ?.querySelector<HTMLButtonElement>('[part="close-button"]')
      ?.click();
    await nextTick();

    expect(modal.open).toBe(false);
    expect(dismissEvents).toEqual(["close-button"]);
    expect(openChanges).toContainEqual({
      open: false,
      reason: "close-button",
    });
  });

  it("keeps controlled modal open until the host updates open itself", async () => {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "Open";
    document.body.append(trigger);
    trigger.focus();

    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.controlled = true;
    modal.open = true;
    modal.dialogTitle = "Controlled dialog";
    modal.showCloseIcon = true;
    document.body.append(modal);

    let dismissReason: string | null = null;
    modal.addEventListener("dismiss-request", (event) => {
      dismissReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    modal.shadowRoot
      ?.querySelector<HTMLDivElement>('[part="overlay"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();

    expect(dismissReason).toBe("backdrop");
    expect(modal.open).toBe(true);

    modal.open = false;
    await nextTick();
    expect(document.activeElement).toBe(trigger);
  });

  it("places focus inside the modal, traps tab order, and restores focus on close", async () => {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "Launch";
    document.body.append(trigger);
    trigger.focus();

    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Focusable dialog";
    modal.showCloseIcon = true;

    const nameField = document.createElement("button");
    nameField.type = "button";
    nameField.textContent = "Body action";
    nameField.autofocus = true;
    modal.append(nameField);

    const footerAction = document.createElement("button");
    footerAction.type = "button";
    footerAction.slot = "footer";
    footerAction.textContent = "Save";
    modal.append(footerAction);

    document.body.append(modal);
    modal.show();
    await nextTick();

    expect(document.activeElement).toBe(nameField);

    footerAction.focus();
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    await nextTick();
    expect(modal.shadowRoot?.activeElement).toBe(
      modal.shadowRoot?.querySelector('[part="close-button"]'),
    );

    const closeButton = modal.shadowRoot?.querySelector<HTMLButtonElement>(
      '[part="close-button"]',
    );
    closeButton?.focus();
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await nextTick();
    expect(document.activeElement).toBe(footerAction);

    modal.close();
    await nextTick();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("includes nested design-system controls in the composed focus order", async () => {
    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Composed controls";
    modal.showCloseIcon = true;

    const field = document.createElement("dt-button");
    field.setAttribute("label", "Body action");
    field.setAttribute("autofocus", "");
    modal.append(field);

    const footer = document.createElement("dt-button");
    footer.slot = "footer";
    footer.setAttribute("label", "Save");
    modal.append(footer);

    document.body.append(modal);
    modal.show();
    await nextTick();
    expect(document.activeElement).toBe(field);

    footer.focus();
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    await nextTick();
    expect(modal.shadowRoot?.activeElement?.tagName).toBe("DT-ICON-BUTTON");
  });

  it("opens tooltip on hover after delay and wires aria-describedby onto the trigger", async () => {
    vi.useFakeTimers();

    const tooltip = document.createElement("dt-tooltip") as DtTooltipElement;
    tooltip.delay = 200;
    tooltip.content = "Tip content";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "Trigger";
    tooltip.append(trigger);
    document.body.append(tooltip);

    trigger.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    vi.advanceTimersByTime(199);
    expect(tooltip.open).toBe(false);

    vi.advanceTimersByTime(1);
    await nextTick();

    expect(tooltip.open).toBe(true);
    expect(trigger.getAttribute("aria-describedby")).toContain("dt-tooltip-");
    expect(
      tooltip.shadowRoot
        ?.querySelector('[role="tooltip"]')
        ?.hasAttribute("hidden"),
    ).toBe(false);
  });

  it("does not auto-close a controlled tooltip on Escape", async () => {
    const tooltip = document.createElement("dt-tooltip") as DtTooltipElement;
    tooltip.controlled = true;
    tooltip.open = true;
    tooltip.content = "Controlled";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "Focus me";
    tooltip.append(trigger);
    document.body.append(tooltip);

    let dismissReason: string | null = null;
    tooltip.addEventListener("dismiss-request", (event) => {
      dismissReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await nextTick();

    expect(dismissReason).toBe("escape");
    expect(tooltip.open).toBe(true);
  });
});

describe("native review regressions (#1224)", () => {
  it("inerts background siblings while open and restores on disconnect", () => {
    const sibling = document.createElement("div");
    sibling.id = "background";
    document.body.append(sibling);

    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Dialog";
    modal.defaultOpen = true;
    document.body.append(modal);

    expect(sibling.hasAttribute("inert")).toBe(true);

    modal.remove();
    expect(sibling.hasAttribute("inert")).toBe(false);
  });

  it("seeds default-open even when the attribute arrives after connection", () => {
    const tooltip = document.createElement("dt-tooltip") as DtTooltipElement;
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    tooltip.append(trigger);
    document.body.append(tooltip); // frameworks apply attributes post-connect

    tooltip.setAttribute("default-open", "");
    expect(tooltip.open).toBe(true);

    // Seeding is one-shot: after the host closes it, re-adding default-open
    // must not override that interaction.
    tooltip.removeAttribute("open");
    tooltip.removeAttribute("default-open");
    tooltip.setAttribute("default-open", "");
    expect(tooltip.open).toBe(false);
  });

  it("re-appends the tooltip description after disconnect and reconnect", () => {
    const tooltip = document.createElement("dt-tooltip") as DtTooltipElement;
    const trigger = document.createElement("button");
    trigger.textContent = "Help";
    tooltip.append(trigger);
    tooltip.setAttribute("content", "Contextual hint");
    document.body.append(tooltip);
    const slotSelector = "[slot='__dt-tooltip-description']";
    expect(tooltip.querySelector(slotSelector)).not.toBeNull();

    tooltip.remove();
    document.body.append(tooltip);

    const description = tooltip.querySelector(slotSelector);
    // Description is re-appended and live in the tree, not a detached orphan that
    // a lingering aria-describedby would point at.
    expect(description).not.toBeNull();
    expect(description?.isConnected).toBe(true);
  });

  it("renders the heading from dialog-title and leaves the global title attribute to tooltips", () => {
    const modal = document.createElement("dt-modal") as DtModalElement;
    modal.dialogTitle = "Real heading";
    modal.title = "Just a tooltip";
    modal.defaultOpen = true;
    document.body.append(modal);

    expect(modal.shadowRoot?.querySelector("h2")?.textContent).toBe(
      "Real heading",
    );
    // dialogTitle no longer shadows HTMLElement.title, so both coexist.
    expect(modal.getAttribute("dialog-title")).toBe("Real heading");
    expect(modal.getAttribute("title")).toBe("Just a tooltip");
  });
});
