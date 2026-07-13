import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Select from "@dt/Select";

describe("Select", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("renders label", () => {
    render(<Select label="Test Select" options={options} />);
    expect(screen.getByText("Test Select")).toBeInTheDocument();
  });

  it("renders options", () => {
    render(<Select label="Test Select" options={options} />);
    options.forEach((opt) => {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    });
  });

  it("calls onChange when option is selected", () => {
    const onChange = vi.fn();
    render(
      <Select label="Test Select" options={options} onChange={onChange} />,
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "option2" } });
    expect(onChange).toHaveBeenCalledWith("option2");
  });

  it("calls onValueChange with the selected value", () => {
    const onValueChange = vi.fn();
    render(
      <Select
        label="Test Select"
        options={options}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "option3" },
    });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("option3");
  });

  it("calls onValueChange before the deprecated onChange when both are given", () => {
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
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "option2" },
    });
    expect(onValueChange).toHaveBeenCalledWith("option2");
    expect(onChange).toHaveBeenCalledWith("option2");
    expect(onValueChange.mock.invocationCallOrder[0]).toBeLessThan(
      onChange.mock.invocationCallOrder[0],
    );
  });

  it("ensures value takes precedence when value and defaultValue are both provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Select
        label="Test Select"
        options={options}
        value="option2"
        defaultValue="option1"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("option2");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("value` will take precedence"),
    );
    warn.mockRestore();
  });

  it("associates error and helper text with the invalid control", () => {
    render(
      <Select
        label="Test Select"
        options={options}
        error="Choose a valid option"
        helperText="This choice affects the result"
        aria-describedby="external-description"
      />,
    );

    const select = screen.getByRole("combobox");
    const error = screen.getByText("Choose a valid option");
    const helper = screen.getByText("This choice affects the result");
    const describedBy = select.getAttribute("aria-describedby")?.split(" ");

    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(describedBy).toEqual(
      expect.arrayContaining([error.id, helper.id, "external-description"]),
    );
  });
});
