import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Select from "@dt/Select";

expect.extend(toHaveNoViolations);

describe("Select", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  async function choose(label: string) {
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: "Test Select" }));
    await user.click(screen.getByRole("option", { name: label }));
  }

  it("renders label", () => {
    render(<Select label="Test Select" options={options} />);
    expect(screen.getByRole("combobox", { name: "Test Select" })).toBeInTheDocument();
  });

  it("opens the DS option list, never a native select", async () => {
    const { container } = render(<Select label="Test Select" options={options} />);
    expect(container.querySelector("select")).toBeNull();
    await userEvent.setup().click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Option 1",
      "Option 2",
      "Option 3",
    ]);
  });

  it("calls onChange when option is selected", async () => {
    const onChange = vi.fn();
    render(<Select label="Test Select" options={options} onChange={onChange} />);
    await choose("Option 2");
    expect(onChange).toHaveBeenCalledWith("option2");
  });

  it("calls onValueChange with the selected value", async () => {
    const onValueChange = vi.fn();
    render(<Select label="Test Select" options={options} onValueChange={onValueChange} />);
    await choose("Option 3");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("option3");
  });

  it("calls onValueChange before the deprecated onChange when both are given", async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Select
        label="Test Select"
        options={options}
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );
    await choose("Option 2");
    expect(onValueChange).toHaveBeenCalledWith("option2");
    expect(onChange).toHaveBeenCalledWith("option2");
    expect(onValueChange.mock.invocationCallOrder[0]).toBeLessThan(
      onChange.mock.invocationCallOrder[0],
    );
  });

  it("ensures value takes precedence when value and defaultValue are both provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Select label="Test Select" options={options} value="option2" defaultValue="option1" />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Option 2");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("value` will take precedence"));
    warn.mockRestore();
  });

  it("tracks its own value when uncontrolled", async () => {
    render(<Select label="Test Select" options={options} defaultValue="option1" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Option 1");
    await choose("Option 3");
    expect(screen.getByRole("combobox")).toHaveTextContent("Option 3");
  });

  it("uses an empty-value option child as the placeholder", () => {
    render(
      <Select label="Test Select" value="">
        <option value="">Choose one</option>
        <option value="a">Alpha</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose one");
  });

  it("submits its value with a form through the name prop", async () => {
    const { container } = render(
      <form>
        <Select label="Test Select" name="choice" options={options} defaultValue="option1" />
      </form>,
    );
    await choose("Option 2");
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("choice")).toBe("option2");
  });

  it("associates error and helper text with the invalid control", () => {
    render(
      <Select
        label="Test Select"
        options={options}
        error="Choose a valid option"
        helperText="This choice affects the result"
      />,
    );
    const select = screen.getByRole("combobox");
    const error = screen.getByText("Choose a valid option");
    const helper = screen.getByText("This choice affects the result");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select.getAttribute("aria-describedby")?.split(" ")).toEqual([error.id, helper.id]);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Select label="Test Select" options={options} helperText="Pick one" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
