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

  it("with choices, asks which one first, then confirms the picked one", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmPopover
        title="What do you want to clear?"
        tone="error"
        choices={[
          { id: "section", label: "Clear this section", title: "Clear the answers in this section?", confirmLabel: "Clear section" },
          { id: "all", label: "Clear all", title: "Clear every answer in the form?", description: "Every part starts empty.", confirmLabel: "Clear all answers" },
        ]}
        onConfirm={onConfirm}
      >
        <button type="button">Clear</button>
      </ConfirmPopover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    const first = await screen.findByRole("alertdialog", { name: "What do you want to clear?" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Clear this section" })).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Clear every answer in the form?" });
    // A fresh dialog element, so assistive tech announces the new question.
    expect(dialog).not.toBe(first);
    expect(dialog).toHaveAccessibleDescription("Every part starts empty.");
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
    expect(await axe(dialog)).toHaveNoViolations();
    await userEvent.click(screen.getByRole("button", { name: "Clear all answers" }));
    expect(onConfirm).toHaveBeenCalledWith("all");
  });

  it("draws a pointer and the shortcut keys when asked", async () => {
    render(
      <ConfirmPopover
        title="Start a new chat?"
        description="This conversation will be cleared."
        confirmLabel="New chat"
        side="left"
        arrow
        shortcut={["⌘", "⇧", "⌫"]}
        onConfirm={vi.fn()}
      >
        <button type="button">New chat</button>
      </ConfirmPopover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "New chat" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Start a new chat?" });

    expect(dialog.querySelectorAll("kbd")).toHaveLength(3);
    expect(dialog).toHaveTextContent("Command+Shift+Backspace");
    expect(dialog.querySelector('svg[viewBox="0 0 16 8"]')).not.toBeNull();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("draws neither by default", async () => {
    renderPopover();
    await userEvent.click(screen.getByRole("button", { name: "Clear answers" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.querySelector("kbd")).toBeNull();
    expect(dialog.querySelector('svg[viewBox="0 0 16 8"]')).toBeNull();
  });

  it("centres on the trigger with an arrow, ignoring align", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ConfirmPopover
        title="Start a new chat?"
        confirmLabel="New chat"
        side="left"
        align="start"
        arrow
        onConfirm={vi.fn()}
      >
        <button type="button">New chat</button>
      </ConfirmPopover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "New chat" }));
    const dialog = await screen.findByRole("alertdialog");

    expect(dialog).toHaveAttribute("data-align", "center");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('align="start" is ignored with arrow'));
    warn.mockRestore();
  });
});
