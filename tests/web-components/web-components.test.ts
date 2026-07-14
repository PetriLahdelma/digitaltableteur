import { waitFor } from "@testing-library/dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { defineElements } from "../../packages/web-components/src/index";
import {
  defineNativeElements,
  DtProgressElement,
  DtSpinnerElement,
} from "../../packages/web-components/src/native";
import {
  DtBadgeReactElement,
  DtButtonReactElement,
} from "../../packages/web-components/src/generated/react-adapters";
import { defineElementSet } from "../../packages/web-components/src/registry";

const REACT_BUTTON_TAG = "dt-button";
const REACT_BADGE_TAG = "dt-badge";

beforeAll(() => {
  if (!customElements.get(REACT_BUTTON_TAG)) {
    customElements.define(REACT_BUTTON_TAG, DtButtonReactElement);
  }
  if (!customElements.get(REACT_BADGE_TAG)) {
    customElements.define(REACT_BADGE_TAG, DtBadgeReactElement);
  }
});

afterAll(() => {
  document.body.replaceChildren();
});

describe("native custom elements", () => {
  it("registers idempotently and renders an accessible spinner", () => {
    expect(defineNativeElements()).toEqual(["dt-spinner", "dt-progress"]);
    expect(defineNativeElements()).toEqual(["dt-spinner", "dt-progress"]);
    expect(customElements.get("dt-spinner")).toBe(DtSpinnerElement);

    const spinner = document.createElement("dt-spinner");
    spinner.setAttribute("label", "Loading portfolio");
    spinner.setAttribute("size", "lg");
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
    defineNativeElements();
    const progress = document.createElement("dt-progress");
    progress.setAttribute("value", "140");
    progress.setAttribute("max", "100");
    progress.setAttribute("state", "success");
    document.body.append(progress);

    const track = progress.shadowRoot?.querySelector('[role="progressbar"]');
    const bar = progress.shadowRoot?.querySelector('[part="bar"]');
    expect(track).toHaveAttribute("aria-valuenow", "100");
    expect(track).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveClass("success");
    expect(bar).toHaveStyle({ transform: "scaleX(1)" });

    progress.toggleAttribute("indeterminate", true);
    expect(
      progress.shadowRoot?.querySelector('[role="progressbar"]'),
    ).not.toHaveAttribute("aria-valuenow");
    expect(progress.shadowRoot?.querySelector('[part="bar"]')).toHaveClass(
      "indeterminate",
    );
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

describe("React quick-port adapters", () => {
  it("renders Button attributes and preserves the native click event", async () => {
    const buttonElement = document.createElement(REACT_BUTTON_TAG);
    buttonElement.setAttribute("label", "Continue");
    buttonElement.setAttribute("variant", "secondary");
    buttonElement.toggleAttribute("disabled", true);
    const onClick = vi.fn();
    buttonElement.addEventListener("click", onClick);
    document.body.append(buttonElement);

    const button = await waitFor(() => {
      const rendered = buttonElement.querySelector("button");
      expect(rendered).toBeTruthy();
      return rendered as HTMLButtonElement;
    });
    expect(button).toHaveTextContent("Continue");
    expect(button).toBeDisabled();
    buttonElement.toggleAttribute("disabled", false);
    await waitFor(() => expect(buttonElement.querySelector("button")).toBeEnabled());
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("converts the Badge callback to a composed remove event", async () => {
    const badgeElement = document.createElement(REACT_BADGE_TAG);
    badgeElement.setAttribute("label", "Beta");
    badgeElement.setAttribute("removable", "true");
    const onRemove = vi.fn();
    badgeElement.addEventListener("remove", onRemove);
    document.body.append(badgeElement);

    const removeButton = await waitFor(() => {
      const rendered = badgeElement.querySelector("button");
      expect(rendered).toBeTruthy();
      return rendered as HTMLButtonElement;
    });
    removeButton.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect((onRemove.mock.calls[0]?.[0] as CustomEvent).composed).toBe(true);
  });

  it("registers the hybrid fleet with native implementations preferred", async () => {
    const tags = await defineElements();
    expect(tags).toEqual([
      "dt-spinner",
      "dt-progress",
      "dt-button",
      "dt-badge",
    ]);
    expect(customElements.get("dt-spinner")).toBe(DtSpinnerElement);
    expect(customElements.get("dt-progress")).toBe(DtProgressElement);
  });
});
