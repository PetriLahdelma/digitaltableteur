import { fireEvent } from "@testing-library/dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  defineNativeElements,
  type DtCheckboxElement,
  type DtCheckboxGroupElement,
  type DtRadioElement,
  type DtRadioGroupElement,
} from "../../packages/web-components/src/native";

beforeAll(() => defineNativeElements());

describe("native choice controls", () => {
  it("keeps standalone radios with the same name exclusive across shadow roots", () => {
    const form = document.createElement("form");
    const first = document.createElement("dt-radio") as DtRadioElement;
    first.name = "discipline";
    first.value = "design";
    first.label = "Design";
    const second = document.createElement("dt-radio") as DtRadioElement;
    second.name = "discipline";
    second.value = "engineering";
    second.label = "Engineering";
    const onChecked = vi.fn();
    second.addEventListener("checked-change", onChecked);
    form.append(first, second);
    document.body.append(form);

    (first.shadowRoot?.querySelector("input") as HTMLInputElement).click();
    (second.shadowRoot?.querySelector("input") as HTMLInputElement).click();

    expect(first.checked).toBe(false);
    expect(second.checked).toBe(true);
    expect((onChecked.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      checked: true,
    });
  });

  it("keeps same-name radios in different forms independent", () => {
    const firstForm = document.createElement("form");
    const secondForm = document.createElement("form");
    const first = document.createElement("dt-radio") as DtRadioElement;
    const second = document.createElement("dt-radio") as DtRadioElement;
    first.name = second.name = "plan";
    first.label = "First form";
    second.label = "Second form";
    firstForm.append(first);
    secondForm.append(second);
    document.body.append(firstForm, secondForm);

    (first.shadowRoot?.querySelector("input") as HTMLInputElement).click();
    (second.shadowRoot?.querySelector("input") as HTMLInputElement).click();

    expect(first.checked).toBe(true);
    expect(second.checked).toBe(true);
  });

  it("submits and updates a radio group without replacing the focused control", () => {
    const form = document.createElement("form");
    const group = document.createElement(
      "dt-radio-group",
    ) as DtRadioGroupElement;
    group.name = "discipline";
    group.legend = "Discipline";
    group.defaultValue = "design";
    group.options = [
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering" },
    ];
    const onValue = vi.fn();
    group.addEventListener("value-change", onValue);
    form.append(group);
    document.body.append(form);

    const radios = group.shadowRoot?.querySelectorAll<DtRadioElement>(
      ".options > dt-radio",
    );
    const engineering = radios?.[1];
    const input = engineering?.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    input.focus();
    fireEvent.click(input);

    expect(group.value).toBe("engineering");
    expect(onValue).toHaveBeenCalledTimes(1);
    expect((onValue.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: "engineering",
    });
    expect(engineering?.shadowRoot?.activeElement).toBe(input);
    expect(
      group.shadowRoot?.querySelectorAll(".options > dt-radio"),
    ).toHaveLength(2);
  });

  it("allows a controlled radio group to clear an uncontrolled default", () => {
    const group = document.createElement(
      "dt-radio-group",
    ) as DtRadioGroupElement;
    group.defaultValue = "design";
    group.value = "";
    group.options = [
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering" },
    ];
    document.body.append(group);

    const controls = group.shadowRoot?.querySelectorAll<DtRadioElement>(
      ".options > dt-radio",
    );
    expect(group.value).toBe("");
    expect([...controls!].every((control) => !control.checked)).toBe(true);
  });

  it("submits repeated checkbox values and emits only after user changes", () => {
    const form = document.createElement("form");
    const group = document.createElement(
      "dt-checkbox-group",
    ) as DtCheckboxGroupElement;
    group.name = "services";
    group.label = "Services";
    group.options = [
      { value: "strategy", label: "Strategy" },
      { value: "design", label: "Design" },
      { value: "development", label: "Development" },
    ];
    group.defaultSelected = ["strategy"];
    const onSelected = vi.fn();
    group.addEventListener("selected-change", onSelected);
    form.append(group);
    document.body.append(form);

    expect(onSelected).not.toHaveBeenCalled();
    const master = group.shadowRoot?.querySelector(
      "dt-checkbox[data-master]",
    ) as DtCheckboxElement;
    expect(master.indeterminate).toBe(true);

    const options = group.shadowRoot?.querySelectorAll<DtCheckboxElement>(
      ".options > dt-checkbox",
    );
    const designInput = options?.[1]?.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    designInput.focus();
    fireEvent.click(designInput);

    expect(group.selected).toEqual(["strategy", "design"]);
    expect(options?.[1]?.shadowRoot?.activeElement).toBe(designInput);
    expect((onSelected.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      selected: ["strategy", "design"],
    });
  });

  it("resets choice groups to their declared defaults", () => {
    const form = document.createElement("form");
    const radios = document.createElement(
      "dt-radio-group",
    ) as DtRadioGroupElement;
    radios.name = "discipline";
    radios.legend = "Discipline";
    radios.defaultValue = "design";
    radios.options = [
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering" },
    ];
    const checks = document.createElement(
      "dt-checkbox-group",
    ) as DtCheckboxGroupElement;
    checks.name = "services";
    checks.label = "Services";
    checks.options = [
      { value: "strategy", label: "Strategy" },
      { value: "design", label: "Design" },
    ];
    checks.defaultSelected = ["strategy"];
    form.append(radios, checks);
    document.body.append(form);

    const secondRadio = radios.shadowRoot?.querySelectorAll<DtRadioElement>(
      ".options > dt-radio",
    )[1];
    (
      secondRadio?.shadowRoot?.querySelector("input") as HTMLInputElement
    ).click();
    const secondCheck = checks.shadowRoot?.querySelectorAll<DtCheckboxElement>(
      ".options > dt-checkbox",
    )[1];
    (
      secondCheck?.shadowRoot?.querySelector("input") as HTMLInputElement
    ).click();
    radios.formResetCallback();
    checks.formResetCallback();

    expect(radios.value).toBe("design");
    expect(checks.selected).toEqual(["strategy"]);
  });

  it("restores intrinsic checkbox disabled states after form re-enablement", () => {
    const group = document.createElement(
      "dt-checkbox-group",
    ) as DtCheckboxGroupElement;
    group.options = [
      { value: "available", label: "Available" },
      { value: "locked", label: "Locked", disabled: true },
    ];
    document.body.append(group);

    group.formDisabledCallback(true);
    group.formDisabledCallback(false);

    const controls = group.shadowRoot?.querySelectorAll<DtCheckboxElement>(
      ".options > dt-checkbox",
    );
    expect(controls?.[0]?.disabled).toBe(false);
    expect(controls?.[1]?.disabled).toBe(true);
  });
});
