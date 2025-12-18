import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldPrompt from "./FieldPrompt";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock validation
const mockGenerateErrors = vi.fn(() => ({}));
vi.mock("@dt/ContactForm/contactValidation", () => ({
  generateErrors: mockGenerateErrors,
}));

const mockDraft = {
  fullName: "",
  email: "",
  phone: "",
  interest: [] as string[],
  message: "",
};

describe("FieldPrompt", () => {
  it("renders collecting full name step", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders collecting email step", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingEmail"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders collecting phone step", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingPhone"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders collecting message step", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingMessage"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders next button", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("renders back button", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("updates input value on typing", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "John Doe");

    expect(input).toHaveValue("John Doe");
  });

  it("dispatches BACK action when back button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingEmail"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "BACK" });
  });

  it("pre-fills input with draft value", () => {
    const dispatch = vi.fn();
    const draftWithName = { ...mockDraft, fullName: "Jane Smith" };
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={draftWithName}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Jane Smith");
  });

  it("validates email format", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingEmail"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "invalid-email");

    expect(input).toHaveValue("invalid-email");
  });

  it("allows empty optional phone field", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingPhone"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    expect(dispatch).toHaveBeenCalled();
  });

  it("handles multiline message input", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingMessage"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "First line{Enter}Second line");

    expect(input).toHaveValue("First line\nSecond line");
  });

  it("renders field label correctly", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    expect(
      screen.getByText(/emailWorkflow.fields.fullName/i),
    ).toBeInTheDocument();
  });

  it("autofocuses input field on mount", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });

  it("disables next button while validating", () => {
    const dispatch = vi.fn();
    render(
      <FieldPrompt
        step="collectingEmail"
        draft={{ ...mockDraft, email: "" }}
        dispatch={dispatch}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("shows validation error message", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    mockGenerateErrors.mockReturnValue({
      email: "Invalid email format",
    });

    render(
      <FieldPrompt
        step="collectingEmail"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "bad");

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it("clears input on cancel via back button", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "Test");

    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "BACK" });
  });

  it("handles Enter key to submit", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={{ ...mockDraft, fullName: "John" }}
        dispatch={dispatch}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(dispatch).toHaveBeenCalled();
  });
});
