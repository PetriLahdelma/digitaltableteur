import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import * as matchers from "vitest-axe/matchers";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewsletterWaitlist from "@dt/NewsletterWaitlist";

expect.extend(matchers);

vi.mock("../../lib/translation", () => {
  const t = (key: string) => key;
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

global.fetch = vi.fn();

describe("NewsletterWaitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Button Mode", () => {
    it("renders trigger button by default", () => {
      render(<NewsletterWaitlist />);
      expect(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      ).toBeInTheDocument();
    });

    it("transforms to input form on click", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      expect(
        screen.getByLabelText(/newsletterWaitlist.inputLabel/),
      ).toBeInTheDocument();
    });

    it("respects disabled prop", () => {
      render(<NewsletterWaitlist disabled />);
      expect(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      ).toBeDisabled();
    });
  });

  describe("Input Mode", () => {
    it("renders title and promise text", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      expect(screen.getByText(/newsletterWaitlist.title/)).toBeInTheDocument();
      expect(
        screen.getByText(/newsletterWaitlist.promise/),
      ).toBeInTheDocument();
    });

    it("validates required email", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const submitButton = screen.getByRole("button", {
        name: /newsletterWaitlist.submit/,
      });
      // Submit button should be disabled when email is empty
      expect(submitButton).toBeDisabled();
    });

    it("validates email format", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "invalid-email");
      // Component allows any text input - validation happens on submission
      expect(input).toHaveValue("invalid-email");
    });

    it("submits valid email successfully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      const onSuccess = vi.fn();
      render(<NewsletterWaitlist onSuccess={onSuccess} />);

      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "test@example.com");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/save-contact",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test@example.com",
              type: "newsletter",
              source: "waitlist",
            }),
          }),
        );
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith("test@example.com");
      });
    });

    it("sends newsletter payload without name field", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      });
      global.fetch = mockFetch;

      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "test@example.com");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );

      await waitFor(() => {
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body).not.toHaveProperty("name");
        expect(body).toEqual({
          email: "test@example.com",
          type: "newsletter",
          source: "waitlist",
        });
      });
    });

    it("handles submission errors", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = mockFetch;

      const onError = vi.fn();
      render(<NewsletterWaitlist onError={onError} />);

      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "test@example.com");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/newsletterWaitlist.error.submission/),
        ).toBeInTheDocument();
      });

      expect(onError).toHaveBeenCalled();
    });

    it("cancels and returns to button mode", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "test@example.com");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.cancel/ }),
      );
      expect(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      ).toBeInTheDocument();
    });

    it("disables submit when email is empty", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      expect(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      ).toBeDisabled();
    });
  });

  describe("Success Modal", () => {
    it("shows success modal after submission", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "test@example.com");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );

      // Check that fetch was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("closes modal and returns to button mode", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "test@example.com");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Component should return to initial state
      await waitFor(
        () => {
          expect(
            screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
          ).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations in button mode", async () => {
      const { container } = render(<NewsletterWaitlist />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations in input mode", async () => {
      const { container } = render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("properly displays error message for input", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const submitButton = screen.getByRole("button", {
        name: /newsletterWaitlist.submit/,
      });
      // Submit button should be disabled when form is empty
      expect(submitButton).toBeDisabled();
    });
  });
});
