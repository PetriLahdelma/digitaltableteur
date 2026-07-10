import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewSummary from "./ReviewSummary";

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

const mockDraft = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+358401234567",
  interest: ["Project inquiry"],
  message: "I need help with my project",
};

describe("ReviewSummary", () => {
  it("renders all draft fields", () => {
    render(<ReviewSummary draft={mockDraft} dispatch={vi.fn()} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("+358401234567")).toBeInTheDocument();
    expect(screen.getByText("I need help with my project")).toBeInTheDocument();
  });

  it("renders interest field", () => {
    render(<ReviewSummary draft={mockDraft} dispatch={vi.fn()} />);
    expect(screen.getByText(/Project inquiry/i)).toBeInTheDocument();
  });

  it("dispatches SEND_REQUEST when send button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    await user.click(
      screen.getByRole("button", { name: /emailWorkflow.review.send/i }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: "SEND_REQUEST" });
  });

  it("dispatches CANCEL when cancel button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    await user.click(
      screen.getByRole("button", { name: /emailWorkflow.cancel/i }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: "CANCEL" });
  });

  it("dispatches EDIT for a field when its edit button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ReviewSummary draft={mockDraft} dispatch={dispatch} />);

    await user.click(
      screen.getByRole("button", { name: /emailWorkflow.field.email/i }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "EDIT",
      field: "email",
    });
  });

  it("handles draft without phone", () => {
    render(
      <ReviewSummary
        draft={{ ...mockDraft, phone: undefined }}
        dispatch={vi.fn()}
      />,
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("+358401234567")).not.toBeInTheDocument();
  });

  it("renders review heading", () => {
    render(<ReviewSummary draft={mockDraft} dispatch={vi.fn()} />);
    expect(
      screen.getByText(/emailWorkflow.review.title/i),
    ).toBeInTheDocument();
  });
});
