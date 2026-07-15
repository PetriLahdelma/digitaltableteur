import { fireEvent } from "@testing-library/dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defineNativeElements,
  type DtCheckboxElement,
  type DtSelectElement,
  type DtSwitchElement,
  type DtTextInputElement,
} from "../../packages/web-components/src/native";

type InternalsMock = {
  setFormValue: ReturnType<typeof vi.fn>;
  setValidity: ReturnType<typeof vi.fn>;
};

const internals = new WeakMap<HTMLElement, InternalsMock>();

function internalsFor(element: HTMLElement): InternalsMock {
  const instance = internals.get(element);
  if (!instance) throw new Error("Missing mocked internals");
  return instance;
}

beforeAll(() => {
  defineNativeElements();
  Object.defineProperty(HTMLElement.prototype, "attachInternals", {
    configurable: true,
    value() {
      const instance = {
        setFormValue: vi.fn(),
        setValidity: vi.fn(),
      };
      internals.set(this as HTMLElement, instance);
      return instance;
    },
  });
});

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("native form controls release regressions", () => {
  it("keeps checkbox default-checked initialization one-time and localizes required copy with overrides", () => {
    const element = document.createElement("dt-checkbox") as DtCheckboxElement;
    element.defaultChecked = true;
    element.required = true;
    element.setAttribute("lang", "fi");
    document.body.append(element);

    expect(element.checked).toBe(true);

    element.checked = false;
    document.body.removeChild(element);
    document.body.append(element);

    expect(element.checked).toBe(false);

    const checkboxInternals = internalsFor(element);
    expect(checkboxInternals.setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Valitse tämä ruutu.",
      expect.any(HTMLInputElement),
    );

    element.setAttribute("required-message", "Custom checkbox message");

    expect(checkboxInternals.setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Custom checkbox message",
      expect.any(HTMLInputElement),
    );
  });

  it("keeps switch state across reconnects and restores focus after rerenders", () => {
    const element = document.createElement("dt-switch") as DtSwitchElement;
    element.defaultChecked = true;
    element.label = "Email notifications";
    document.body.append(element);

    expect(element.checked).toBe(true);

    element.checked = false;
    document.body.removeChild(element);
    document.body.append(element);
    expect(element.checked).toBe(false);

    const button = element.shadowRoot?.querySelector(
      "button",
    ) as HTMLButtonElement;
    button.focus();
    button.click();

    const rerendered = element.shadowRoot?.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(element.checked).toBe(true);
    expect(element.shadowRoot?.activeElement).toBe(rerendered);
  });

  it("uses current text-input value for clear chrome and localizes clear copy with overrides", () => {
    const element = document.createElement(
      "dt-text-input",
    ) as DtTextInputElement;
    element.label = "Haku";
    element.clearable = true;
    element.setAttribute("lang", "fi");
    document.body.append(element);

    let input = element.shadowRoot?.querySelector("input") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "abc" } });

    input = element.shadowRoot?.querySelector("input") as HTMLInputElement;
    let clear = element.shadowRoot?.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(input.className).toContain("hasClear");
    expect(clear.hidden).toBe(false);
    expect(clear).toHaveAttribute("aria-label", "Tyhjennä Haku");

    element.setAttribute("clear-label-prefix", "Poista ");

    clear = element.shadowRoot?.querySelector("button") as HTMLButtonElement;
    expect(clear).toHaveAttribute("aria-label", "Poista Haku");
  });

  it("resyncs programmatic select values, preserves the focused control, and localizes required text", () => {
    const element = document.createElement("dt-select") as DtSelectElement;
    element.label = "Roll";
    element.required = true;
    element.setAttribute("lang", "sv");
    element.setAttribute("value", "designer");
    element.options = [
      { value: "designer", label: "Designer" },
      { value: "engineer", label: "Engineer" },
    ];
    document.body.append(element);

    const firstControl = element.shadowRoot?.querySelector(
      "select",
    ) as HTMLSelectElement;
    fireEvent.change(firstControl, { target: { value: "engineer" } });
    element.value = "designer";

    const resyncedControl = element.shadowRoot?.querySelector(
      "select",
    ) as HTMLSelectElement;
    expect(resyncedControl).toBe(firstControl);
    expect(element.value).toBe("designer");
    expect(resyncedControl).toHaveValue("designer");

    firstControl.focus();
    element.helperText = "Anvands i profilen.";

    expect(element.shadowRoot?.activeElement).toBe(firstControl);
    expect(
      element.shadowRoot?.querySelector("label .srOnly")?.textContent,
    ).toBe(" (obligatorisk)");

    element.setAttribute("required-text", " (kravs)");

    expect(
      element.shadowRoot?.querySelector("label .srOnly")?.textContent,
    ).toBe(" (kravs)");
  });

  it("submits only enabled select options and treats disabled selections as missing", () => {
    const element = document.createElement("dt-select") as DtSelectElement;
    element.label = "Role";
    element.required = true;
    element.options = [
      {
        value: "placeholder",
        label: "Choose a role",
        disabled: true,
        selected: true,
      },
      { value: "designer", label: "Designer" },
    ];
    document.body.append(element);

    const selectInternals = internalsFor(element);
    expect(selectInternals.setFormValue).toHaveBeenLastCalledWith(null);
    expect(selectInternals.setValidity).toHaveBeenLastCalledWith(
      { valueMissing: true },
      "Constraints not satisfied",
      expect.any(HTMLSelectElement),
    );
  });
});
