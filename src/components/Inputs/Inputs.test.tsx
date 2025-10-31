import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import Input from "./Inputs";

// Mock i18next for testing
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const translations: Record<string, string> = {
          inputValidationEmailInvalid: "Please enter a valid email address",
          inputValidationPhoneInvalid: "Invalid phone number format",
        };
        return translations[key] || key;
      },
    }),
  };
});

describe("Input", () => {
  const renderInput = (props: any) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <Input {...props} />
      </I18nextProvider>,
    );
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
    fireEvent.blur(input);

    expect(screen.getByText("Invalid phone number format")).toBeInTheDocument();
  });

  it("disables input when disabled prop is true", () => {
    renderInput({
      label: "Disabled Input",
      type: "text",
      disabled: true,
    });

    expect(screen.getByLabelText("Disabled Input")).toBeDisabled();
  });
});
