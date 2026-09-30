import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { ContactFormEditorial } from "./ContactFormEditorial";

const { showToastMock } = vi.hoisted(() => ({ showToastMock: vi.fn() }));

expect.extend(toHaveNoViolations);

// Mock the package adapter runtimes, not the app's i18next/router.
vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string | Record<string, unknown>) =>
    typeof fallback === "string" ? fallback : key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

vi.mock("../../lib/navigation", async () => {
  const actual = await vi.importActual<object>("../../lib/navigation");
  return {
    ...actual,
    useNavigationSearchParams: () => new URLSearchParams(),
  };
});

vi.mock("../../lib/toast", async () => {
  const actual = await vi.importActual<object>("../../lib/toast");
  return {
    ...actual,
    useToast: () => ({ showToast: showToastMock }),
  };
});

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

describe("ContactFormEditorial", () => {
  it("renders the core contact fields", () => {
    render(<ContactFormEditorial />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByRole("button", { name: /send|submit/i }),
    ).toBeInTheDocument();
  });

  it("appends a custom className", () => {
    const { container } = render(
      <ContactFormEditorial className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContactFormEditorial />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);

  it("allows an invalid submit attempt, reports every error, and focuses the first field", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ContactFormEditorial />);

    const submit = screen.getByRole("button", { name: /send|submit/i });
    expect(submit).toBeEnabled();
    await user.click(submit);

    const name = screen.getByLabelText(/contactFullName/);
    const email = screen.getByLabelText(/^contactEmail/);
    const message = screen.getByLabelText(/^contactMessage/);
    await waitFor(() => expect(name).toHaveFocus());
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(message).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("contactValidationEmailRequired");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("associates a useful typo suggestion without rejecting a valid address", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    render(<ContactFormEditorial />);
    const email = screen.getByLabelText(/^contactEmail/);

    await user.type(email, "hello@gmial.com");
    await user.tab();

    expect(email).toHaveAttribute("aria-invalid", "false");
    expect(email).toHaveAccessibleDescription(
      "contactValidationEmailSuggestion",
    );

    await user.type(screen.getByLabelText(/contactFullName/), "Test Person");
    await user.type(screen.getByLabelText(/^contactMessage/), "Hello there");
    await user.click(screen.getByRole("button", { name: /send|submit/i }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    fetchSpy.mockRestore();
  });

  it("keeps an invalid email format associated with its error message", async () => {
    const user = userEvent.setup();
    render(<ContactFormEditorial />);
    const email = screen.getByLabelText(/^contactEmail/);

    await user.type(email, "not-an-email");
    await user.tab();

    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(
      "contactValidationEmailInvalid",
    );
  });

  it("uses custom accessible validation rather than native browser bubbles", () => {
    const { container } = render(<ContactFormEditorial />);
    expect(container.querySelector("form")).toHaveAttribute("novalidate");
  });

  it("shows an error toast and keeps input when submission fails", async () => {
    showToastMock.mockClear();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 500 }));
    const onError = vi.fn();
    const user = userEvent.setup();

    render(<ContactFormEditorial onError={onError} />);
    await user.type(screen.getByLabelText(/contactFullName/), "Test Person");
    await user.type(screen.getByLabelText(/^contactEmail/), "test@example.com");
    await user.type(screen.getByLabelText(/^contactMessage/), "Hello there");
    await user.click(screen.getByRole("button", { name: /send|submit/i }));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        "contactErrorMessage",
        expect.objectContaining({ tone: "error" }),
      );
    });
    expect(onError).toHaveBeenCalled();
    // The visitor's draft must survive a failed submit.
    expect(screen.getByLabelText(/^contactMessage/)).toHaveValue("Hello there");

    fetchSpy.mockRestore();
    consoleError.mockRestore();
  }, 30_000);
});
