import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatComposer from "@dt/ChatComposer";

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
