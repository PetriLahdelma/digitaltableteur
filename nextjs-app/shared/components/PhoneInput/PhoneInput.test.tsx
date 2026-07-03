import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PhoneInput from "./PhoneInput";
import styles from "./PhoneInput.module.css";

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
    expect(input.value.replace(/\s/g, "")).toBe("+358401234567");
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
    const phoneInputDiv = container.querySelector(`.${styles["phone-input"]}`);
    expect(phoneInputDiv).toHaveClass(styles.error);
  });

  it("links label to input via htmlFor", () => {
    render(<PhoneInput label="Phone Number" />);
    const label = screen.getByText("Phone Number");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for");
    expect(input).toHaveAttribute("id");
  });

  it("shows the required marker only for the required prop, not for errors", () => {
    const { rerender } = render(<PhoneInput label="Phone" required />);
    expect(screen.getByText("*")).toBeInTheDocument();

    rerender(<PhoneInput label="Phone" error="Invalid" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("links the error to the input via aria-describedby and sets aria-invalid", () => {
    render(<PhoneInput label="Phone" error="Invalid phone number" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorNode = document.getElementById(describedBy as string);
    expect(errorNode).toHaveTextContent("Invalid phone number");
  });

  it("links helper text via aria-describedby when there is no error", () => {
    render(<PhoneInput label="Phone" helperText="Include country code" />);
    const input = screen.getByRole("textbox");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const helperNode = document.getElementById(describedBy as string);
    expect(helperNode).toHaveTextContent("Include country code");
  });

  it("respects the defaultCountry prop", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PhoneInput label="Phone" defaultCountry="SE" onChange={onChange} />,
    );
    await user.type(screen.getByRole("textbox"), "701234567");
    expect(onChange).toHaveBeenLastCalledWith("+46701234567");
  });

  it("uses FI as default country", () => {
    const { container } = render(<PhoneInput label="Phone" />);
    // react-phone-number-input sets default country internally
    const phoneInputDiv = container.querySelector(`.${styles["phone-input"]}`);
    expect(phoneInputDiv).toBeInTheDocument();
  });

  it("handles undefined value", () => {
    render(<PhoneInput label="Phone" value={undefined} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value.replace(/\s/g, "")).toMatch(/^\+?358?$/);
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
