import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldPrompt from "./FieldPrompt";

vi.mock("../../../lib/translation", () => {
  const t = (key: string) => key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

const { mockGenerateErrors } = vi.hoisted(() => ({
  mockGenerateErrors: vi.fn(() => ({})),
}));
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
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders next button", () => {
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /emailWorkflow.action.next/i }),
    ).toBeInTheDocument();
  });

  it("renders skip on optional phone step", () => {
    render(
      <FieldPrompt
        step="collectingPhone"
        draft={mockDraft}
        dispatch={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /emailWorkflow.action.skip/i }),
    ).toBeInTheDocument();
  });

  it("updates input value on typing", async () => {
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={vi.fn()}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "John Doe");
    expect(input).toHaveValue("John Doe");
  });

  it("pre-fills input with draft value", () => {
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={{ ...mockDraft, fullName: "Jane Smith" }}
        dispatch={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("Jane Smith");
  });

  it("dispatches NEXT when next is clicked with valid data", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingFullName"
        draft={mockDraft}
        dispatch={dispatch}
      />,
    );

    await user.type(screen.getByRole("textbox"), "John Doe");
    await user.click(
      screen.getByRole("button", { name: /emailWorkflow.action.next/i }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_FIELD",
      field: "fullName",
      value: "John Doe",
    });
    expect(dispatch).toHaveBeenCalledWith({ type: "NEXT" });
  });

  it("shows validation error from generateErrors", async () => {
    mockGenerateErrors.mockReturnValueOnce({ email: "Invalid email format" });
    const user = userEvent.setup();
    render(
      <FieldPrompt
        step="collectingEmail"
        draft={mockDraft}
        dispatch={vi.fn()}
      />,
    );

    await user.type(screen.getByRole("textbox"), "bad");
    await user.click(
      screen.getByRole("button", { name: /emailWorkflow.action.next/i }),
    );

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  it("renders interest step with checkboxes", () => {
    render(
      <FieldPrompt
        step="collectingInterest"
        draft={mockDraft}
        dispatch={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });
});
