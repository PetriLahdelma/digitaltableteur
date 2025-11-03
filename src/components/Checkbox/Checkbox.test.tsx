import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  it("renders label", () => {
    render(
      <Checkbox
        label="Test Checkbox"
        checked={false}
        onCheckedChange={() => {}}
        disabled={false}
      />,
    );
    expect(screen.getByLabelText("Test Checkbox")).toBeInTheDocument();
  });

  it("calls onChange when clicked", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        label="Test Checkbox"
        checked={false}
        onCheckedChange={onCheckedChange}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText("Test Checkbox"));
    expect(onCheckedChange).toHaveBeenCalled();
  });

  it("is checked when checked prop is true", () => {
    render(
      <Checkbox
        label="Checked"
        checked={true}
        onCheckedChange={() => {}}
        disabled={false}
      />,
    );
    expect(screen.getByLabelText("Checked")).toBeChecked();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <Checkbox
        label="Disabled"
        checked={false}
        onCheckedChange={() => {}}
        disabled={true}
      />,
    );
    expect(screen.getByLabelText("Disabled")).toBeDisabled();
  });
});
