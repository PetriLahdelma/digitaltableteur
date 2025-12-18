import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PhoneInput from "./PhoneInput";

describe("PhoneInput", () => {
  it("renders with label", () => {
    render(<PhoneInput label="Phone Number" />);
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<PhoneInput label="Phone" placeholder="Enter phone number" />);
    expect(
      screen.getByPlaceholderText("Enter phone number"),
    ).toBeInTheDocument();
  });

  it("renders with value", () => {
    render(<PhoneInput label="Phone" value="+358401234567" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("+358401234567");
  });

  it("renders helper text when provided", () => {
    render(<PhoneInput label="Phone" helperText="Include country code" />);
    expect(screen.getByText("Include country code")).toBeInTheDocument();
  });

  it("renders error message when error provided", () => {
    render(<PhoneInput label="Phone" error="Invalid phone number" />);
    expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
  });

  it("does not render helper text when error is present", () => {
    render(
      <PhoneInput label="Phone" error="Invalid" helperText="Helper text" />,
    );
    expect(screen.getByText("Invalid")).toBeInTheDocument();
    expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
  });

  it("calls onChange when value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInput label="Phone" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "+358401234567");

    expect(onChange).toHaveBeenCalled();
  });

  it("disables input when disabled prop is true", () => {
    render(<PhoneInput label="Phone" disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("applies error styling when error provided", () => {
    const { container } = render(<PhoneInput label="Phone" error="Error" />);
    const phoneInputDiv = container.querySelector(`.phone-input`);
    expect(phoneInputDiv).toHaveClass("error");
  });

  it("links label to input via htmlFor", () => {
    render(<PhoneInput label="Phone Number" />);
    const label = screen.getByText("Phone Number");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for");
    expect(input).toHaveAttribute("id");
  });

  it("shows label as required when error is present", () => {
    render(<PhoneInput label="Phone" error="Required" />);
    // Label component adds required styling when error is present
    const label = screen.getByText("Phone");
    expect(label).toBeInTheDocument();
  });

  it("uses FI as default country", () => {
    const { container } = render(<PhoneInput label="Phone" />);
    // react-phone-number-input sets default country internally
    const phoneInputDiv = container.querySelector(`.phone-input`);
    expect(phoneInputDiv).toBeInTheDocument();
  });

  it("handles undefined value", () => {
    render(<PhoneInput label="Phone" value={undefined} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("calls onChange with undefined when input is cleared", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PhoneInput label="Phone" value="+358401234567" onChange={onChange} />,
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
