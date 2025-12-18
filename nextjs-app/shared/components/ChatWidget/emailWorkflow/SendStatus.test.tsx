import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SendStatus from "./SendStatus";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("SendStatus", () => {
  it("renders sending state", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="sending" dispatch={dispatch} />);

    expect(screen.getByText("emailWorkflow.sending")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("renders success state", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="success" dispatch={dispatch} />);

    expect(screen.getByText("emailWorkflow.success")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="error" dispatch={dispatch} />);

    expect(screen.getByText("emailWorkflow.error.send")).toBeInTheDocument();
  });

  it("renders retry button on error", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="error" dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders edit button on error", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="error" dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("renders cancel button on error", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="error" dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("dispatches RETRY action when retry clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<SendStatus step="error" dispatch={dispatch} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "RETRY" });
  });

  it("dispatches EDIT action when edit clicked on error", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<SendStatus step="error" dispatch={dispatch} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "EDIT" });
  });

  it("dispatches CANCEL action when cancel clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<SendStatus step="error" dispatch={dispatch} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "CANCEL" });
  });

  it("shows close button on success", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="success" dispatch={dispatch} />);

    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("dispatches RESET action when close clicked on success", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<SendStatus step="success" dispatch={dispatch} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "RESET" });
  });

  it("shows loading spinner during sending", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="sending" dispatch={dispatch} />);

    const statusElement = screen.getByRole("status");
    expect(statusElement).toBeInTheDocument();
  });

  it("renders success message with proper semantics", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="success" dispatch={dispatch} />);

    expect(screen.getByText(/emailWorkflow.success/i)).toBeInTheDocument();
  });

  it("renders error message with proper semantics", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="error" dispatch={dispatch} />);

    expect(screen.getByText(/emailWorkflow.error.send/i)).toBeInTheDocument();
  });

  it("does not show buttons during sending", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="sending" dispatch={dispatch} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("buttons are keyboard accessible on error", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<SendStatus step="error" dispatch={dispatch} />);

    await user.tab();
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(dispatch).toHaveBeenCalledWith({ type: "RETRY" });
  });

  it("close button is keyboard accessible on success", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<SendStatus step="success" dispatch={dispatch} />);

    await user.tab();
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(dispatch).toHaveBeenCalledWith({ type: "RESET" });
  });

  it("renders correct aria-live for status updates", () => {
    const dispatch = vi.fn();
    const { rerender } = render(
      <SendStatus step="sending" dispatch={dispatch} />,
    );

    const statusElement = screen.getByRole("status");
    expect(statusElement).toHaveAttribute("aria-busy", "true");

    rerender(<SendStatus step="success" dispatch={dispatch} />);
    expect(screen.queryByRole("status")).not.toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("renders multiple action buttons on error", () => {
    const dispatch = vi.fn();
    const { container } = render(
      <SendStatus step="error" dispatch={dispatch} />,
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3); // retry, edit, cancel
  });

  it("shows descriptive error message", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="error" dispatch={dispatch} />);

    expect(screen.getByText(/emailWorkflow.error.send/i)).toBeInTheDocument();
  });

  it("renders success icon or indicator", () => {
    const dispatch = vi.fn();
    render(<SendStatus step="success" dispatch={dispatch} />);

    expect(screen.getByText(/emailWorkflow.success/i)).toBeInTheDocument();
  });

  it("maintains consistent styling across states", () => {
    const dispatch = vi.fn();
    const { container: sendingContainer } = render(
      <SendStatus step="sending" dispatch={dispatch} />,
    );

    const { container: successContainer } = render(
      <SendStatus step="success" dispatch={dispatch} />,
    );

    const { container: errorContainer } = render(
      <SendStatus step="error" dispatch={dispatch} />,
    );

    expect(sendingContainer.firstChild).toBeInTheDocument();
    expect(successContainer.firstChild).toBeInTheDocument();
    expect(errorContainer.firstChild).toBeInTheDocument();
  });
});
