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
});
