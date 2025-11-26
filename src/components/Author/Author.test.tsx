import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import Author from "./Author";

expect.extend(toHaveNoViolations);

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) => {
      if (key === "author.byline" && options?.name) {
        return `By ${options.name}`;
      }
      return key;
    },
    i18n: { language: "en" },
  }),
}));

describe("Author", () => {
  describe("Rendering", () => {
    it("renders author name correctly", () => {
      render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
      expect(screen.getByText("By John Doe")).toBeInTheDocument();
    });

    it("renders with default size", () => {
      render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
      const avatarImg = screen.getByRole("img");
      expect(avatarImg).toBeInTheDocument();
    });

    it("renders with custom size", () => {
      render(<Author name="John Doe" imageUrl="/test-image.jpg" size="4rem" />);
      const avatarImg = screen.getByRole("img");
      expect(avatarImg).toBeInTheDocument();
    });

    it("has correct container structure", () => {
      render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
      const container = screen.getByText("By John Doe").closest("div");
      expect(container?.className).toContain("authorContainer");
    });
  });

  describe("Props", () => {
    it("handles imageUrl as string", () => {
      render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
      expect(screen.getByText("By John Doe")).toBeInTheDocument();
    });

    it("handles imageUrl as object with default property", () => {
      const imageObj = { default: "/test-image.jpg" };
      render(<Author name="Jane Smith" imageUrl={imageObj} />);
      expect(screen.getByText("By Jane Smith")).toBeInTheDocument();
    });

    it("handles imageUrl as object with src property", () => {
      const imageObj = { src: "/test-image.jpg" };
      render(<Author name="Bob Johnson" imageUrl={imageObj} />);
      expect(screen.getByText("By Bob Johnson")).toBeInTheDocument();
    });

    it("handles missing imageUrl gracefully", () => {
      render(<Author name="No Image Author" />);
      expect(screen.getByText("By No Image Author")).toBeInTheDocument();
    });
  });

  describe("Profile Link", () => {
    it("renders as link when profileUrl is provided", () => {
      render(
        <Author
          name="John Doe"
          imageUrl="/test-image.jpg"
          profileUrl="/authors/john-doe"
        />,
      );
      const link = screen.getByRole("link", { name: "By John Doe" });
      expect(link).toHaveAttribute("href", "/authors/john-doe");
    });

    it("renders as plain text when profileUrl is not provided", () => {
      render(<Author name="Jane Smith" imageUrl="/test-image.jpg" />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("By Jane Smith")).toBeInTheDocument();
    });
  });

  describe("Internationalization", () => {
    it("uses translation key for byline", () => {
      render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
      // Verify translated text appears (mocked to return "By John Doe")
      expect(screen.getByText("By John Doe")).toBeInTheDocument();
    });

    it("interpolates name into translation", () => {
      render(<Author name="Alice Cooper" imageUrl="/test-image.jpg" />);
      expect(screen.getByText("By Alice Cooper")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(
        <Author name="John Doe" imageUrl="/test-image.jpg" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations with profile link", async () => {
      const { container } = render(
        <Author
          name="Jane Smith"
          imageUrl="/test-image.jpg"
          profileUrl="/authors/jane"
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("link has accessible name", () => {
      render(
        <Author
          name="John Doe"
          imageUrl="/test-image.jpg"
          profileUrl="/authors/john"
        />,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAccessibleName("By John Doe");
    });
  });
});
