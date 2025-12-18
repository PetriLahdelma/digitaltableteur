import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SelectOption from "./SelectOption";

describe("SelectOption", () => {
  it("renders with value and label", () => {
    const { container } = render(
      <select>
        <SelectOption value="option1" label="Option 1" />
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).toHaveValue("option1");
    expect(option).toHaveTextContent("Option 1");
  });

  it("renders children instead of label when provided", () => {
    const { container } = render(
      <select>
        <SelectOption value="option1" label="Ignored">
          Custom Content
        </SelectOption>
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).toHaveTextContent("Custom Content");
  });

  it("renders disabled option", () => {
    const { container } = render(
      <select>
        <SelectOption value="option1" label="Disabled Option" disabled />
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).toBeDisabled();
  });

  it("renders enabled option by default", () => {
    const { container } = render(
      <select>
        <SelectOption value="option1" label="Enabled Option" />
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).not.toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <select>
        <SelectOption value="option1" label="Option" />
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).toHaveClass("option");
  });

  it("forwards additional props", () => {
    const { container } = render(
      <select>
        <SelectOption
          value="option1"
          label="Option"
          data-testid="custom-option"
        />
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).toHaveAttribute("data-testid", "custom-option");
  });

  it("renders multiple options in a select", () => {
    const { container } = render(
      <select>
        <SelectOption value="1" label="One" />
        <SelectOption value="2" label="Two" />
        <SelectOption value="3" label="Three" />
      </select>,
    );
    const options = container.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue("1");
    expect(options[1]).toHaveValue("2");
    expect(options[2]).toHaveValue("3");
  });

  it("handles empty string value", () => {
    const { container } = render(
      <select>
        <SelectOption value="" label="Select..." />
      </select>,
    );
    const option = container.querySelector("option");
    expect(option).toHaveValue("");
  });
});
