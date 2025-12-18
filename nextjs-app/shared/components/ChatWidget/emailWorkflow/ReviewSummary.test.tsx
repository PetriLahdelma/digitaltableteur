import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewSummary from "./ReviewSummary";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockDraft = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+358401234567",
  interest: ["Project inquiry"],
  message: "I need help with my project",
};

describe("ReviewSummary", () => {
  it("renders all draft fields", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("+358401234567")).toBeInTheDocument();
    expect(screen.getByText("I need help with my project")).toBeInTheDocument();
  });

  it("renders interest field", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByText(/Project inquiry/i)).toBeInTheDocument();
  });
  it("renders send button", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("renders edit button", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("dispatches SEND action when send button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "SEND" });
  });

  it("dispatches EDIT action when edit button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "EDIT" });
  });

  it("dispatches CANCEL action when cancel button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "CANCEL" });
  });

  it("handles draft without phone", () => {
    const dispatch = vi.fn();
    const draftNoPhone = { ...mockDraft, phone: undefined };
    render(<ReviewSummary draft={draftNoPhone} dispatch={dispatch} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("+358401234567")).not.toBeInTheDocument();
  });

  it("renders with proper semantic structure", () => {
    const dispatch = vi.fn();
    const { container } = render(
      <ReviewSummary draft={mockDraft} dispatch={dispatch} />,
    );

    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("displays field labels", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByText(/fullName|email|message/i)).toBeInTheDocument();
  });

  it("renders multiple interests", () => {
    const dispatch = vi.fn();
    const multiInterest = { ...mockDraft, interest: ["Project", "Consulting"] };
    render(<ReviewSummary draft={multiInterest} dispatch={dispatch} />);

    expect(screen.getByText(/Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Consulting/i)).toBeInTheDocument();
  });

  it("handles empty interest array", () => {
    const dispatch = vi.fn();
    const noInterest = { ...mockDraft, interest: [] };
    render(<ReviewSummary draft={noInterest} dispatch={dispatch} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders long messages without truncation", () => {
    const dispatch = vi.fn();
    const longMessage = {
      ...mockDraft,
      message: "This is a very long message ".repeat(20),
    };
    render(<ReviewSummary draft={longMessage} dispatch={dispatch} />);

    expect(screen.getByText(/very long message/i)).toBeInTheDocument();
  });

  it("buttons are keyboard accessible", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    await user.tab();
    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(dispatch).toHaveBeenCalledWith({ type: "SEND" });
  });

  it("maintains data integrity in display", () => {
    const dispatch = vi.fn();
    const specialChars = {
      ...mockDraft,
      fullName: "John <script>alert('xss')</script> Doe",
      message: "Test & verify <b>bold</b>",
    };
    render(<ReviewSummary draft={specialChars} dispatch={dispatch} />);

    expect(screen.getByText(/John.*Doe/i)).toBeInTheDocument();
  });

  it("renders review heading", () => {
    const dispatch = vi.fn();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    expect(screen.getByText(/emailWorkflow.review/i)).toBeInTheDocument();
  });

  it("shows all action buttons together", () => {
    const dispatch = vi.fn();
    const { container } = render(
      <ReviewSummary draft={mockDraft} dispatch={dispatch} />,
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
