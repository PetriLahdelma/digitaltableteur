import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock emailjs send
vi.mock("@emailjs/browser", () => ({
  send: vi.fn(() => Promise.resolve({ status: 200 })),
}));

import ContactForm from "./ContactForm";

describe("ContactForm integration", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Reset fetch mock
    originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => ({}) }));

    // Clear all mocks to ensure fresh state
    vi.clearAllMocks();
  });

  it("submits correct payload to fetch and EmailJS", async () => {
    render(<ContactForm />);

    // Fill basic inputs by label text (use visible English translations now that i18n is initialized)
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const messageInput = screen.getByLabelText(/Your Message/i);

    // Use direct queries where labels might be translated
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "123456" } });
    fireEvent.change(messageInput, { target: { value: "Hello there" } });

    // Select interest checkboxes by role/label - pick the first option
    const interestCheckboxes = screen.getAllByRole("checkbox");
    // There may be a master checkbox; select the first slave checkbox
    if (interestCheckboxes.length > 1) {
      // Skip master (first) if present
      const slave = interestCheckboxes[interestCheckboxes.length > 1 ? 1 : 0];
      fireEvent.click(slave);
    }

    const submit = screen.getByRole("button", { name: /Submit/i });

    fireEvent.click(submit);

    // Wait for async operations (fetch and send) to be called
    await waitFor(() => {
      // @ts-ignore
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check fetch payload
    // @ts-ignore
    const fetchCall = (global.fetch as any).mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    expect(fetchBody).toHaveProperty("name", "Test User");
    expect(fetchBody).toHaveProperty("email", "test@example.com");
    expect(fetchBody).toHaveProperty("phone", "123456");
    expect(fetchBody).toHaveProperty("message", "Hello there");
    expect(fetchBody).toHaveProperty("interest");
    expect(fetchBody).toHaveProperty("attachmentName", null);
    expect(fetchBody).toHaveProperty("attachmentType", null);
    expect(fetchBody).toHaveProperty("attachmentSize", null);
    expect(fetchBody).toHaveProperty("attachmentData", null);

    // Check EmailJS send called with similar payload
    const { send } = await import("@emailjs/browser");
    expect(send).toHaveBeenCalled();
    const sendArgs = (send as any).mock.calls[0][2];
    expect(sendArgs).toHaveProperty("name", "Test User");
    expect(sendArgs).toHaveProperty("email", "test@example.com");
    expect(sendArgs).toHaveProperty("phone", "123456");
    expect(sendArgs).toHaveProperty("message", "Hello there");
    expect(sendArgs).toHaveProperty("interest");
    expect(sendArgs).toHaveProperty("attachmentName", "");
    expect(sendArgs).toHaveProperty("attachmentType", "");
    expect(sendArgs).toHaveProperty("attachmentSize", "");
    expect(sendArgs).toHaveProperty("attachmentData", "");
    expect(sendArgs).toHaveProperty("attachmentNotice", "");

    // restore fetch
    global.fetch = originalFetch;
  });
});
