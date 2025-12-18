import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GroupLabel from "@dt/GroupLabel";

describe("GroupLabel", () => {
  it("renders label with children content", () => {
    render(<GroupLabel htmlFor="test-input">Test Label</GroupLabel>);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("associates label with input using htmlFor", () => {
    render(<GroupLabel htmlFor="email-input">Email Address</GroupLabel>);
    const label = screen.getByText("Email Address");
    expect(label).toHaveAttribute("for", "email-input");
  });

  it("displays required asterisk when required prop is true", () => {
    render(
      <GroupLabel htmlFor="required-input" required>
        Required Field
      </GroupLabel>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not display required asterisk when required prop is false", () => {
    render(
      <GroupLabel htmlFor="optional-input" required={false}>
        Optional Field
      </GroupLabel>,
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("applies disabled styling when disabled prop is true", () => {
    render(
      <GroupLabel htmlFor="disabled-input" disabled>
        Disabled Field
      </GroupLabel>,
    );
    const label = screen.getByText("Disabled Field");
    expect(label.className).toContain("disabled");
  });

  it("does not apply disabled styling when disabled prop is false", () => {
    render(
      <GroupLabel htmlFor="enabled-input" disabled={false}>
        Enabled Field
      </GroupLabel>,
    );
    const label = screen.getByText("Enabled Field");
    expect(label.className).not.toContain("disabled");
  });

  it("sets title attribute from title prop", () => {
    render(
      <GroupLabel htmlFor="titled-input" title="Custom tooltip">
        Field with Tooltip
      </GroupLabel>,
    );
    const label = screen.getByText("Field with Tooltip");
    expect(label).toHaveAttribute("title", "Custom tooltip");
  });

  it("falls back to tooltipText when title is not provided", () => {
    render(
      <GroupLabel htmlFor="fallback-input" tooltipText="Fallback tooltip">
        Field with Fallback
      </GroupLabel>,
    );
    const label = screen.getByText("Field with Fallback");
    expect(label).toHaveAttribute("title", "Fallback tooltip");
  });

  it("prefers title over tooltipText when both are provided", () => {
    render(
      <GroupLabel
        htmlFor="priority-input"
        title="Primary tooltip"
        tooltipText="Secondary tooltip"
      >
        Field with Priority
      </GroupLabel>,
    );
    const label = screen.getByText("Field with Priority");
    expect(label).toHaveAttribute("title", "Primary tooltip");
  });

  it("passes through additional HTML attributes", () => {
    render(
      <GroupLabel
        htmlFor="custom-input"
        data-testid="custom-label"
        className="custom-class"
      >
        Custom Field
      </GroupLabel>,
    );
    const label = screen.getByTestId("custom-label");
    expect(label).toHaveClass("custom-class");
  });

  it("combines required and disabled states", () => {
    render(
      <GroupLabel htmlFor="combo-input" required disabled>
        Required Disabled Field
      </GroupLabel>,
    );
    const label = screen.getByText("Required Disabled Field").closest("label");
    expect(label?.className).toContain("disabled");
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
