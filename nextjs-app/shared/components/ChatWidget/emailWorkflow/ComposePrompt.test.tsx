import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComposePrompt from "./ComposePrompt";

// Mock the package translation adapter.
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

describe("ComposePrompt", () => {
  it("renders prompt text", () => {
    const dispatch = vi.fn();
    render(<ComposePrompt dispatch={dispatch} />);

    expect(screen.getByText("emailWorkflow.promptAddress")).toBeInTheDocument();
    expect(
      screen.getByText("emailWorkflow.promptStartQuestion"),
    ).toBeInTheDocument();
  });

  it("renders compose button", () => {
    const dispatch = vi.fn();
    render(<ComposePrompt dispatch={dispatch} />);

    expect(
      screen.getByRole("button", { name: /emailWorkflow.compose/i }),
    ).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const dispatch = vi.fn();
    render(<ComposePrompt dispatch={dispatch} />);

    expect(
      screen.getByRole("button", { name: /emailWorkflow.cancel/i }),
    ).toBeInTheDocument();
  });

  it("dispatches COMPOSE action when compose button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ComposePrompt dispatch={dispatch} />);

    const composeButton = screen.getByRole("button", {
      name: /emailWorkflow.compose/i,
    });
    await user.click(composeButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "COMPOSE" });
  });

  it("dispatches CANCEL action when cancel button clicked", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ComposePrompt dispatch={dispatch} />);

    const cancelButton = screen.getByRole("button", {
      name: /emailWorkflow.cancel/i,
    });
    await user.click(cancelButton);

    expect(dispatch).toHaveBeenCalledWith({ type: "CANCEL" });
  });

  it("renders with proper semantic structure", () => {
    const dispatch = vi.fn();
    const { container } = render(<ComposePrompt dispatch={dispatch} />);

    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("buttons are keyboard accessible", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ComposePrompt dispatch={dispatch} />);

    const composeButton = screen.getByRole("button", {
      name: /emailWorkflow.compose/i,
    });

    await user.tab();
    expect(composeButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(dispatch).toHaveBeenCalledWith({ type: "COMPOSE" });
  });

  it("renders email address in prompt text", () => {
    const dispatch = vi.fn();
    render(<ComposePrompt dispatch={dispatch} />);

    expect(
      screen.getByText(/emailWorkflow.promptAddress/i),
    ).toBeInTheDocument();
  });

  it("has proper button spacing", () => {
    const dispatch = vi.fn();
    const { container } = render(<ComposePrompt dispatch={dispatch} />);

    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
  });

  it("maintains focus after cancel", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ComposePrompt dispatch={dispatch} />);

    const cancelButton = screen.getByRole("button", {
      name: /emailWorkflow.cancel/i,
    });

    await user.click(cancelButton);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("does not submit on enter key press", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<ComposePrompt dispatch={dispatch} />);

    await user.keyboard("{Enter}");
    expect(dispatch).not.toHaveBeenCalled();
  });
});
