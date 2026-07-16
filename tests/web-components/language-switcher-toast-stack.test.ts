import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  DtLanguageSwitcherElement,
  type DtLanguageSwitcherOption,
} from "../../packages/web-components/src/native/language-switcher";
import { DtToastElement } from "../../packages/web-components/src/native/toast";
import {
  DtToastStackElement,
  type DtToastStackItem,
} from "../../packages/web-components/src/native/toast-stack";

const LANGUAGE_TAG = "dt-language-switcher";
const TOAST_TAG = "dt-toast";
const TOAST_STACK_TAG = "dt-toast-stack";

const languages: DtLanguageSwitcherOption[] = [
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fi", label: "FI", ariaLabel: "Vaihda kieli suomeksi" },
  { code: "sv", label: "SV", ariaLabel: "Byt språk till svenska" },
];

beforeAll(() => {
  if (!customElements.get(LANGUAGE_TAG)) {
    customElements.define(LANGUAGE_TAG, DtLanguageSwitcherElement);
  }
  if (!customElements.get(TOAST_TAG)) {
    customElements.define(TOAST_TAG, DtToastElement);
  }
  if (!customElements.get(TOAST_STACK_TAG)) {
    customElements.define(TOAST_STACK_TAG, DtToastStackElement);
  }
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  document.body.replaceChildren();
  document.documentElement.removeAttribute("lang");
});

function renderLanguageSwitcher(currentLang = "en"): DtLanguageSwitcherElement {
  const element = document.createElement(
    LANGUAGE_TAG,
  ) as DtLanguageSwitcherElement;
  element.languages = languages;
  element.currentLang = currentLang;
  document.body.append(element);
  return element;
}

function languageTrigger(
  element: DtLanguageSwitcherElement,
): HTMLButtonElement {
  const trigger =
    element.shadowRoot?.querySelector<HTMLButtonElement>(".trigger");
  if (!trigger) throw new Error("Missing language trigger");
  return trigger;
}

function languageOptions(
  element: DtLanguageSwitcherElement,
): HTMLButtonElement[] {
  return [
    ...(element.shadowRoot?.querySelectorAll<HTMLButtonElement>(".floated") ??
      []),
  ];
}

function renderToast({
  open = true,
  message = "Saved successfully.",
  tone,
  duration,
}: {
  open?: boolean;
  message?: string;
  tone?: "neutral" | "success" | "error" | "warning" | "info";
  duration?: number;
} = {}): DtToastElement {
  const element = document.createElement(TOAST_TAG) as DtToastElement;
  element.message = message;
  element.open = open;
  if (tone) element.tone = tone;
  if (duration !== undefined) element.duration = duration;
  document.body.append(element);
  return element;
}

function toastSurface(element: DtToastElement): HTMLElement {
  const surface = element.shadowRoot?.querySelector<HTMLElement>(".toast");
  if (!surface) throw new Error("Missing toast surface");
  return surface;
}

function renderToastStack(
  toasts: DtToastStackItem[],
  max?: number,
): DtToastStackElement {
  const element = document.createElement(
    TOAST_STACK_TAG,
  ) as DtToastStackElement;
  element.toasts = toasts;
  if (max !== undefined) element.max = max;
  document.body.append(element);
  return element;
}

describe("native LanguageSwitcher", () => {
  it("renders only the controlled current language while closed", () => {
    const element = renderLanguageSwitcher("en");
    const trigger = languageTrigger(element);
    const descriptionId = trigger.getAttribute("aria-controls");

    expect(trigger).toHaveTextContent("EN");
    expect(trigger).toHaveAttribute("aria-current", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAccessibleName(/english.*show language options/i);
    expect(descriptionId).toBeTruthy();
    expect(
      element.shadowRoot?.getElementById(descriptionId!),
    ).toHaveTextContent("Show language options");
    expect(languageOptions(element)).toHaveLength(0);
    expect(element.shadowRoot?.querySelector("[role='group']")).toHaveAttribute(
      "aria-label",
      "Language",
    );
  });

  it("opens in canonical fan order and applies state-specific class hooks", () => {
    const element = renderLanguageSwitcher("en");
    element.buttonClassName = "button-probe";
    element.openTriggerClassName = "open-probe";
    element.floatedButtonClassName = "floated-probe";

    languageTrigger(element).click();

    const trigger = languageTrigger(element);
    const options = languageOptions(element);
    expect(element.open).toBe(true);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveClass("button-probe", "open-probe");
    expect(options.map((option) => option.textContent)).toEqual(["SV", "FI"]);
    expect(options[0]).toHaveClass("button-probe", "floated-probe");
    expect(
      element.shadowRoot?.querySelector("[part='options']"),
    ).not.toHaveAttribute("inert");
  });

  it("emits a composed controlled change without mutating currentLang", () => {
    const host = document.createElement("div");
    const element = renderLanguageSwitcher("en");
    host.append(element);
    document.body.append(host);
    const listener = vi.fn();
    host.addEventListener("language-change", listener);

    languageTrigger(element).click();
    languageOptions(element)
      .find((option) => option.dataset.code === "fi")
      ?.click();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({
      detail: {
        code: "fi",
        language: languages[1],
      },
      bubbles: true,
      composed: true,
    });
    expect(element.currentLang).toBe("en");
    expect(languageTrigger(element)).toHaveTextContent("EN");
    expect(element.open).toBe(false);

    element.currentLang = "fi";
    expect(languageTrigger(element)).toHaveTextContent("FI");
  });

  it("closes on Escape and outside pointer interaction, returning focus", () => {
    const element = renderLanguageSwitcher();
    languageTrigger(element).click();
    languageOptions(element)[0]?.focus();

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(element.open).toBe(false);
    expect(element.shadowRoot?.activeElement).toBe(languageTrigger(element));

    languageTrigger(element).click();
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, composed: true }),
    );
    expect(element.open).toBe(false);
  });

  it("parses declarative data safely and localizes its chrome", () => {
    document.documentElement.lang = "fi";
    const element = document.createElement(
      LANGUAGE_TAG,
    ) as DtLanguageSwitcherElement;
    element.setAttribute("languages", JSON.stringify(languages));
    element.currentLang = "fi";
    document.body.append(element);

    expect(languageTrigger(element)).toHaveAccessibleName(
      /näytä kielivaihtoehdot/i,
    );
    expect(element.shadowRoot?.querySelector("[role='group']")).toHaveAttribute(
      "aria-label",
      "Kieli",
    );

    element.setAttribute("languages", "not json");
    expect(element.shadowRoot?.querySelector("button")).toBeNull();
  });

  it("removes document listeners when disconnected", () => {
    const element = renderLanguageSwitcher();
    const openChange = vi.fn();
    element.addEventListener("open-change", openChange);
    languageTrigger(element).click();
    expect(openChange).toHaveBeenCalledTimes(1);

    element.remove();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(openChange).toHaveBeenCalledTimes(1);
  });
});

describe("native Toast", () => {
  it("keeps an empty live region mounted while closed", () => {
    const element = renderToast({ open: false, message: "Hidden message" });
    const surface = toastSurface(element);

    expect(surface).toHaveAttribute("role", "status");
    expect(surface).toHaveAttribute("aria-live", "polite");
    expect(surface).toHaveAttribute("aria-atomic", "true");
    expect(surface).toHaveClass("hidden");
    expect(surface).not.toHaveTextContent("Hidden message");
  });

  it("maps tone, size, position, and inline placement semantics", () => {
    const element = renderToast({ tone: "warning" });
    element.size = "lg";
    element.position = "top-right";
    let surface = toastSurface(element);

    expect(surface).toHaveAttribute("role", "alert");
    expect(surface).toHaveAttribute("aria-live", "assertive");
    expect(surface).toHaveClass("warning", "lg", "top-right");
    expect(
      surface.querySelector("[aria-hidden='true'] dt-icon"),
    ).toHaveAttribute("name", "warning");

    element.inline = true;
    surface = toastSurface(element);
    expect(surface).toHaveClass("inline");
    expect(surface).not.toHaveClass("top-right");
  });

  it("dispatches close after the configured duration without changing open", () => {
    vi.useFakeTimers();
    const element = renderToast({ duration: 1200 });
    const listener = vi.fn();
    element.addEventListener("close", listener);

    vi.advanceTimersByTime(1199);
    expect(listener).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({
      detail: { message: "Saved successfully." },
      bubbles: true,
      composed: true,
    });
    expect(element.open).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("restarts timing when duration changes and cleans up on disconnect", () => {
    vi.useFakeTimers();
    const element = renderToast({ duration: 3000 });
    const listener = vi.fn();
    element.addEventListener("close", listener);

    vi.advanceTimersByTime(2000);
    element.duration = 4000;
    vi.advanceTimersByTime(3999);
    expect(listener).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(listener).toHaveBeenCalledTimes(1);

    element.open = false;
    element.open = true;
    element.remove();
    vi.advanceTimersByTime(4000);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("renders messages as text rather than markup", () => {
    const element = renderToast({ message: "<img src=x onerror=alert(1)>" });
    expect(toastSurface(element).querySelector("img")).toBeNull();
    expect(toastSurface(element)).toHaveTextContent("<img src=x");
  });
});

describe("native ToastStack", () => {
  const items: DtToastStackItem[] = [
    { id: "saved", message: "Saved", tone: "success", duration: 1000 },
    { id: "notice", message: "Notice", tone: "info", duration: 5000 },
  ];

  it("composes native Toast live regions and caps the visible tail", () => {
    const many = Array.from({ length: 7 }, (_, index) => ({
      id: String(index),
      message: `Toast ${index}`,
      tone: index === 6 ? ("error" as const) : ("neutral" as const),
      duration: 60_000,
    }));
    const element = renderToastStack(many, 3);
    const rendered = [
      ...(element.shadowRoot?.querySelectorAll<DtToastElement>(TOAST_TAG) ??
        []),
    ];

    expect(rendered.map((toast) => toast.dataset.toastId)).toEqual([
      "4",
      "5",
      "6",
    ]);
    expect(
      rendered[0]?.shadowRoot?.querySelector("[role='status']"),
    ).toHaveTextContent("Toast 4");
    expect(
      rendered[2]?.shadowRoot?.querySelector("[role='alert']"),
    ).toHaveAttribute("aria-live", "assertive");
    expect(rendered.every((toast) => toast.inline && toast.open)).toBe(true);
  });

  it("translates child close events into controlled dismiss payloads", () => {
    vi.useFakeTimers();
    const host = document.createElement("div");
    const element = renderToastStack(items);
    host.append(element);
    document.body.append(host);
    const dismiss = vi.fn();
    const childClose = vi.fn();
    host.addEventListener("dismiss", dismiss);
    host.addEventListener("close", childClose);

    vi.advanceTimersByTime(1000);

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(dismiss.mock.calls[0]?.[0]).toMatchObject({
      detail: { id: "saved", toast: items[0] },
      bubbles: true,
      composed: true,
    });
    expect(childClose).not.toHaveBeenCalled();
    expect(element.toasts).toEqual(items);
    expect(element.shadowRoot?.querySelectorAll(TOAST_TAG)).toHaveLength(2);
  });

  it("preserves keyed timers across controlled list updates", () => {
    vi.useFakeTimers();
    const element = renderToastStack([
      { id: "stable", message: "Original", duration: 3000 },
    ]);
    const dismiss = vi.fn();
    element.addEventListener("dismiss", dismiss);

    vi.advanceTimersByTime(1000);
    const originalChild = element.shadowRoot?.querySelector(TOAST_TAG);
    element.toasts = [{ id: "stable", message: "Updated", duration: 3000 }];

    expect(element.shadowRoot?.querySelector(TOAST_TAG)).toBe(originalChild);
    vi.advanceTimersByTime(1999);
    expect(dismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(dismiss.mock.calls[0]?.[0]).toMatchObject({
      detail: {
        id: "stable",
        toast: { id: "stable", message: "Updated", duration: 3000 },
      },
    });
  });

  it("starts timers only when waiting items enter the visible window", () => {
    vi.useFakeTimers();
    const element = renderToastStack(
      [
        { id: "waiting", message: "Waiting", duration: 1000 },
        { id: "visible-a", message: "Visible A", duration: 5000 },
        { id: "visible-b", message: "Visible B", duration: 5000 },
      ],
      2,
    );
    const dismiss = vi.fn();
    element.addEventListener("dismiss", dismiss);

    vi.advanceTimersByTime(1000);
    expect(dismiss).not.toHaveBeenCalled();

    element.toasts = [
      { id: "waiting", message: "Waiting", duration: 1000 },
      { id: "visible-b", message: "Visible B", duration: 5000 },
    ];
    vi.advanceTimersByTime(999);
    expect(dismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(dismiss.mock.calls[0]?.[0]).toMatchObject({
      detail: { id: "waiting" },
    });
  });

  it("reflects positions, clamps max, parses JSON, and cleans child timers", () => {
    vi.useFakeTimers();
    const element = document.createElement(
      TOAST_STACK_TAG,
    ) as DtToastStackElement;
    element.setAttribute("toasts", JSON.stringify(items));
    element.position = "top-right";
    element.max = 0;
    const dismiss = vi.fn();
    element.addEventListener("dismiss", dismiss);
    document.body.append(element);

    expect(element.position).toBe("top-right");
    expect(element.max).toBe(1);
    expect(element.shadowRoot?.querySelectorAll(TOAST_TAG)).toHaveLength(1);

    element.remove();
    vi.advanceTimersByTime(5000);
    expect(dismiss).not.toHaveBeenCalled();
  });
});

describe("native review regressions (#1225)", () => {
  it("keeps the toast live region mounted across message updates", () => {
    const toast = document.createElement(TOAST_TAG) as DtToastElement;
    toast.open = true;
    toast.message = "Saved";
    document.body.append(toast);

    const region = toast.shadowRoot?.querySelector("[aria-live]");
    const messageNode = toast.shadowRoot?.querySelector(".message");
    expect(region).not.toBeNull();
    expect(messageNode?.textContent).toBe("Saved");

    toast.message = "Deleted";
    // Same live-region node and same message node — only the text changed, so the
    // announcement fires as a mutation instead of a wholesale remount.
    expect(toast.shadowRoot?.querySelector("[aria-live]")).toBe(region);
    expect(toast.shadowRoot?.querySelector(".message")).toBe(messageNode);
    expect(messageNode?.textContent).toBe("Deleted");
  });
});
