import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import * as matchers from "vitest-axe/matchers";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewsletterWaitlist from "./NewsletterWaitlist";

expect.extend(matchers);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

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
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );
      expect(
        screen.getByText(/newsletterWaitlist.validation.required/),
      ).toBeInTheDocument();
    });

    it("validates email format", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      await userEvent.type(input, "invalid-email");
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );
      expect(
        screen.getByText(/newsletterWaitlist.validation.invalid/),
      ).toBeInTheDocument();
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

      await waitFor(() => {
        expect(
          screen.getByText(/newsletterWaitlist.success.title/),
        ).toBeInTheDocument();
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

      await waitFor(() => {
        expect(
          screen.getByText(/newsletterWaitlist.success.title/),
        ).toBeInTheDocument();
      });

      await userEvent.click(
        screen.getByRole("button", {
          name: /newsletterWaitlist.success.close/,
        }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
        ).toBeInTheDocument();
      });
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

    it("properly associates error message with input", async () => {
      render(<NewsletterWaitlist />);
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.trigger/ }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: /newsletterWaitlist.submit/ }),
      );
      const input = screen.getByLabelText(/newsletterWaitlist.inputLabel/);
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "newsletter-error");
    });
  });
});
