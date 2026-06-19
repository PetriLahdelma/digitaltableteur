import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { FormField } from "./FormField";

expect.extend(toHaveNoViolations);

describe("FormField", () => {
  it("associates the label with the control via a shared id", () => {
    render(
      <FormField label="Email">
        <input type="email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("preserves a control's own id and points the label at it", () => {
    render(
      <FormField label="Email" id="field-wrapper">
        <input id="custom-email" type="email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "custom-email");
  });

  it("wires aria-describedby + aria-invalid onto the control when there is an error", () => {
    render(
      <FormField label="Email" error="Email is required">
        <input type="email" />
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    const errorEl = screen.getByText("Email is required");
    expect(errorEl).toHaveAttribute("role", "alert");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
      errorEl.id,
    );
  });

  it("describes the control with helper text when there is no error", () => {
    render(
      <FormField label="Password" helperText="Use 8+ characters">
        <input type="password" />
      </FormField>,
    );
    const input = screen.getByLabelText("Password");
    const helper = screen.getByText("Use 8+ characters");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
      helper.id,
    );
  });

  it("prefers the error over helper text for the description", () => {
    render(
      <FormField
        label="Email"
        helperText="We never share it"
        error="Invalid email"
      >
        <input type="email" />
      </FormField>,
    );
    expect(screen.queryByText("We never share it")).not.toBeInTheDocument();
    const input = screen.getByLabelText("Email");
    const errorEl = screen.getByText("Invalid email");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
      errorEl.id,
    );
  });

  it("merges an existing aria-describedby already on the control", () => {
    render(
      <FormField label="Email" error="Required">
        <input type="email" aria-describedby="external-hint" />
      </FormField>,
    );
    const tokens = screen
      .getByLabelText("Email")
      .getAttribute("aria-describedby")
      ?.split(" ");
    expect(tokens).toContain("external-hint");
    expect(tokens?.length).toBeGreaterThan(1);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FormField label="Email" error="Email is required">
        <input type="email" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
