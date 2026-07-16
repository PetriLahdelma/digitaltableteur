import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  DtMultiComboboxElement,
  type DtMultiComboboxOption,
} from "../../packages/web-components/src/native/multi-combobox";
import {
  DtCookieConsentElement,
  type DtCookieConsentCategory,
  type DtCookieConsentPersistence,
} from "../../packages/web-components/src/native/cookie-consent";

type InternalsMock = {
  setFormValue: ReturnType<typeof vi.fn>;
  setValidity: ReturnType<typeof vi.fn>;
};

const internals = new WeakMap<HTMLElement, InternalsMock>();

const options: DtMultiComboboxOption[] = [
  { value: "research", label: "Research" },
  { value: "disabled", label: "Unavailable", disabled: true },
  { value: "design", label: "Design" },
  { value: "accessibility", label: "Accessibility" },
];

const categories: DtCookieConsentCategory[] = [
  {
    id: "essential",
    label: "Essential",
    description: "Required for the service.",
    required: true,
  },
  { id: "analytics", label: "Analytics", description: "Anonymous usage." },
  { id: "marketing", label: "Marketing", description: "Relevant offers." },
];

function tick(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function createMultiCombobox(): DtMultiComboboxElement {
  const element = document.createElement(
    "dt-multi-combobox",
  ) as DtMultiComboboxElement;
  element.label = "Disciplines";
  element.name = "disciplines";
  element.options = options;
  element.placeholder = "Add disciplines";
  return element;
}

function createCookieConsent(): DtCookieConsentElement {
  const element = document.createElement(
    "dt-cookie-consent",
  ) as DtCookieConsentElement;
  element.categories = categories;
  return element;
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "attachInternals", {
    configurable: true,
    value() {
      const value = { setFormValue: vi.fn(), setValidity: vi.fn() };
      internals.set(this as HTMLElement, value);
      return value;
    },
  });
  if (!customElements.get("dt-multi-combobox")) {
    customElements.define("dt-multi-combobox", DtMultiComboboxElement);
  }
  if (!customElements.get("dt-cookie-consent")) {
    customElements.define("dt-cookie-consent", DtCookieConsentElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
  document.body.style.removeProperty("--cookie-banner-height");
  delete document.body.dataset.cookieBannerOpen;
  document.documentElement.lang = "en";
});

describe("native MultiCombobox", () => {
  it("renders the canonical multiselect combobox relationships", () => {
    const element = createMultiCombobox();
    element.helperText = "Pick all that apply.";
    element.required = true;
    document.body.append(element);

    const input = element.shadowRoot?.querySelector<HTMLInputElement>(
      'input[role="combobox"]',
    );
    expect(input).toHaveAttribute("placeholder", "Add disciplines");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input?.getAttribute("aria-labelledby")).toContain(
      "dt-multi-combobox-",
    );
    expect(input?.getAttribute("aria-describedby")).toContain("-helper");

    fireEvent.focus(input!);
    const listbox = element.shadowRoot?.querySelector('[role="listbox"]');
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(listbox).toHaveAttribute("data-lenis-prevent-wheel");
    expect(input?.getAttribute("aria-controls")).toContain("-listbox");
  });

  it("filters options and emits the complete next selection", () => {
    const element = createMultiCombobox();
    element.defaultValue = ["research"];
    const onValueChange = vi.fn();
    element.addEventListener("value-change", onValueChange);
    document.body.append(element);

    let input = element.shadowRoot?.querySelector<HTMLInputElement>(
      'input[role="combobox"]',
    );
    fireEvent.focus(input!);
    input = element.shadowRoot?.querySelector<HTMLInputElement>(
      'input[role="combobox"]',
    );
    fireEvent.input(input!, { target: { value: "des" } });

    const renderedOptions =
      element.shadowRoot?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]',
      );
    expect(renderedOptions).toHaveLength(1);
    expect(renderedOptions?.[0]).toHaveTextContent("Design");
    renderedOptions?.[0]?.click();

    expect(element.value).toEqual(["research", "design"]);
    expect((onValueChange.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: ["research", "design"],
    });
  });

  it("supports host-controlled selection without mutating local value", () => {
    const element = createMultiCombobox();
    element.value = ["research"];
    element.controlled = true;
    const onValueChange = vi.fn();
    element.addEventListener("value-change", onValueChange);
    document.body.append(element);

    fireEvent.focus(element.shadowRoot?.querySelector("input")!);
    element.shadowRoot
      ?.querySelectorAll<HTMLButtonElement>('[role="option"]')
      .item(2)
      .click();

    expect(element.value).toEqual(["research"]);
    expect(
      (onValueChange.mock.calls[0]?.[0] as CustomEvent).detail.value,
    ).toEqual(["research", "design"]);
  });

  it("skips disabled options during keyboard navigation and toggles with Enter", async () => {
    const element = createMultiCombobox();
    document.body.append(element);
    let input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;
    fireEvent.focus(input);
    await tick();
    input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;

    fireEvent.keyDown(input, { key: "ArrowDown" });
    await tick();
    input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;
    expect(input.getAttribute("aria-activedescendant")).toContain("-option-2");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(element.value).toEqual(["design"]);
  });

  it("removes the last chip with Backspace and individual chips by button", async () => {
    const element = createMultiCombobox();
    element.defaultValue = ["research", "design"];
    document.body.append(element);
    let input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;
    fireEvent.focus(input);
    input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(element.value).toEqual(["research"]);

    element.shadowRoot
      ?.querySelector<HTMLButtonElement>(
        '.chipRemove[aria-label="Remove Research"]',
      )
      ?.click();
    await tick();
    expect(element.value).toEqual([]);
    expect(element.shadowRoot?.activeElement).toBe(
      element.shadowRoot?.querySelector("input"),
    );
  });

  it("submits repeated form values and excludes disabled or unknown selections", () => {
    const element = createMultiCombobox();
    element.defaultValue = ["research", "disabled", "unknown", "design"];
    document.body.append(element);

    const setFormValue = internals.get(element)?.setFormValue;
    const submitted = setFormValue?.mock.calls.at(-1)?.[0] as FormData;
    expect([...submitted.entries()]).toEqual([
      ["disciplines", "research"],
      ["disciplines", "design"],
    ]);
  });

  it("reports required and custom validity and resets to the default value", () => {
    const element = createMultiCombobox();
    element.required = true;
    element.error = "Pick at least one discipline.";
    element.defaultValue = ["research"];
    element.value = [];
    document.body.append(element);

    expect(internals.get(element)?.setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Pick at least one discipline.",
      expect.any(HTMLInputElement),
    );

    element.formResetCallback();
    expect(element.value).toEqual(["research"]);
  });

  it("closes on Tab and outside pointer interaction without trapping focus", () => {
    const element = createMultiCombobox();
    document.body.append(element);
    let input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;
    fireEvent.focus(input);
    input = element.shadowRoot?.querySelector<HTMLInputElement>("input")!;
    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(element.shadowRoot?.querySelector('[role="listbox"]')).toBeNull();

    fireEvent.focus(element.shadowRoot?.querySelector("input")!);
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    expect(element.shadowRoot?.querySelector('[role="listbox"]')).toBeNull();
  });
});

describe("native CookieConsent", () => {
  it("shows an accessible banner by default without assuming a persistence policy", () => {
    const element = createCookieConsent();
    document.body.append(element);

    expect(element.storageKey).toBe("");
    expect(element.open).toBe(true);
    expect(
      element.shadowRoot?.querySelector('[role="region"]'),
    ).toHaveAttribute("aria-label", "Cookie preferences");
    expect(document.body.dataset.cookieBannerOpen).toBe("true");
    expect(
      element.shadowRoot?.querySelector('a[href="/privacy-policy"]'),
    ).toHaveTextContent("cookie policy");
  });

  it("does not auto-show when the host provides an existing consent value", () => {
    const element = createCookieConsent();
    element.value = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    document.body.append(element);

    expect(element.open).toBe(false);
    expect(element.shadowRoot?.querySelector('[role="region"]')).toBeNull();
  });

  it("accepts all categories, forces required consent, and emits composed events", () => {
    const element = createCookieConsent();
    const onChange = vi.fn();
    element.addEventListener("consent-change", onChange);
    document.body.append(element);

    element.acceptAll();

    expect(element.value).toEqual({
      essential: true,
      analytics: true,
      marketing: true,
    });
    expect(element.open).toBe(false);
    expect((onChange.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      type: "accept-all",
      value: { essential: true, analytics: true, marketing: true },
    });
    expect((onChange.mock.calls[0]?.[0] as CustomEvent).composed).toBe(true);
    expect(document.body.dataset.cookieBannerOpen).toBeUndefined();
  });

  it("supports strict controlled consent requests", () => {
    const element = createCookieConsent();
    element.controlled = true;
    const persistence: DtCookieConsentPersistence = {
      load: () => null,
      save: vi.fn(),
    };
    element.persistence = persistence;
    const onChange = vi.fn();
    element.addEventListener("consent-change", onChange);
    document.body.append(element);

    element.acceptAll();

    expect(element.value).toEqual({
      essential: true,
      analytics: false,
      marketing: false,
    });
    expect(element.open).toBe(true);
    expect(persistence.save).not.toHaveBeenCalled();
    expect(
      (onChange.mock.calls[0]?.[0] as CustomEvent).detail.value.analytics,
    ).toBe(true);
  });

  it("allows hosts to cancel a consent transition before persistence", () => {
    const element = createCookieConsent();
    const persistence: DtCookieConsentPersistence = {
      load: () => null,
      save: vi.fn(),
    };
    element.persistence = persistence;
    element.addEventListener("before-consent-change", (event) =>
      event.preventDefault(),
    );
    document.body.append(element);

    element.acceptAll();

    expect(element.open).toBe(true);
    expect(element.value.analytics).toBe(false);
    expect(persistence.save).not.toHaveBeenCalled();
  });

  it("loads and saves through host-provided persistence hooks", () => {
    const save = vi.fn();
    const element = createCookieConsent();
    element.persistence = {
      load: () => ({ essential: true, analytics: true, marketing: false }),
      save,
      clear: vi.fn(),
    };
    document.body.append(element);

    expect(element.open).toBe(false);
    expect(element.value.analytics).toBe(true);
    element.show();
    element.acceptRequired();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "accept-required",
        value: { essential: true, analytics: false, marketing: false },
      }),
      element,
    );
  });

  it("opens the settings dialog with required toggles locked", async () => {
    const element = createCookieConsent();
    document.body.append(element);

    element.shadowRoot?.querySelector<HTMLButtonElement>(".customize")?.click();
    await tick();

    const dialog = element.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "consent-title");
    expect(element.shadowRoot?.querySelector(".banner")).toHaveAttribute(
      "inert",
    );
    expect(element.shadowRoot?.querySelector(".banner")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    const toggles =
      element.shadowRoot?.querySelectorAll<HTMLInputElement>(".switch input");
    expect(toggles?.[0]).toBeChecked();
    expect(toggles?.[0]).toBeDisabled();
    expect(element.shadowRoot?.activeElement).toBe(
      element.shadowRoot?.querySelector(".close"),
    );
  });

  it("saves custom optional choices while preserving required categories", () => {
    const element = createCookieConsent();
    document.body.append(element);
    element.shadowRoot?.querySelector<HTMLButtonElement>(".customize")?.click();
    const toggles =
      element.shadowRoot?.querySelectorAll<HTMLInputElement>(".switch input");
    fireEvent.click(toggles?.[1]!);
    element.shadowRoot
      ?.querySelectorAll<HTMLButtonElement>(".footerActions button")
      .item(1)
      .click();

    expect(element.value).toEqual({
      essential: true,
      analytics: true,
      marketing: false,
    });
    expect(element.open).toBe(false);
  });

  it("traps modal focus, closes on Escape, and restores focus to Customize", async () => {
    const element = createCookieConsent();
    document.body.append(element);
    element.shadowRoot?.querySelector<HTMLButtonElement>(".customize")?.click();
    await tick();
    const close =
      element.shadowRoot?.querySelector<HTMLButtonElement>(".close")!;
    const controls = element.shadowRoot?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([disabled])",
    );
    controls?.item(controls.length - 1).focus();
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(element.shadowRoot?.activeElement).toBe(close);

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await tick();
    expect(element.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
    expect(element.shadowRoot?.activeElement).toBe(
      element.shadowRoot?.querySelector(".customize"),
    );
  });

  it("cleans body state and dialog listeners when disconnected", () => {
    const element = createCookieConsent();
    document.body.append(element);
    element.shadowRoot?.querySelector<HTMLButtonElement>(".customize")?.click();
    element.remove();

    expect(document.body.dataset.cookieBannerOpen).toBeUndefined();
    expect(document.body.style.getPropertyValue("--cookie-banner-height")).toBe(
      "",
    );
    expect(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    ).not.toThrow();
  });
});

describe("native review regressions (#1224/#1225)", () => {
  it("re-prompts when built-in stored consent has expired (GDPR max-age)", () => {
    const key = "dt-consent-expiry-regression";
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        timestamp: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString(),
        language: "en",
        categories: { essential: true, analytics: true, marketing: false },
      }),
    );
    const element = createCookieConsent();
    element.setAttribute("storage-key", key);
    document.body.append(element);
    expect(element.open).toBe(true);
    window.localStorage.removeItem(key);
  });

  it("honors built-in stored consent within the max-age", () => {
    const key = "dt-consent-fresh-regression";
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        timestamp: new Date().toISOString(),
        language: "en",
        categories: { essential: true, analytics: true, marketing: false },
      }),
    );
    const element = createCookieConsent();
    element.setAttribute("storage-key", key);
    document.body.append(element);
    expect(element.open).toBe(false);
    expect(element.value).toEqual({
      essential: true,
      analytics: true,
      marketing: false,
    });
    window.localStorage.removeItem(key);
  });

  it("defaults optional categories to opt-out (no pre-ticked consent)", () => {
    const element = createCookieConsent();
    document.body.append(element);
    expect(element.value).toEqual({
      essential: true,
      analytics: false,
      marketing: false,
    });
  });

  it("applies a form-level disable even when closed at rest", () => {
    const element = createMultiCombobox();
    document.body.append(element);
    element.formDisabledCallback(true);
    const input = element.shadowRoot?.querySelector<HTMLInputElement>("input");
    expect(input?.disabled).toBe(true);
  });

  it("uses dialog-title for the preferences heading and ignores the global title attribute", () => {
    const element = createCookieConsent();
    element.setAttribute("dialog-title", "Privacy choices");
    element.title = "hover tooltip";
    document.body.append(element);
    element.shadowRoot?.querySelector<HTMLButtonElement>(".customize")?.click();

    expect(element.shadowRoot?.querySelector("h2")?.textContent).toBe(
      "Privacy choices",
    );
  });

  it("falls back to the localized heading when only a title tooltip is present", () => {
    const element = createCookieConsent();
    element.title = "hover tooltip";
    document.body.append(element);
    element.shadowRoot?.querySelector<HTMLButtonElement>(".customize")?.click();

    expect(element.shadowRoot?.querySelector("h2")?.textContent).toBe(
      "Cookie consent",
    );
  });
});
