import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock emailjs send
vi.mock("@emailjs/browser", () => ({
  send: vi.fn(() => Promise.resolve({ status: 200 })),
}));

import ContactForm from "./ContactForm";

describe("ContactForm integration", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;

    // Clear all mocks to ensure fresh state
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => ({}) }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const defaultFormValues = {
    fullName: "Test User",
    email: "test@example.com",
    phone: "123456",
    message: "Hello there",
  };

  const submitContactForm = async (
    overrides: Partial<typeof defaultFormValues> = {},
  ) => {
    render(<ContactForm />);

    const values = { ...defaultFormValues, ...overrides };

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: values.fullName },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: values.email },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: values.phone },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { value: values.message },
    });

    const interestCheckboxes = screen.getAllByRole("checkbox");
    if (interestCheckboxes.length > 1) {
      fireEvent.click(interestCheckboxes[1]);
    } else if (interestCheckboxes.length === 1) {
      fireEvent.click(interestCheckboxes[0]);
    }

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const fetchMock = global.fetch as unknown as vi.Mock;
    const fetchCall = fetchMock.mock.calls[0];
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

    const { send } = await import("@emailjs/browser");
    const sendArgs = (send as unknown as vi.Mock).mock.calls[0][2];

    return { values, fetchBody, sendArgs };
  };

  it("submits correct payload to fetch and EmailJS", async () => {
    const { fetchBody, sendArgs } = await submitContactForm();

    expect(fetchBody).toMatchObject({
      name: defaultFormValues.fullName,
      email: defaultFormValues.email,
      phone: defaultFormValues.phone,
      message: defaultFormValues.message,
      attachmentName: null,
      attachmentType: null,
      attachmentSize: null,
      attachmentData: null,
    });

    expect(sendArgs).toMatchObject({
      name: defaultFormValues.fullName,
      email: defaultFormValues.email,
      phone: defaultFormValues.phone,
      message: defaultFormValues.message,
      attachmentName: "",
      attachmentType: "",
      attachmentSize: "",
      attachmentData: "",
      attachmentNotice: "",
    });
  });

  it("allows overriding values via helper to test different payloads", async () => {
    const overrides = {
      fullName: "Automation Bot",
      email: "bot@example.com",
      phone: "+358-555-000",
      message: "Automated message",
    };

    const { fetchBody, sendArgs } = await submitContactForm(overrides);

    expect(fetchBody).toMatchObject({
      name: overrides.fullName,
      email: overrides.email,
      phone: overrides.phone,
      message: overrides.message,
    });

    expect(sendArgs).toMatchObject({
      name: overrides.fullName,
      email: overrides.email,
      phone: overrides.phone,
      message: overrides.message,
    });
  });
});
