import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWidget from "../components/ChatWidget/ChatWidget";

// Mock EmailJS service env credentials
vi.stubGlobal("import.meta", {
  env: {
    VITE_EMAILJS_SERVICE_ID: "svc",
    VITE_EMAILJS_TEMPLATE_ID: "tpl",
    VITE_EMAILJS_PUBLIC_KEY: "pub",
  },
});

// Mock sendContactEmail by mocking the module
vi.mock("@dt/ContactForm/contactEmailService", () => ({
  sendContactEmail: vi.fn(async () => Promise.resolve()),
}));

describe("Email workflow integration", () => {
  it("walks through compose to success", async () => {
    render(<ChatWidget />);

    // Open widget
    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);

    // User triggers workflow (general send email scenario)
    const input = screen.getByLabelText(/Ask Donny/i);
    fireEvent.change(input, { target: { value: "Send email" } });
    fireEvent.submit(input.closest("form")!);

    // Wait until either compose button OR a later workflow step appears
    await waitFor(() => {
      const compose = screen.queryByRole("button", { name: /compose/i });
      const anyStep = document.querySelector(
        "[data-step='collectingFullName'], [data-step='collectingEmail'], [data-step='collectingMessage'], [data-step='review']",
      );
      if (!compose && !anyStep) throw new Error("workflow not yet visible");
    });
    // Assert assistant phrase injection for general send case
    await waitFor(() => {
      expect(
        screen.getByText(/Sure thing! Let's send an email!/i),
      ).toBeInTheDocument();
    });
    const composeBtn = screen.queryByRole("button", { name: /compose/i });
    if (composeBtn) fireEvent.click(composeBtn);

    // Full name
    const fullNameInput = screen.queryByLabelText(/full name/i);
    if (fullNameInput) {
      fireEvent.change(fullNameInput, {
        target: { value: "Integration Tester" },
      });
      const nextBtn = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextBtn);
    }

    // Email
    const emailInput = screen.queryByLabelText(/email/i);
    if (emailInput) {
      fireEvent.change(emailInput, {
        target: { value: "integration@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    }

    // Phone (skip)
    const skipPhone = screen.queryByRole("button", { name: /skip/i });
    if (skipPhone) fireEvent.click(skipPhone);

    // Interest (skip)
    const skipInterest = screen.queryByRole("button", { name: /skip/i });
    if (skipInterest) fireEvent.click(skipInterest);

    // Message (workflow textarea labeled 'Your message' and inside workflow block)
    const messageArea = screen.queryByLabelText(/your message/i);
    if (messageArea) {
      fireEvent.change(messageArea, {
        target: { value: "This is a test message." },
      });
      const nextBtn = screen.queryByRole("button", { name: /next/i });
      if (nextBtn) fireEvent.click(nextBtn);
    }

    // Review & send
    const sendBtn = await screen.findByRole("button", { name: /send email/i });
    fireEvent.click(sendBtn);

    // Sending then success
    // Either sending appears briefly or success renders quickly; wait for success container
    const successBlock = await screen
      .findByTestId("email-workflow-success", {}, { timeout: 7000 })
      .catch(async () => {
        // Fallback: query by heading text without exclamation (localized title)
        await waitFor(() => screen.getByText(/email sent/i), { timeout: 7000 });
        return null;
      });
    const successHeading = screen.getByText(/email sent/i);
    expect(successHeading).toBeInTheDocument();
  }, 15000);
});
