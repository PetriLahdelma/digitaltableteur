import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock environment variables BEFORE importing ContactForm
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_EMAIL_SERVICE_ID: "test_service_id",
    VITE_EMAIL_TEMPLATE_ID: "test_template_id",
    VITE_EMAIL_PUBLIC_KEY: "test_public_key",
  },
  writable: true,
});

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
    vi.clearAllMocks();
  });

  it("submits correct payload to fetch and EmailJS", async () => {
    render(<ContactForm />);

    // Fill basic inputs by label text
    const nameInput =
      screen.getByLabelText(/contactFullName|Default/i) ||
      screen.getByLabelText(/Full name/i);
    const emailInput =
      screen.getByLabelText(/contactEmail|Email/i) ||
      screen.getByLabelText(/Email/i);
    const phoneInput =
      screen.getByLabelText(/contactPhone|Phone/i) ||
      screen.getByLabelText(/Phone/i);
    const messageInput =
      screen.getByLabelText(/contactMessage|Message/i) ||
      screen.getByLabelText(/Message/i);

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

    const submit =
      screen.getByRole("button", { name: /contactSubmit|Submit/i }) ||
      screen.getByText(/Submit/i);

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

    // Check EmailJS send called with similar payload
    const { send } = await import("@emailjs/browser");
    expect(send).toHaveBeenCalled();
    const sendArgs = (send as any).mock.calls[0][2];
    expect(sendArgs).toHaveProperty("name", "Test User");
    expect(sendArgs).toHaveProperty("email", "test@example.com");
    expect(sendArgs).toHaveProperty("phone", "123456");
    expect(sendArgs).toHaveProperty("message", "Hello there");
    expect(sendArgs).toHaveProperty("interest");

    // restore fetch
    global.fetch = originalFetch;
  });
});
