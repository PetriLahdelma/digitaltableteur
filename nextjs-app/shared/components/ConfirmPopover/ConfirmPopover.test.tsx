import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ConfirmPopover } from "./ConfirmPopover";

expect.extend(toHaveNoViolations);

// Radix positions with ResizeObserver and pointer capture, which jsdom omits.
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

function renderPopover(onConfirm = vi.fn()) {
  render(
    <ConfirmPopover
      title="Clear the answers in this section?"
      description="What you entered on this screen is removed."
      confirmLabel="Clear answers"
      tone="error"
      onConfirm={onConfirm}
    >
      <button type="button">Clear answers</button>
    </ConfirmPopover>,
  );
  return onConfirm;
}

describe("ConfirmPopover", () => {
  it("opens an alertdialog named by the question, with focus on Cancel", async () => {
    renderPopover();
    await userEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Clear the answers in this section?",
    });
    expect(dialog).toHaveAccessibleDescription(
      "What you entered on this screen is removed.",
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
  });

  it("confirms, closes and calls onConfirm", async () => {
    const onConfirm = renderPopover();
    await userEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      Array.from(dialog.querySelectorAll("button")).find(
        (button) => button.textContent === "Clear answers",
      )!,
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  });

  it("cancels with Escape and returns focus to the trigger", async () => {
    const onConfirm = renderPopover();
    const trigger = screen.getByRole("button", { name: "Clear answers" });
    await userEvent.click(trigger);
    await screen.findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("cancels with the Cancel button", async () => {
    const onConfirm = renderPopover();
    await userEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("has no axe violations while open", async () => {
    renderPopover();
    await userEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    await screen.findByRole("alertdialog");
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
