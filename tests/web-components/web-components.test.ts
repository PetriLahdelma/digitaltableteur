import { waitFor } from "@testing-library/dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { defineElements } from "../../packages/web-components/src/index";
import {
  defineNativeElements,
  DtAlertBannerElement,
  DtBadgeElement,
  DtButtonElement,
  DtButtonGroupElement,
  DtDividerElement,
  DtEmptyStateElement,
  DtFilterChipElement,
  DtIconElement,
  DtIconButtonElement,
  DtLinkElement,
  DtNavLinkElement,
  DtProgressElement,
  DtSkipLinkElement,
  DtSpinnerElement,
  DtStatusDotElement,
  DtTextInputElement,
  DtTextAreaElement,
  DtCheckboxElement,
  DtSwitchElement,
} from "../../packages/web-components/src/native";
import {
  DtBadgeReactElement,
  DtButtonReactElement,
} from "../../packages/web-components/src/generated/react-adapters";
import { defineElementSet } from "../../packages/web-components/src/registry";

const NATIVE_TAGS = [
  "dt-icon",
  "dt-button",
  "dt-icon-button",
  "dt-button-group",
  "dt-filter-chip",
  "dt-link",
  "dt-nav-link",
  "dt-skip-link",
  "dt-badge",
  "dt-status-dot",
  "dt-divider",
  "dt-spinner",
  "dt-progress",
  "dt-alert-banner",
  "dt-empty-state",
  "dt-text-input",
  "dt-text-area",
  "dt-checkbox",
  "dt-switch",
] as const;

beforeAll(() => {
  customElements.define("dt-legacy-button", DtButtonReactElement);
  customElements.define("dt-legacy-badge", DtBadgeReactElement);
  defineElements();
});

afterAll(() => {
  document.body.replaceChildren();
});

describe("native registry", () => {
  it("registers the complete default fleet synchronously and idempotently", () => {
    expect(defineElements()).toEqual(NATIVE_TAGS);
    expect(defineNativeElements()).toEqual(NATIVE_TAGS);
    expect(customElements.get("dt-icon")).toBe(DtIconElement);
    expect(customElements.get("dt-button")).toBe(DtButtonElement);
    expect(customElements.get("dt-icon-button")).toBe(DtIconButtonElement);
    expect(customElements.get("dt-button-group")).toBe(DtButtonGroupElement);
    expect(customElements.get("dt-filter-chip")).toBe(DtFilterChipElement);
    expect(customElements.get("dt-link")).toBe(DtLinkElement);
    expect(customElements.get("dt-nav-link")).toBe(DtNavLinkElement);
    expect(customElements.get("dt-skip-link")).toBe(DtSkipLinkElement);
    expect(customElements.get("dt-badge")).toBe(DtBadgeElement);
    expect(customElements.get("dt-status-dot")).toBe(DtStatusDotElement);
    expect(customElements.get("dt-divider")).toBe(DtDividerElement);
    expect(customElements.get("dt-spinner")).toBe(DtSpinnerElement);
    expect(customElements.get("dt-progress")).toBe(DtProgressElement);
    expect(customElements.get("dt-alert-banner")).toBe(DtAlertBannerElement);
    expect(customElements.get("dt-empty-state")).toBe(DtEmptyStateElement);
    expect(customElements.get("dt-text-input")).toBe(DtTextInputElement);
    expect(customElements.get("dt-text-area")).toBe(DtTextAreaElement);
    expect(customElements.get("dt-checkbox")).toBe(DtCheckboxElement);
    expect(customElements.get("dt-switch")).toBe(DtSwitchElement);
  });

  it("rejects a mixed registry before defining any new tags", () => {
    class ExistingElement extends HTMLElement {}
    class CandidateElement extends HTMLElement {}
    const entries = new Map<string, CustomElementConstructor>([
      ["dt-conflict", ExistingElement],
    ]);
    const registry = {
      get: vi.fn((name: string) => entries.get(name)),
      define: vi.fn((name: string, constructor: CustomElementConstructor) => {
        entries.set(name, constructor);
      }),
    } as unknown as CustomElementRegistry;

    expect(() =>
      defineElementSet(
        [
          ["dt-new", CandidateElement],
          ["dt-conflict", CandidateElement],
        ],
        registry,
      ),
    ).toThrow(/another implementation is already defined/);
    expect(registry.define).not.toHaveBeenCalled();
  });
});

describe("native action and content elements", () => {
  it("renders Button slot content and preserves native click behavior", () => {
    const element = document.createElement("dt-button") as DtButtonElement;
    element.textContent = "Continue";
    element.variant = "secondary";
    element.disabled = true;
    const onClick = vi.fn();
    element.addEventListener("click", onClick);
    document.body.append(element);

    const button = element.shadowRoot?.querySelector("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("secondary");
    expect(button?.querySelector("slot:not([name])")).toBeTruthy();

    element.disabled = false;
    element.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("reacts when Button slot content is added after connection", async () => {
    const element = document.createElement("dt-button") as DtButtonElement;
    document.body.append(element);

    expect(element.shadowRoot?.querySelector('[part="label"]')).toBeNull();

    element.append("Continue later");

    await waitFor(() => {
      const label = element.shadowRoot?.querySelector('[part="label"]');
      const slot = label?.querySelector("slot") as HTMLSlotElement | null;
      expect(label).not.toBeNull();
      expect(
        slot
          ?.assignedNodes()
          .map((node) => node.textContent)
          .join(""),
      ).toBe("Continue later");
    });
  });

  it("renders Button as a safe disabled link and applies accessible metadata", () => {
    const externalLabel = document.createElement("span");
    externalLabel.id = "documentation-label";
    externalLabel.textContent = "Open documentation";
    document.body.append(externalLabel);

    const element = document.createElement("dt-button") as DtButtonElement;
    element.label = "Documentation";
    element.href = "/docs";
    element.target = "_blank";
    element.accessibleNameRef = externalLabel.id;
    element.accessibleDescription = "Opens the documentation";
    document.body.append(element);

    let anchor = element.shadowRoot?.querySelector("a");
    expect(anchor).toHaveAttribute("href", "/docs");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
    expect(anchor).toHaveAttribute("aria-labelledby", "accessible-name-ref");
    expect(
      element.shadowRoot?.querySelector("#accessible-name-ref"),
    ).toHaveTextContent("Open documentation");
    expect(anchor).toHaveAttribute(
      "aria-description",
      "Opens the documentation",
    );

    element.loading = true;
    anchor = element.shadowRoot?.querySelector("a");
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toHaveAttribute("aria-disabled", "true");
    expect(anchor).toHaveAttribute("aria-busy", "true");
    expect(anchor).toHaveAttribute("tabindex", "-1");
  });

  it("renders a submit Button with attribute fallbacks", () => {
    const element = document.createElement("dt-button") as DtButtonElement;
    element.label = "Save";
    element.submits = true;
    element.icon = "check";
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("button")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(
      element.shadowRoot?.querySelector('dt-icon[part="icon"]'),
    ).toHaveAttribute("name", "check");
  });

  it("dismisses a removable Badge and emits one composed remove event", () => {
    const element = document.createElement("dt-badge") as DtBadgeElement;
    element.textContent = "Beta";
    element.tone = "warning";
    element.removable = true;
    const onRemove = vi.fn();
    element.addEventListener("remove", onRemove);
    document.body.append(element);

    const remove = element.shadowRoot?.querySelector("button");
    expect(remove).toHaveAttribute("aria-label", "Remove badge");
    remove?.click();

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect((onRemove.mock.calls[0]?.[0] as CustomEvent).composed).toBe(true);
    expect(element.hidden).toBe(true);
  });

  it("renders StatusDot labels and Divider semantics", () => {
    const status = document.createElement(
      "dt-status-dot",
    ) as DtStatusDotElement;
    status.label = "Online";
    status.tone = "success";
    status.pulse = true;
    document.body.append(status);

    expect(status.shadowRoot?.querySelector('[part="dot"]')).toHaveClass(
      "success",
      "pulse",
    );
    expect(
      status.shadowRoot?.querySelector('[part="label"]'),
    ).toHaveTextContent("Online");

    const divider = document.createElement("dt-divider") as DtDividerElement;
    divider.orientation = "vertical";
    divider.decorative = false;
    document.body.append(divider);
    expect(divider.shadowRoot?.querySelector("hr")).toHaveAttribute(
      "role",
      "separator",
    );
    expect(divider.shadowRoot?.querySelector("hr")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("renders a named Icon with accessible image semantics", () => {
    const element = document.createElement("dt-icon") as DtIconElement;
    element.name = "check-circle";
    element.size = "lg";
    element.weight = "bold";
    element.ariaLabel = "Complete";
    element.rotate = 90;
    document.body.append(element);

    const root = element.shadowRoot?.querySelector('[part="root"]');
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAttribute("aria-label", "Complete");
    expect(root).toHaveClass("lg");
    expect(element.shadowRoot?.querySelector("svg")).toBeTruthy();
    expect(element.shadowRoot?.querySelector("svg")).toHaveStyle({
      transform: "rotate(90deg)",
    });
  });

  it("renders AlertBanner tone semantics, slots, and dismiss event", () => {
    const element = document.createElement(
      "dt-alert-banner",
    ) as DtAlertBannerElement;
    element.tone = "error";
    element.titleText = "Upload failed";
    element.description = "Try the upload again.";
    element.dismissible = true;
    const onDismiss = vi.fn();
    element.addEventListener("dismiss", onDismiss);
    document.body.append(element);

    const banner = element.shadowRoot?.querySelector('[part="banner"]');
    expect(banner).toHaveAttribute("role", "alert");
    expect(banner).toHaveAttribute("aria-live", "assertive");
    expect(
      element.shadowRoot?.querySelector('[part="title"]'),
    ).toHaveTextContent("Upload failed");
    expect(
      element.shadowRoot?.querySelector('[part="description"]'),
    ).toHaveTextContent("Try the upload again.");

    element.shadowRoot?.querySelector("button")?.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect((onDismiss.mock.calls[0]?.[0] as CustomEvent).composed).toBe(true);
  });
});

describe("native action and navigation composition", () => {
  it("composes IconButton from the native Button and preserves one click", () => {
    const element = document.createElement(
      "dt-icon-button",
    ) as DtIconButtonElement;
    element.label = "Open menu";
    element.icon = "list";
    const onClick = vi.fn();
    element.addEventListener("click", onClick);
    document.body.append(element);

    const button = element.shadowRoot?.querySelector("dt-button");
    expect(button).toHaveAttribute("accessible-name", "Open menu");
    expect(button).toHaveAttribute("icon", "list");
    expect(button).toHaveAttribute("variant", "tertiary");
    expect(button).toHaveAttribute("rounded");
    expect(
      button?.shadowRoot?.querySelector('dt-icon[name="list"]'),
    ).toBeTruthy();
    expect(DtIconButtonElement.formAssociated).toBe(true);

    element.submits = true;
    expect(element.shadowRoot?.querySelector("dt-button")).toHaveAttribute(
      "submits",
    );

    element.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps FilterChip controlled while exposing pressed and count semantics", () => {
    const element = document.createElement(
      "dt-filter-chip",
    ) as DtFilterChipElement;
    element.textContent = "Articles";
    element.pressed = true;
    element.count = 12;
    const onClick = vi.fn();
    element.addEventListener("click", onClick);
    document.body.append(element);

    const button = element.shadowRoot?.querySelector("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("pill", "md");
    expect(button?.querySelector('[part="count"]')).toHaveTextContent("(12)");

    button?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(element.pressed).toBe(true);
  });

  it("renders secure Link destinations and rejects executable protocols", () => {
    const element = document.createElement("dt-link") as DtLinkElement;
    element.textContent = "External documentation";
    element.href = "https://example.com/docs";
    element.target = "_blank";
    document.body.append(element);

    let anchor = element.shadowRoot?.querySelector("a");
    expect(anchor).toHaveAttribute("href", "https://example.com/docs");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      anchor?.querySelector('dt-icon[name="arrow-square-out"]'),
    ).toBeTruthy();

    element.href = "javascript:alert(1)";
    anchor = element.shadowRoot?.querySelector("a");
    expect(anchor).toHaveAttribute("href", "#");
    expect(anchor?.querySelector("dt-icon")).toBeNull();
  });

  it("uses the canonical 16px wavy underline period for Link", () => {
    const element = document.createElement("dt-link") as DtLinkElement;
    element.textContent = "Documentation";
    document.body.append(element);

    const styles = element.shadowRoot?.querySelector("style")?.textContent;
    expect(styles).toContain("mask-image: var(--wavy-underline-mask)");
    expect(styles).toContain("mask-repeat: repeat-x");
    expect(styles).toContain("mask-size: 16px 6px");
  });

  it("matches NavLink only at path boundaries and removes the current-page link", () => {
    const element = document.createElement("dt-nav-link") as DtNavLinkElement;
    element.textContent = "Work";
    element.href = "/work";
    element.currentPath = "/workshops";
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("dt-link")).toBeTruthy();
    expect(
      element.shadowRoot?.querySelector('[aria-current="page"]'),
    ).toBeNull();

    element.currentPath = "/work/case-study";
    expect(element.shadowRoot?.querySelector("dt-link")).toHaveAttribute(
      "aria-current",
      "page",
    );

    element.currentPath = "/work";
    expect(element.shadowRoot?.querySelector("dt-link")).toBeNull();
    expect(element.shadowRoot?.querySelector("span")).toHaveAttribute(
      "aria-current",
      "page",
    );

    element.exact = true;
    element.currentPath = "/work/case-study";
    expect(element.shadowRoot?.querySelector("dt-link")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders SkipLink with native focus-reveal semantics", () => {
    const element = document.createElement("dt-skip-link") as DtSkipLinkElement;
    element.textContent = "Skip navigation";
    document.body.append(element);

    const anchor = element.shadowRoot?.querySelector("a");
    expect(anchor).toHaveAttribute("href", "#main-content");
    expect(anchor?.querySelector("slot")).toBeTruthy();

    element.href = "javascript:alert(1)";
    expect(element.shadowRoot?.querySelector("a")).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("composes EmptyState heading, description, icon, and action slot", () => {
    const element = document.createElement(
      "dt-empty-state",
    ) as DtEmptyStateElement;
    element.titleText = "No results";
    element.description = "Try another filter.";
    element.icon = "magnifying-glass";
    element.headingLevel = "h3";
    const action = document.createElement("dt-button");
    action.slot = "action";
    action.textContent = "Clear filters";
    element.append(action);
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("h3")).toHaveTextContent(
      "No results",
    );
    expect(
      element.shadowRoot?.querySelector("dt-icon[decorative]"),
    ).toHaveAttribute("name", "magnifying-glass");
    expect(
      element.shadowRoot?.querySelector('[part="description"]'),
    ).toHaveTextContent("Try another filter.");
    expect(
      element.shadowRoot?.querySelector('slot[name="action"]'),
    ).toBeTruthy();
  });

  it("groups slotted controls and assigns attached edge positions", async () => {
    const group = document.createElement(
      "dt-button-group",
    ) as DtButtonGroupElement;
    group.ariaLabel = "View options";
    const first = document.createElement("dt-button");
    const second = document.createElement("dt-icon-button");
    group.append(first, second);
    document.body.append(group);

    expect(group.shadowRoot?.querySelector('[role="group"]')).toHaveAttribute(
      "aria-label",
      "View options",
    );
    await waitFor(() => {
      expect(first).toHaveAttribute("data-dt-group-position", "first");
      expect(second).toHaveAttribute("data-dt-group-position", "last");
    });

    group.attached = false;
    expect(first).not.toHaveAttribute("data-dt-group-position");
    expect(second).not.toHaveAttribute("data-dt-group-position");
  });
});

describe("legacy React adapter entrypoint", () => {
  it("keeps the Button adapter available only when explicitly registered", async () => {
    const element = document.createElement("dt-legacy-button");
    element.setAttribute("label", "Legacy action");
    document.body.append(element);

    await waitFor(() => {
      expect(element.querySelector("button")).toHaveTextContent(
        "Legacy action",
      );
    });
  });

  it("keeps the Badge adapter remove-event bridge intact", async () => {
    const element = document.createElement("dt-legacy-badge");
    element.setAttribute("label", "Legacy badge");
    element.setAttribute("removable", "true");
    const onRemove = vi.fn();
    element.addEventListener("remove", onRemove);
    document.body.append(element);

    const remove = await waitFor(() => {
      const rendered = element.querySelector("button");
      expect(rendered).toBeTruthy();
      return rendered as HTMLButtonElement;
    });
    remove.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("existing native feedback elements", () => {
  it("renders an accessible spinner and normalizes unsupported sizes", () => {
    const spinner = document.createElement("dt-spinner") as DtSpinnerElement;
    spinner.label = "Loading portfolio";
    spinner.size = "lg";
    document.body.append(spinner);

    const indicator = spinner.shadowRoot?.querySelector('[role="status"]');
    expect(indicator).toHaveAttribute("aria-label", "Loading portfolio");
    expect(indicator).toHaveClass("lg");

    spinner.setAttribute("size", "unsupported");
    expect(spinner.shadowRoot?.querySelector('[role="status"]')).toHaveClass(
      "md",
    );
  });

  it("keeps progress ARIA and visual state valid as attributes change", () => {
    const progress = document.createElement("dt-progress") as DtProgressElement;
    progress.value = 140;
    progress.max = 100;
    progress.state = "success";
    document.body.append(progress);

    const track = progress.shadowRoot?.querySelector('[role="progressbar"]');
    const bar = progress.shadowRoot?.querySelector('[part="bar"]');
    expect(track).toHaveAttribute("aria-valuenow", "100");
    expect(track).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveClass("success");
    expect(bar).toHaveStyle({ transform: "scaleX(1)" });

    progress.indeterminate = true;
    expect(
      progress.shadowRoot?.querySelector('[role="progressbar"]'),
    ).not.toHaveAttribute("aria-valuenow");
    expect(progress.shadowRoot?.querySelector('[part="bar"]')).toHaveClass(
      "indeterminate",
    );
  });
});
