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

  it("pairs scale anchors with the first and last option in one description", () => {
    const scale = ["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }));
    render(
      <RadioGroup
        legend="Tone of voice"
        options={scale}
        orientation="horizontal"
        startLabel="Serious"
        endLabel="Playful"
      />,
    );

    const group = screen.getByRole("group", { name: "Tone of voice" });
    const describedBy = group.getAttribute("aria-describedby")!.split(" ");
    const description = document.getElementById(describedBy[0]);
    expect(description).toHaveTextContent("1: Serious; 5: Playful");
    // The visible anchors are not read a second time.
    expect(screen.getByText("Serious")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Playful")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("keeps a hidden legend as the accessible name", () => {
    render(<RadioGroup legend="Tone of voice" options={OPTIONS} hideLegend />);
    expect(screen.getByRole("group", { name: "Tone of voice" })).toBeInTheDocument();
    expect(screen.getByText("Tone of voice").className).toMatch(/hiddenLegend/);
  });

  it("renders the plain option list when no anchors are set", () => {
    const { container } = render(<RadioGroup legend="Pick" options={OPTIONS} startLabel="" endLabel="" />);
    const fieldset = container.querySelector("fieldset")!;
    expect(fieldset).not.toHaveAttribute("aria-describedby");
    expect(fieldset.querySelector('[class*="scale"]')).toBeNull();
  });
});
