import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  defineNativeElements,
  type DtCheckboxElement,
  type DtCheckboxGroupElement,
  type DtFormFieldElement,
  type DtLabelElement,
  type DtRadioElement,
  type DtRadioGroupElement,
} from "../../packages/web-components/src/native";

type MockElementInternals = ElementInternals & {
  formValue: FormData | string | File | null;
  validity: Partial<ValidityState>;
  validationMessage: string;
};

function elementInternals(element: object): MockElementInternals | null {
  return (
    (element as { internals?: MockElementInternals | null }).internals ?? null
  );
}

function formDataEntries(element: object): [string, FormDataEntryValue][] {
  const value = elementInternals(element)?.formValue;
  return value instanceof FormData ? [...value.entries()] : [];
}

beforeAll(() => {
  HTMLElement.prototype.attachInternals = function attachInternals() {
    const element = this;
    return {
      get form() {
        return element.closest("form");
      },
      formValue: null,
      validity: { valid: true },
      validationMessage: "",
      setFormValue(value: FormData | string | File | null) {
        this.formValue = value;
      },
      setValidity(flags: ValidityStateFlags, message: string) {
        const hasErrors = Object.values(flags).some(Boolean);
        this.validity = {
          valid: !hasErrors,
          valueMissing: Boolean(flags.valueMissing),
          customError: Boolean(flags.customError),
        };
        this.validationMessage = message;
      },
    } as unknown as ElementInternals;
  };

  defineNativeElements();
});

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.lang = "en";
});

describe("native form group release regressions", () => {
  it("preserves checkbox selection across reconnects and option reassignment while excluding disabled values from submission", () => {
    const form = document.createElement("form");
    const group = document.createElement(
      "dt-checkbox-group",
    ) as DtCheckboxGroupElement;
    group.name = "services";
    group.label = "Services";
    group.defaultSelected = ["locked"];
    group.options = [
      { value: "design", label: "Design" },
      { value: "locked", label: "Locked", disabled: true },
    ];
    form.append(group);
    document.body.append(form);

    const controls = group.shadowRoot?.querySelectorAll<DtCheckboxElement>(
      ".options > dt-checkbox",
    );
    const designInput = controls?.[0]?.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    fireEvent.click(designInput);

    expect(group.selected).toEqual(["design"]);

    form.removeChild(group);
    form.append(group);
    group.options = [
      { value: "design", label: "Design services" },
      { value: "locked", label: "Locked", disabled: true },
    ];

    expect(group.selected).toEqual(["design"]);
    expect(formDataEntries(group)).toEqual([["services", "design"]]);
  });

  it("keeps intrinsic radio disabled changes when a form field toggles inherited disabled state", () => {
    const field = document.createElement("dt-form-field") as DtFormFieldElement;
    field.legend = "Contact preference";
    const primary = document.createElement("dt-radio") as DtRadioElement;
    primary.name = "contact";
    primary.label = "Email";
    primary.value = "email";
    const secondary = document.createElement("dt-radio") as DtRadioElement;
    secondary.name = "contact";
    secondary.label = "Phone";
    secondary.value = "phone";
    secondary.disabled = true;
    field.append(primary, secondary);
    document.body.append(field);

    field.disabled = true;
    primary.disabled = true;
    secondary.disabled = false;
    field.disabled = false;

    expect(primary.disabled).toBe(true);
    expect(
      primary.shadowRoot?.querySelector("input") as HTMLInputElement,
    ).toBeDisabled();
    expect(secondary.disabled).toBe(false);
    expect(
      secondary.shadowRoot?.querySelector("input") as HTMLInputElement,
    ).not.toBeDisabled();
  });

  it("localizes required label text, prefers host overrides, and removes stale aria-labelledby references", () => {
    document.documentElement.lang = "fi";
    const first = document.createElement("input");
    first.id = "first-name";
    const second = document.createElement("input");
    second.id = "last-name";
    document.body.append(first, second);

    const label = document.createElement("dt-label") as DtLabelElement;
    label.htmlFor = "first-name";
    label.required = true;
    label.textContent = "Etunimi";
    document.body.append(label);

    expect(label.shadowRoot?.querySelector(".srOnly")?.textContent).toBe(
      "(pakollinen)",
    );
    expect(first).toHaveAttribute("aria-labelledby", label.id);

    label.requiredText = "(vaaditaan)";
    expect(label.shadowRoot?.querySelector(".srOnly")?.textContent).toBe(
      "(vaaditaan)",
    );

    label.htmlFor = "last-name";
    expect(first.getAttribute("aria-labelledby") ?? "").not.toContain(label.id);
    expect(second).toHaveAttribute("aria-labelledby", label.id);

    label.remove();
    expect(second).not.toHaveAttribute("aria-labelledby");
  });

  it("submits only enabled radio-group selections and localizes the required fallback with override precedence", () => {
    document.documentElement.lang = "sv";
    const form = document.createElement("form");
    const group = document.createElement(
      "dt-radio-group",
    ) as DtRadioGroupElement;
    group.name = "discipline";
    group.legend = "Discipline";
    group.required = true;
    group.options = [
      { value: "design", label: "Design", disabled: true },
      { value: "engineering", label: "Engineering" },
    ];
    group.value = "design";
    form.append(group);
    document.body.append(form);

    expect(elementInternals(group)?.validity.valueMissing).toBe(true);
    expect(elementInternals(group)?.validationMessage).toBe(
      "Välj ett alternativ.",
    );
    expect(elementInternals(group)?.formValue).toBeNull();

    group.requiredMessage = "Select one first";
    group.value = "";

    expect(elementInternals(group)?.validity.valueMissing).toBe(true);
    expect(elementInternals(group)?.validationMessage).toBe("Select one first");

    group.value = "engineering";

    expect(elementInternals(group)?.validity.valid).toBe(true);
    expect(elementInternals(group)?.validationMessage).toBe("");
    expect(elementInternals(group)?.formValue).toBe("engineering");
  });

  it("keeps same-name radios exclusive for programmatic changes and validates the group as a set", () => {
    document.documentElement.lang = "fi";
    const first = document.createElement("dt-radio") as DtRadioElement;
    first.name = "plan";
    first.value = "starter";
    first.label = "Starter";
    first.required = true;
    const second = document.createElement("dt-radio") as DtRadioElement;
    second.name = "plan";
    second.value = "pro";
    second.label = "Pro";
    second.required = true;
    document.body.append(first, second);

    first.checked = true;
    expect(first.checked).toBe(true);
    expect(second.checked).toBe(false);
    expect(elementInternals(first)?.validity.valid).toBe(true);
    expect(elementInternals(second)?.validity.valid).toBe(true);

    second.checked = true;
    expect(first.checked).toBe(false);
    expect(second.checked).toBe(true);
    expect(elementInternals(first)?.validity.valid).toBe(true);
    expect(elementInternals(second)?.validity.valid).toBe(true);

    second.checked = false;
    expect(first.checked).toBe(false);
    expect(second.checked).toBe(false);
    expect(elementInternals(first)?.validity.valueMissing).toBe(true);
    expect(elementInternals(second)?.validity.valueMissing).toBe(true);
    expect(elementInternals(first)?.validationMessage).toBe(
      "Valitse vaihtoehto.",
    );

    first.requiredMessage = "Pakollinen valinta";
    expect(elementInternals(first)?.validity.valueMissing).toBe(true);
    expect(elementInternals(first)?.validationMessage).toBe(
      "Pakollinen valinta",
    );
  });
});
