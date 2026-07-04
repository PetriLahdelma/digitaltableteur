import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
});
