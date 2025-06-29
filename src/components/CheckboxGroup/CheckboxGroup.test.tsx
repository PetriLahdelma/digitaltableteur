import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CheckboxGroup from "./CheckboxGroup";

describe("CheckboxGroup", () => {
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  it("renders group label", () => {
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Group Label")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={() => {}}
      />,
    );
    options.forEach((opt) => {
      expect(screen.getByLabelText(opt.label)).toBeInTheDocument();
    });
  });

  it("calls onChange when an option is clicked", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Option 2"));
    expect(onChange).toHaveBeenCalled();
  });
});
