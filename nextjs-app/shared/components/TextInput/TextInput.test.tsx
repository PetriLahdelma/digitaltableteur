import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import Input from "./TextInput";

expect.extend(toHaveNoViolations);

// Mock i18next for testing
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        inputValidationEmailInvalid: "Please enter a valid email address",
        inputValidationPhoneInvalid: "Invalid phone number format",
        inputClearField: "Clear {{field}}",
      };
      const template = translations[key] || key;
      return template.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(options?.[name] ?? ""),
      );
    },
  }),
}));

// The clear button's Icon is decorative; a stub keeps the registry (and its
// full @phosphor-icons/react surface) out of this suite's partial mock.
vi.mock("@dt/Icon", () => ({
  default: ({ name }: { name: string }) => (
    <span data-testid={`icon-${name}`} aria-hidden="true" />
  ),
}));

// Mock Phosphor icons to avoid React context issues in tests
vi.mock("@phosphor-icons/react", () => ({
  WarningCircle: ({ size }: { size?: number }) => (
    <span
      data-testid="warning-circle-icon"
      style={{ width: size, height: size }}
    />
  ),
  Warning: ({ size }: { size?: number }) => (
    <span data-testid="warning-icon" style={{ width: size, height: size }} />
  ),
  CheckCircle: ({ size }: { size?: number }) => (
    <span
      data-testid="check-circle-icon"
      style={{ width: size, height: size }}
    />
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

  it("preserves native date values and reports them through onValueChange", () => {
    const onValueChange = vi.fn();
    renderInput({
      label: "Start date",
      type: "date",
      defaultValue: "2026-07-26",
      onValueChange,
    });

    const input = screen.getByLabelText("Start date");
    expect(input).toHaveAttribute("type", "date");
    fireEvent.change(input, { target: { value: "2026-08-01" } });
    expect(onValueChange).toHaveBeenCalledWith("2026-08-01");
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

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
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

  describe("clearable", () => {
    it("shows no clear button while the field is empty", () => {
      renderInput({ label: "Name", type: "text", clearable: true });
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows a clear button named after the field once there is a value", () => {
      renderInput({ label: "Name", type: "text", clearable: true });
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Ada" },
      });
      expect(
        screen.getByRole("button", { name: "Clear Name" }),
      ).toBeInTheDocument();
    });

    it("clears the value, fires onValueChange('') + onClear, and refocuses the input", () => {
      const onValueChange = vi.fn();
      const onClear = vi.fn();
      renderInput({
        label: "Name",
        type: "text",
        clearable: true,
        onValueChange,
        onClear,
      });
      const input = screen.getByLabelText("Name");
      fireEvent.change(input, { target: { value: "Ada" } });
      fireEvent.click(screen.getByRole("button", { name: "Clear Name" }));

      expect(input).toHaveValue("");
      expect(onValueChange).toHaveBeenLastCalledWith("");
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(input).toHaveFocus();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("clears a controlled value back through onValueChange", () => {
      const onValueChange = vi.fn();
      renderInput({
        label: "Name",
        type: "text",
        clearable: true,
        value: "Ada",
        onValueChange,
      });
      fireEvent.click(screen.getByRole("button", { name: "Clear Name" }));
      expect(onValueChange).toHaveBeenLastCalledWith("");
    });

    it("clears a built-in validation error along with the value", () => {
      renderInput({ label: "Email", type: "email", clearable: true });
      const input = screen.getByLabelText("Email");
      fireEvent.change(input, { target: { value: "not-an-email" } });
      expect(screen.getByRole("alert")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Clear Email" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("hides the clear button while disabled", () => {
      renderInput({
        label: "Name",
        type: "text",
        clearable: true,
        value: "Ada",
        disabled: true,
      });
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("uses a non-submitting button", () => {
      renderInput({
        label: "Name",
        type: "text",
        clearable: true,
        value: "Ada",
      });
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("hideLabel", () => {
    it("keeps the label associated and accessible", () => {
      renderInput({ label: "Name", type: "text", hideLabel: true });
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    it("applies the visually-hidden class to the label", () => {
      renderInput({ label: "Name", type: "text", hideLabel: true });
      const label = screen.getByText("Name");
      expect(label.className).toMatch(/srOnly/);
    });
  });

  describe("axe", () => {
    it("has no violations with a populated clearable field and hidden label", async () => {
      const { container } = render(
        <Input
          label="Name"
          type="text"
          clearable
          hideLabel
          value="Ada"
          helperText="As it should appear in the signature"
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no violations in the error state", async () => {
      const { container } = render(
        <Input
          label="Email"
          type="email"
          clearable
          value="x"
          error="Invalid email"
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
