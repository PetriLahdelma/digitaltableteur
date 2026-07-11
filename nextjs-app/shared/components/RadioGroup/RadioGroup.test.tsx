import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RadioGroup from "./RadioGroup";

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

describe("RadioGroup", () => {
  it("renders", () => {
    render(<RadioGroup legend="Pick" options={OPTIONS} />);
    expect(document.body).toBeTruthy();
  });

  it("calls onValueChange with the selected value", () => {
    const onValueChange = vi.fn();

    render(
      <RadioGroup
        legend="Pick"
        options={OPTIONS}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("B"));

    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("wires helper and error text through fieldset aria-describedby", () => {
    render(
      <RadioGroup
        legend="Pick"
        options={OPTIONS}
        helperText="Choose one option"
        error="Selection required"
      />,
    );

    const group = screen.getByRole("group", { name: "Pick" });
    const helper = screen.getByText("Choose one option");
    const error = screen.getByText("Selection required");

    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", expect.stringContaining(helper.id));
    expect(group).toHaveAttribute("aria-describedby", expect.stringContaining(error.id));
  });
});
