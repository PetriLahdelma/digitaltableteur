import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

// Mock emailjs send
vi.mock("@emailjs/browser", () => ({
  send: vi.fn(() => Promise.resolve({ status: 200 })),
}));

import ContactForm from "./ContactForm";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("ContactForm integration", () => {
  let originalFetch: typeof global.fetch;
  const originalEnv = { ...process.env };
  const originalImportEnv = { ...(import.meta as any).env };

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
    Object.assign(process.env, originalEnv);
    (import.meta as any).env = { ...originalImportEnv };
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
    render(withI18n(<ContactForm />));

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

    const fetchMock = global.fetch as jest.Mock;
    const fetchCall = fetchMock.mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);

    const { send } = await import("@emailjs/browser");
    const sendArgs = (send as jest.Mock).mock.calls[0][2];

    return { values, fetchBody, sendArgs };
  };

  it("submits correct payload to fetch and EmailJS", async () => {
    const { fetchBody, sendArgs } = await submitContactForm();

    expect(fetchBody).toMatchObject({
      name: defaultFormValues.fullName,
      email: defaultFormValues.email,
      phone: defaultFormValues.phone,
      message: defaultFormValues.message,
      interest: expect.any(String),
      hearAbout: "",
    });
    expect(fetchBody).toHaveProperty("time");

    expect(sendArgs).toMatchObject({
      name: defaultFormValues.fullName,
      email: defaultFormValues.email,
      phone: defaultFormValues.phone,
      message: defaultFormValues.message,
      interest: expect.any(String),
      hearAbout: "",
    });
    expect(sendArgs).toHaveProperty("time");
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
      interest: expect.any(String),
      hearAbout: "",
    });
  });

  it("clears user input when the clear button is pressed", () => {
    render(withI18n(<ContactForm />));

    const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email Address/i);
    const messageInput = screen.getByLabelText(/Your Message/i);

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Hi!" } });

    const clearButton = screen.getByRole("button", { name: /Clear fields/i });
    fireEvent.click(clearButton);

    expect(nameInput.value).toBe("");
    expect((emailInput as HTMLInputElement).value).toBe("");
    expect((messageInput as HTMLInputElement).value).toBe("");
  });

  it("shows validation errors for required fields", async () => {
    render(withI18n(<ContactForm />));

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    // Validation should prevent submission when required fields are empty.
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("shows validation error for invalid email", async () => {
    render(withI18n(<ContactForm />));

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { value: "Hello" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    expect(
      await screen.findByText(/Please enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it("handles attachment read error gracefully", async () => {
    const originalFileReader = global.FileReader;
    class ErrorFileReader {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        this.onerror?.();
      }
    }
    // @ts-expect-error override
    global.FileReader = ErrorFileReader;

    render(withI18n(<ContactForm />));
    const badFile = new File(["fail"], "bad.bin", { type: "application/bin" });
    const fileInput = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      await screen.findByText(/We couldn't read that file/i),
    ).toBeInTheDocument();
    global.FileReader = originalFileReader;
  });

  it("drops honeypot submissions and logs via beacon when configured", async () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
    });
    process.env.NEXT_PUBLIC_APP_CONTACT_SPAM_LOG_ENDPOINT =
      "https://spam.test/honeypot";

    render(withI18n(<ContactForm />));
    fireEvent.change(screen.getByLabelText(/please leave this field blank/i), {
      target: { value: "bot payload" },
    });

    const form = screen
      .getByRole("button", { name: /Submit/i })
      .closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(sendBeacon).toHaveBeenCalledWith(
        "https://spam.test/honeypot",
        expect.any(Blob),
      );
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows email attachment limit notice for large files", async () => {
    const onload = vi.fn();
    const originalFileReader = global.FileReader;
    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      onload: (() => void) | null = onload;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        this.result = "data:mock/base64";
        this.onload?.();
      }
    }
    // @ts-expect-error override for test
    global.FileReader = MockFileReader;

    render(withI18n(<ContactForm />));

    const largeFile = new File(["x".repeat(50_000)], "large.pdf", {
      type: "application/pdf",
    });
    const fileInput = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(await screen.findByText(/files over/i)).toBeInTheDocument();
    global.FileReader = originalFileReader;
  });

  it("shows error modal when EmailJS send fails", async () => {
    const { send } = await import("@emailjs/browser");
    (send as unknown as vi.Mock).mockRejectedValueOnce(new Error("fail"));

    render(withI18n(<ContactForm />));

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { value: "Hello" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() =>
      expect(screen.getByText(/Failed to send message/i)).toBeInTheDocument(),
    );
  });
});
