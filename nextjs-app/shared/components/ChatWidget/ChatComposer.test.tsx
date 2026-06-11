import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatComposer from "@dt/ChatWidget/ChatComposer";

expect.extend(toHaveNoViolations);

// Minimal stub Button dependency is imported via alias in actual component; rely on existing implementation.

describe("ChatComposer keyboard submit", () => {
  function setup(overrides: Partial<Parameters<typeof ChatComposer>[0]> = {}) {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    });
    const onValueChange = vi.fn();
    render(
      <ChatComposer
        inputId="chat-input"
        value={overrides.value ?? "Hello world"}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        isSending={false}
        label="Label"
        sendLabel="Send"
        {...overrides}
      />,
    );
    return { onSubmit, onValueChange };
  }

  it("does NOT submit on plain Enter (adds newline instead)", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits exactly once on Cmd+Enter (macOS metaKey)", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("submits exactly once on Ctrl+Enter (Windows/Linux)", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit on Shift+Enter (allows newline)", () => {
    const initial = "Line one";
    const { onSubmit } = setup({ value: initial });
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when disabled (isSending)", () => {
    const { onSubmit } = setup({ isSending: true });
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ChatComposer inline reset", () => {
  function setupWithReset(
    overrides: Partial<Parameters<typeof ChatComposer>[0]> = {},
  ) {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    });
    const onReset = vi.fn();
    render(
      <ChatComposer
        inputId="chat-input"
        value="Hello"
        onValueChange={vi.fn()}
        onSubmit={onSubmit}
        onReset={onReset}
        isSending={false}
        label="Label"
        sendLabel="Send"
        {...overrides}
      />,
    );
    return { onReset };
  }

  it("renders the clear button and calls onReset on click", () => {
    const { onReset } = setupWithReset();
    const resetButton = screen.getByRole("button", {
      name: /clear conversation/i,
    });
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("disables the clear button while sending", () => {
    setupWithReset({ isSending: true });
    expect(
      screen.getByRole("button", { name: /clear conversation/i }),
    ).toBeDisabled();
  });

  it("resets on Cmd+Shift+Backspace (macOS)", () => {
    const { onReset } = setupWithReset();
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, {
      key: "Backspace",
      metaKey: true,
      shiftKey: true,
    });
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("resets on Ctrl+Shift+Backspace (Windows/Linux)", () => {
    const { onReset } = setupWithReset();
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, {
      key: "Backspace",
      ctrlKey: true,
      shiftKey: true,
    });
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("does not reset on plain Backspace", () => {
    const { onReset } = setupWithReset();
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, { key: "Backspace" });
    expect(onReset).not.toHaveBeenCalled();
  });

  it("does not reset via shortcut while sending", () => {
    const { onReset } = setupWithReset({ isSending: true });
    const textarea = screen.getByLabelText(/Label/i);
    fireEvent.keyDown(textarea, {
      key: "Backspace",
      metaKey: true,
      shiftKey: true,
    });
    expect(onReset).not.toHaveBeenCalled();
  });

  it("does not render a clear button when onReset is omitted", () => {
    const onSubmit = vi.fn();
    render(
      <ChatComposer
        inputId="chat-input"
        value="Hello"
        onValueChange={vi.fn()}
        onSubmit={onSubmit}
        isSending={false}
      />,
    );
    expect(screen.queryByRole("button", { name: /clear|reset/i })).toBeNull();
  });

  it("has no accessibility violations with the clear button visible", async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <ChatComposer
        inputId="chat-input"
        value="Hello"
        onValueChange={vi.fn()}
        onSubmit={onSubmit}
        onReset={vi.fn()}
        isSending={false}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("ChatComposer accessibility", () => {
  it("has no accessibility violations in default state", async () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const { container } = render(
      <ChatComposer
        inputId="chat-input"
        value="Test message"
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        isSending={false}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when sending", async () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const { container } = render(
      <ChatComposer
        inputId="chat-input"
        value="Sending..."
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        isSending={true}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations with empty value", async () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const { container } = render(
      <ChatComposer
        inputId="chat-input"
        value=""
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        isSending={false}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
