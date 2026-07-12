import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Radio from "./Radio";

describe("Radio", () => {
  it("renders", () => {
    render(<Radio name="n" value="v" label="Opt" />);
    expect(document.body).toBeTruthy();
  });

  // Backs the audit-controls effect exemption: defaultChecked only applies on
  // the uncontrolled path (no `checked`), invisible in the controlled Playground.
  it("preselects via defaultChecked on the uncontrolled path", () => {
    render(<Radio name="n" value="v" label="Opt" defaultChecked />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("calls onCheckedChange with the selected state", () => {
    const onCheckedChange = vi.fn();
    render(
      <Radio
        name="n"
        value="v"
        label="Opt"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    fireEvent.click(screen.getByRole("radio"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
