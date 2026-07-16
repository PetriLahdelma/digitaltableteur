import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  DtPhoneInputElement,
  type DtPhoneInputCountry,
} from "../../packages/web-components/src/native/phone-input";
import {
  DtComboboxElement,
  type DtComboboxOption,
} from "../../packages/web-components/src/native/combobox";

type InternalsMock = {
  setFormValue: ReturnType<typeof vi.fn>;
  setValidity: ReturnType<typeof vi.fn>;
};

const internals = new WeakMap<HTMLElement, InternalsMock>();

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "attachInternals", {
    configurable: true,
    value() {
      const instance = { setFormValue: vi.fn(), setValidity: vi.fn() };
      internals.set(this as HTMLElement, instance);
      return instance;
    },
  });
  if (!customElements.get("dt-phone-input")) {
    customElements.define("dt-phone-input", DtPhoneInputElement);
  }
  if (!customElements.get("dt-combobox")) {
    customElements.define("dt-combobox", DtComboboxElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

const options: DtComboboxOption[] = [
  { value: "asap", label: "ASAP" },
  { value: "later", label: "Later", disabled: true },
  { value: "flexible", label: "Flexible" },
];

describe("native PhoneInput", () => {
  it("renders an associated international field with FI defaults", () => {
    const element = document.createElement(
      "dt-phone-input",
    ) as DtPhoneInputElement;
    element.label = "Phone number";
    element.name = "phone";
    document.body.append(element);

    const input = element.shadowRoot?.querySelector("input");
    const country = element.shadowRoot?.querySelector("select");
    expect(element.shadowRoot?.querySelector("label")).toHaveAttribute(
      "for",
      "control",
    );
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("name", "phone");
    expect(input).toHaveValue("+358");
    expect(country).toHaveValue("FI");
    expect(country).toHaveAccessibleName("Country calling code");
  });

  it("emits E.164 values for local input and undefined when cleared", () => {
    const element = document.createElement(
      "dt-phone-input",
    ) as DtPhoneInputElement;
    const onValue = vi.fn();
    element.addEventListener("value-change", onValue);
    document.body.append(element);
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;

    fireEvent.input(input, { target: { value: "401234567" } });
    expect(element.value).toBe("+358401234567");
    expect((onValue.mock.calls.at(-1)?.[0] as CustomEvent).detail).toEqual({
      value: "+358401234567",
    });

    fireEvent.input(input, { target: { value: "" } });
    expect(element.value).toBeUndefined();
    expect((onValue.mock.calls.at(-1)?.[0] as CustomEvent).detail).toEqual({
      value: undefined,
    });
  });

  it("uses the selected country for local numbers and reports country changes", () => {
    const element = document.createElement(
      "dt-phone-input",
    ) as DtPhoneInputElement;
    element.defaultCountry = "SE" as DtPhoneInputCountry;
    const onCountry = vi.fn();
    element.addEventListener("country-change", onCountry);
    document.body.append(element);
    const country = element.shadowRoot?.querySelector(
      "select",
    ) as HTMLSelectElement;
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;

    country.value = "GB";
    fireEvent.change(country);
    expect((onCountry.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      country: "GB",
    });

    fireEvent.input(input, { target: { value: "2071234567" } });
    expect(element.value).toBe("+442071234567");
  });

  it("supports programmatic values, defaults, form reset, and form payloads", () => {
    const element = document.createElement(
      "dt-phone-input",
    ) as DtPhoneInputElement;
    element.name = "phone";
    element.defaultValue = "+46701234567";
    document.body.append(element);
    element.value = "";
    expect(element).toHaveAttribute("value", "");
    expect(element.value).toBeUndefined();
    element.formResetCallback();
    expect(element.value).toBe("+46701234567");

    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    fireEvent.input(input, { target: { value: "+358401234567" } });

    expect(element.value).toBe("+358401234567");
    expect(internals.get(element)?.setFormValue).toHaveBeenLastCalledWith(
      "+358401234567",
      "+358401234567",
    );

    element.formResetCallback();
    expect(element.value).toBe("+46701234567");
    expect(element.country).toBe("SE");

    element.value = "+12025551234";
    expect(element.shadowRoot?.querySelector("input")).toHaveValue(
      "+1 202 555 1234",
    );
    expect(element.country).toBe("US");
  });

  it("wires error, helper, required, disabled, and localized country copy", () => {
    const element = document.createElement(
      "dt-phone-input",
    ) as DtPhoneInputElement;
    element.label = "Puhelin";
    element.error = "Virheellinen numero";
    element.helperText = "Sisällytä maakoodi";
    element.required = true;
    element.disabled = true;
    element.setAttribute("lang", "fi");
    document.body.append(element);

    const input = element.shadowRoot?.querySelector("input");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "error helper");
    expect(element.shadowRoot?.querySelector("select")).toHaveAccessibleName(
      "Maan suuntanumero",
    );
    expect(element.shadowRoot?.querySelector("#error")).toHaveAttribute(
      "role",
      "alert",
    );
  });
});

describe("native Combobox", () => {
  it("renders selected and placeholder states with complete ARIA wiring", () => {
    const element = document.createElement("dt-combobox") as DtComboboxElement;
    element.id = "timeline";
    element.label = "Timeline";
    element.placeholder = "Select...";
    element.helperText = "Choose a timeline";
    element.options = options;
    document.body.append(element);

    const input = element.shadowRoot?.querySelector("input");
    expect(input).toHaveRole("combobox");
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("placeholder", "Select...");
    expect(input).toHaveAttribute("aria-controls", "timeline-listbox");
    expect(input).toHaveAttribute("aria-describedby", "helper");

    element.value = "flexible";
    expect(element.shadowRoot?.querySelector("input")).toHaveValue("Flexible");
  });

  it("filters without committing and emits the visible result set", () => {
    const element = document.createElement("dt-combobox") as DtComboboxElement;
    element.label = "Timeline";
    element.options = options;
    const onFilter = vi.fn();
    const onValue = vi.fn();
    element.addEventListener("filter-change", onFilter);
    element.addEventListener("value-change", onValue);
    document.body.append(element);
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;

    fireEvent.input(input, { target: { value: "flex" } });

    expect(element.value).toBe("");
    expect(onValue).not.toHaveBeenCalled();
    expect(
      element.shadowRoot?.querySelectorAll('[role="option"]'),
    ).toHaveLength(1);
    expect(
      element.shadowRoot?.querySelector('[role="option"]'),
    ).toHaveTextContent("Flexible");
    expect((onFilter.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      query: "flex",
      options: [{ value: "flexible", label: "Flexible" }],
    });

    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    expect(input).toHaveValue("");
    expect(element.open).toBe(false);
  });

  it("opens with arrows, skips disabled options, and commits in event order", () => {
    const element = document.createElement("dt-combobox") as DtComboboxElement;
    element.label = "Timeline";
    element.name = "timeline";
    element.options = options;
    const order: string[] = [];
    const onValue = vi.fn(() => order.push("value-change"));
    const onChange = vi.fn(() => order.push("change"));
    element.addEventListener("value-change", onValue);
    element.addEventListener("change", onChange);
    document.body.append(element);
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toContain("option-2");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(element.value).toBe("flexible");
    expect(input).toHaveValue("Flexible");
    expect(order).toEqual(["value-change", "change"]);
    expect((onValue.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: "flexible",
      option: { value: "flexible", label: "Flexible" },
    });
    expect(internals.get(element)?.setFormValue).toHaveBeenLastCalledWith(
      "flexible",
      "flexible",
    );
  });

  it("closes on Escape and Tab without cancelling normal focus movement", () => {
    const element = document.createElement("dt-combobox") as DtComboboxElement;
    element.options = options;
    document.body.append(element);
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(element.open).toBe(true);

    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(element.open).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(element.open).toBe(false);
  });

  it("supports defaults, reset, disabled selection guards, and required errors", () => {
    const element = document.createElement("dt-combobox") as DtComboboxElement;
    element.label = "Timeline";
    element.defaultValue = "asap";
    element.options = options;
    element.required = true;
    element.error = "Pick a timeline";
    element.helperText = "When should work start?";
    document.body.append(element);

    expect(element.value).toBe("asap");
    let input = element.shadowRoot?.querySelector("input") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "error helper");

    element.value = "later";
    input = element.shadowRoot?.querySelector("input") as HTMLInputElement;
    expect(internals.get(element)?.setFormValue).toHaveBeenLastCalledWith(
      null,
      null,
    );

    element.formResetCallback();
    expect(element.value).toBe("asap");
    expect(element.shadowRoot?.querySelector("input")).toHaveValue("ASAP");

    element.disabled = true;
    expect(element.shadowRoot?.querySelector("input")).toBeDisabled();
    expect(element.shadowRoot?.querySelector("button.toggle")).toBeDisabled();
  });

  it("accepts declarative options and dismisses on outside pointer input", () => {
    const element = document.createElement("dt-combobox") as DtComboboxElement;
    element.label = "Team";
    const option = document.createElement("option");
    option.value = "design";
    option.textContent = "Design";
    element.append(option);
    document.body.append(element);
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;

    fireEvent.click(input);
    expect(element.open).toBe(true);
    expect(
      element.shadowRoot?.querySelector('[role="option"]'),
    ).toHaveTextContent("Design");

    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    expect(element.open).toBe(false);
  });
});
