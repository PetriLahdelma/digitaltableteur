import { waitFor } from "@testing-library/dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { defineElements } from "../../packages/web-components/src/index";
import {
  defineNativeElements,
  DtAlertBannerElement,
  DtBadgeElement,
  DtButtonElement,
  DtDividerElement,
  DtIconElement,
  DtProgressElement,
  DtSpinnerElement,
  DtStatusDotElement,
} from "../../packages/web-components/src/native";
import {
  DtBadgeReactElement,
  DtButtonReactElement,
} from "../../packages/web-components/src/generated/react-adapters";
import { defineElementSet } from "../../packages/web-components/src/registry";

const NATIVE_TAGS = [
  "dt-icon",
  "dt-button",
  "dt-badge",
  "dt-status-dot",
  "dt-divider",
  "dt-spinner",
  "dt-progress",
  "dt-alert-banner",
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
    expect(customElements.get("dt-badge")).toBe(DtBadgeElement);
    expect(customElements.get("dt-status-dot")).toBe(DtStatusDotElement);
    expect(customElements.get("dt-divider")).toBe(DtDividerElement);
    expect(customElements.get("dt-spinner")).toBe(DtSpinnerElement);
    expect(customElements.get("dt-progress")).toBe(DtProgressElement);
    expect(customElements.get("dt-alert-banner")).toBe(DtAlertBannerElement);
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
