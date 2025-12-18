import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import ChatWidget from "../components/ChatWidget/ChatWidget";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

// Stub env vars for EmailJS
vi.stubGlobal("import.meta", {
  env: {
    VITE_EMAILJS_SERVICE_ID: "svc",
    VITE_EMAILJS_TEMPLATE_ID: "tpl",
    VITE_EMAILJS_PUBLIC_KEY: "pub",
  },
});

// Mock sendContactEmail service
vi.mock("@dt/ContactForm/contactEmailService", () => ({
  sendContactEmail: vi.fn(async () => Promise.resolve()),
}));

describe("Email workflow simple keyword trigger", () => {
  it("reveals email address and proceeds to success", async () => {
    render(withI18n(<ChatWidget />));

    // Open widget
    fireEvent.click(screen.getByRole("button"));

    // Simple keyword trigger (English variant). Must be standalone for regex anchor.
    const input = screen.getByLabelText(/Ask Donny/i);
    fireEvent.change(input, { target: { value: "email" } });
    fireEvent.submit(input.closest("form")!);

    // Wait for phrase injection (simple path)
    await waitFor(() => {
      expect(
        screen.getByText(/Our email is mail@digitaltableteur.com/i),
      ).toBeInTheDocument();
    });
    // Compose button may appear depending on initial state
    const composeBtn = screen.queryByRole("button", { name: /compose/i });
    if (composeBtn) fireEvent.click(composeBtn);

    // Full name
    const fullNameInput = screen.queryByLabelText(/full name/i);
    if (fullNameInput) {
      fireEvent.change(fullNameInput, { target: { value: "Simple Trigger" } });
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    }

    // Email field (label translated as 'Your email address')
    const emailInput = screen.queryByLabelText(/email/i);
    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: "simple@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    }

    // Skip optional phone
    const skipPhone = screen.queryByRole("button", { name: /skip/i });
    if (skipPhone) fireEvent.click(skipPhone);

    // Skip optional interest
    const skipInterest = screen.queryByRole("button", { name: /skip/i });
    if (skipInterest) fireEvent.click(skipInterest);

    // Message
    const messageArea = screen.queryByLabelText(/your message/i);
    if (messageArea) {
      fireEvent.change(messageArea, {
        target: { value: "Testing simple path." },
      });
      const nextBtn = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextBtn);
    }

    // Review & send
    // Disambiguate between workflow 'Send email' and composer 'Send message' icon-only button
    const sendBtn = await screen.findByRole("button", { name: /send email/i });
    fireEvent.click(sendBtn);

    // Success block
    await screen.findByTestId("email-workflow-success", {}, { timeout: 7000 });
    expect(screen.getByText(/email sent/i)).toBeInTheDocument();
  }, 15000);
});
