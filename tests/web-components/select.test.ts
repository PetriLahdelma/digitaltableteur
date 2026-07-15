import { fireEvent } from "@testing-library/dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  defineNativeElements,
  type DtSelectElement,
  type DtSelectOptionElement,
} from "../../packages/web-components/src/native";

beforeAll(() => defineNativeElements());

describe("native Select", () => {
  it("materializes declarative options into a labelled native select", () => {
    const element = document.createElement("dt-select") as DtSelectElement;
    element.label = "Team";
    element.name = "team";
    const option = document.createElement(
      "dt-select-option",
    ) as DtSelectOptionElement;
    option.value = "design";
    option.label = "Design";
    element.append(option);
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("label")).toHaveAttribute(
      "for",
      "control",
    );
    expect(element.shadowRoot?.querySelector("select")).toHaveAttribute(
      "name",
      "team",
    );
    expect(element.shadowRoot?.querySelector("option")).toHaveTextContent(
      "Design",
    );
  });

  it("supports options properties, form values, validation, and ordered events", () => {
    const form = document.createElement("form");
    const element = document.createElement("dt-select") as DtSelectElement;
    element.label = "Role";
    element.name = "role";
    element.options = [
      { value: "", label: "Choose a role", disabled: true },
      { value: "designer", label: "Designer" },
      { value: "engineer", label: "Engineer" },
    ];
    element.required = true;
    const order: string[] = [];
    const onValue = vi.fn(() => order.push("value-change"));
    const onChange = vi.fn(() => order.push("change"));
    element.addEventListener("value-change", onValue);
    element.addEventListener("change", onChange);
    form.append(element);
    document.body.append(form);

    const select = element.shadowRoot?.querySelector(
      "select",
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "engineer" } });

    expect(element.value).toBe("engineer");
    expect((onValue.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: "engineer",
    });
    expect(order).toEqual(["value-change", "change"]);
  });

  it("preserves an uncontrolled value across message rerenders", () => {
    const element = document.createElement("dt-select") as DtSelectElement;
    element.label = "Role";
    element.options = [
      { value: "designer", label: "Designer" },
      { value: "engineer", label: "Engineer" },
    ];
    document.body.append(element);
    const select = element.shadowRoot?.querySelector(
      "select",
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "engineer" } });

    element.helperText = "Used on your profile.";

    expect(element.value).toBe("engineer");
    expect(element.shadowRoot?.querySelector("select")).toHaveValue("engineer");
    expect(element.shadowRoot?.querySelector("select")).toHaveAttribute(
      "aria-describedby",
      "helper",
    );
  });

  it("distinguishes an omitted value from an explicit empty value", () => {
    const uncontrolled = document.createElement("dt-select") as DtSelectElement;
    uncontrolled.options = [
      { value: "designer", label: "Designer" },
      { value: "engineer", label: "Engineer" },
    ];
    document.body.append(uncontrolled);

    const empty = document.createElement("dt-select") as DtSelectElement;
    empty.value = "";
    empty.options = [
      { value: "designer", label: "Designer" },
      { value: "engineer", label: "Engineer" },
    ];
    document.body.append(empty);

    expect(uncontrolled.value).toBe("designer");
    expect(empty.value).toBe("");
    expect(empty.shadowRoot?.querySelector("select")?.selectedIndex).toBe(-1);
  });

  it("resets a select without a declared default to its first option", () => {
    const element = document.createElement("dt-select") as DtSelectElement;
    element.options = [
      { value: "designer", label: "Designer" },
      { value: "engineer", label: "Engineer" },
    ];
    document.body.append(element);
    const select = element.shadowRoot?.querySelector(
      "select",
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "engineer" } });

    element.formResetCallback();

    expect(element.value).toBe("designer");
  });
});
