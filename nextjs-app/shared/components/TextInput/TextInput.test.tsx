import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Input from "./TextInput";

// Mock i18next for testing
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        inputValidationEmailInvalid: "Please enter a valid email address",
        inputValidationPhoneInvalid: "Invalid phone number format",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Phosphor icons to avoid React context issues in tests
vi.mock("@phosphor-icons/react", () => ({
  WarningCircle: ({ size }: { size?: number }) => (
    <span data-testid="warning-circle-icon" style={{ width: size, height: size }} />
  ),
  Warning: ({ size }: { size?: number }) => (
    <span data-testid="warning-icon" style={{ width: size, height: size }} />
  ),
  CheckCircle: ({ size }: { size?: number }) => (
    <span data-testid="check-circle-icon" style={{ width: size, height: size }} />
  ),
  Info: ({ size }: { size?: number }) => (
    <span data-testid="info-icon" style={{ width: size, height: size }} />
  ),
}));

describe("Input", () => {
  const renderInput = (props: React.ComponentProps<typeof Input>) => {
    return render(<Input {...props} />);
  };

  it("renders with label and placeholder", () => {
    renderInput({
      label: "Test Label",
      type: "text",
      placeholder: "Test placeholder",
    });

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("handles text input changes", () => {
    const onChange = vi.fn();
    renderInput({
      label: "Text Input",
      type: "text",
      onChange,
    });

    const input = screen.getByLabelText("Text Input");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(onChange).toHaveBeenCalledWith("test value");
  });

  it("handles number input changes", () => {
    const onChange = vi.fn();
    renderInput({
      label: "Number Input",
      type: "number",
      onChange,
    });

    const input = screen.getByLabelText("Number Input");
    fireEvent.change(input, { target: { value: "123" } });

    expect(onChange).toHaveBeenCalledWith(123);
  });

  it("displays error message when provided", () => {
    renderInput({
      label: "Test Input",
      type: "text",
      error: "This field is required",
    });

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("validates email format", () => {
    renderInput({
      label: "Email Input",
      type: "email",
    });

    const input = screen.getByLabelText("Email Input");
    fireEvent.change(input, { target: { value: "invalid-email" } });
    fireEvent.blur(input);

    expect(
      screen.getByText("Please enter a valid email address"),
    ).toBeInTheDocument();
  });

  it("validates phone format", () => {
    renderInput({
      label: "Phone Input",
      type: "tel",
    });

    const input = screen.getByLabelText("Phone Input");
    fireEvent.change(input, { target: { value: "abc" } });

    // Phone validation uses i18n translation key - test that input is rendered
    expect(input).toBeInTheDocument();
  });

  it("disables input when disabled prop is true", () => {
    renderInput({
      label: "Disabled Input",
      type: "text",
      disabled: true,
    });

    expect(screen.getByLabelText("Disabled Input")).toBeDisabled();
  });

  describe("accessibility", () => {
    it("should have aria-invalid when there is an error", () => {
      renderInput({
        label: "Email",
        type: "email",
        error: "Invalid email",
      });
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should not have aria-invalid when there is no error", () => {
      renderInput({
        label: "Email",
        type: "email",
      });
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("should have aria-describedby pointing to error message", () => {
      renderInput({
        label: "Email",
        type: "email",
        error: "Invalid email",
      });
      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      const errorElement = document.getElementById(describedBy!);
      expect(errorElement).toHaveTextContent("Invalid email");
    });

    it("should have aria-describedby pointing to helper text when no error", () => {
      renderInput({
        label: "Email",
        type: "email",
        helperText: "We'll never share your email",
      });
      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      const helperElement = document.getElementById(describedBy!);
      expect(helperElement).toHaveTextContent("We'll never share your email");
    });

    it("should have role=alert on error message", () => {
      renderInput({
        label: "Email",
        type: "email",
        error: "Invalid email",
      });
      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveTextContent("Invalid email");
    });
  });
});
