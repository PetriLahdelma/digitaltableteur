import { fireEvent } from "@testing-library/dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  defineNativeElements,
  type DtCheckboxElement,
  type DtSwitchElement,
  type DtTextAreaElement,
  type DtTextInputElement,
} from "../../packages/web-components/src/native";

beforeAll(() => defineNativeElements());

describe("native form elements", () => {
  it("reflects public properties to the attributes consumed by each control", () => {
    const input = document.createElement("dt-text-input") as DtTextInputElement;
    input.helperText = "Input help";
    input.hideLabel = true;
    input.name = "email";
    expect(input).toHaveAttribute("helper-text", "Input help");
    expect(input).toHaveAttribute("hide-label");
    expect(input).toHaveAttribute("name", "email");

    const textarea = document.createElement(
      "dt-text-area",
    ) as DtTextAreaElement;
    textarea.minRows = 4;
    textarea.maxRows = 10;
    textarea.required = true;
    expect(textarea).toHaveAttribute("min-rows", "4");
    expect(textarea).toHaveAttribute("max-rows", "10");
    expect(textarea).toHaveAttribute("required");

    const checkbox = document.createElement("dt-checkbox") as DtCheckboxElement;
    checkbox.showLabel = false;
    checkbox.defaultChecked = true;
    checkbox.value = "accepted";
    expect(checkbox).toHaveAttribute("show-label", "false");
    expect(checkbox).toHaveAttribute("default-checked");
    expect(checkbox).toHaveAttribute("value", "accepted");

    const toggle = document.createElement("dt-switch") as DtSwitchElement;
    toggle.labelPlacement = "top";
    toggle.helperText = "Switch help";
    expect(toggle).toHaveAttribute("label-placement", "top");
    expect(toggle).toHaveAttribute("helper-text", "Switch help");
  });

  it("links TextInput labels and messages and emits composed value changes", () => {
    const element = document.createElement(
      "dt-text-input",
    ) as DtTextInputElement;
    element.label = "Email address";
    element.setAttribute("helper-text", "Used for receipts.");
    element.setAttribute("error", "Enter a valid address.");
    const onValue = vi.fn();
    element.addEventListener("value-change", onValue);
    document.body.append(element);

    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    expect(element.shadowRoot?.querySelector("label")).toHaveAttribute(
      "for",
      "control",
    );
    expect(input).toHaveAttribute("aria-describedby", "error helper");
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.input(input, { target: { value: "hello@example.com" } });
    expect(onValue).toHaveBeenCalledTimes(1);
    expect((onValue.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: "hello@example.com",
    });
    expect((onValue.mock.calls[0]?.[0] as CustomEvent).composed).toBe(true);

    element.helperText = "Updated help text.";
    expect(element.shadowRoot?.querySelector("input")).toHaveValue(
      "hello@example.com",
    );
    expect(element.value).toBe("hello@example.com");
  });

  it("clears TextInput values and restores input focus", () => {
    const element = document.createElement(
      "dt-text-input",
    ) as DtTextInputElement;
    element.label = "Search";
    element.value = "design systems";
    element.clearable = true;
    const onClear = vi.fn();
    element.addEventListener("clear", onClear);
    document.body.append(element);

    const clear = element.shadowRoot?.querySelector(
      "button",
    ) as HTMLButtonElement;
    clear.click();

    expect(element.value).toBe("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot?.activeElement).toBe(
      element.shadowRoot?.querySelector("input"),
    );
  });

  it("emits TextArea value changes with error and helper linkage", () => {
    const element = document.createElement("dt-text-area") as DtTextAreaElement;
    element.label = "Message";
    element.setAttribute("error", "Message is required.");
    element.setAttribute("helper-text", "Markdown is supported.");
    const onValue = vi.fn();
    element.addEventListener("value-change", onValue);
    document.body.append(element);

    const textarea = element.shadowRoot?.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: "Hello" } });

    expect(textarea).toHaveAttribute("aria-describedby", "error helper");
    expect((onValue.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      value: "Hello",
    });

    element.helperText = "Updated guidance.";
    expect(element.shadowRoot?.querySelector("textarea")).toHaveValue("Hello");
    expect(element.value).toBe("Hello");
  });

  it("resolves an indeterminate Checkbox and emits checked state", () => {
    const element = document.createElement("dt-checkbox") as DtCheckboxElement;
    element.setAttribute("label", "Select all");
    element.indeterminate = true;
    const onChecked = vi.fn();
    element.addEventListener("checked-change", onChecked);
    document.body.append(element);

    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    fireEvent.click(input);

    expect(element.indeterminate).toBe(false);
    expect(element.checked).toBe(true);
    expect((onChecked.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      checked: true,
    });
  });

  it("toggles Switch state and blocks activation while loading", () => {
    const element = document.createElement("dt-switch") as DtSwitchElement;
    element.setAttribute("label", "Email notifications");
    const onChecked = vi.fn();
    element.addEventListener("checked-change", onChecked);
    document.body.append(element);

    let button = element.shadowRoot?.querySelector(
      "button",
    ) as HTMLButtonElement;
    button.click();
    expect(element.checked).toBe(true);
    expect((onChecked.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      checked: true,
    });

    element.loading = true;
    button = element.shadowRoot?.querySelector("button") as HTMLButtonElement;
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    button.click();
    expect(onChecked).toHaveBeenCalledTimes(1);
  });
});
