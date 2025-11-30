import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Checkbox from "./Checkbox";

expect.extend(toHaveNoViolations);

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

  it("handles indeterminate state", () => {
    const { container } = render(
      <Checkbox
        label="Indeterminate"
        checked={false}
        indeterminate={true}
        onCheckedChange={() => {}}
      />,
    );
    const checkbox = screen.getByLabelText("Indeterminate") as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
    expect(container.querySelector(".indeterminateState")).toBeInTheDocument();
  });

  it("transitions from indeterminate to checked on click", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        label="Indeterminate"
        checked={false}
        indeterminate={true}
        onCheckedChange={onCheckedChange}
      />,
    );
    const checkbox = screen.getByLabelText("Indeterminate");
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("supports showLabel prop", () => {
    const { container } = render(
      <Checkbox
        label="Hidden Label"
        checked={false}
        showLabel={false}
        onCheckedChange={() => {}}
      />,
    );
    // Label should still be in DOM for accessibility but visually hidden
    expect(screen.getByLabelText("Hidden Label")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Checkbox
        ref={ref}
        label="With Ref"
        checked={false}
        onCheckedChange={() => {}}
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Checkbox
        label="Custom Class"
        checked={false}
        onCheckedChange={() => {}}
        className="custom-checkbox"
      />,
    );
    expect(container.querySelector(".custom-checkbox")).toBeInTheDocument();
  });

  it("handles disabled checked state", () => {
    render(
      <Checkbox
        label="Disabled Checked"
        checked={true}
        disabled={true}
        onCheckedChange={() => {}}
      />,
    );
    const checkbox = screen.getByLabelText(
      "Disabled Checked",
    ) as HTMLInputElement;
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("has no accessibility violations (unchecked)", async () => {
      const { container } = render(
        <Checkbox
          label="Accessible Checkbox"
          checked={false}
          onCheckedChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (checked)", async () => {
      const { container } = render(
        <Checkbox
          label="Checked Checkbox"
          checked={true}
          onCheckedChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (indeterminate)", async () => {
      const { container } = render(
        <Checkbox
          label="Indeterminate Checkbox"
          checked={false}
          indeterminate={true}
          onCheckedChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (disabled)", async () => {
      const { container } = render(
        <Checkbox
          label="Disabled Checkbox"
          checked={false}
          disabled={true}
          onCheckedChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
