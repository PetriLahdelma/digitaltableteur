import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import PersonCard from "./PersonCard";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

const baseProps = {
  imageSrc: "/portrait.jpg",
  imageAlt: "Portrait",
  name: "Test User",
  title: "Role",
  email: "test@example.com",
};

describe("PersonCard", () => {
  it("renders person details", () => {
    render(<PersonCard {...baseProps} />);
    expect(screen.getByRole("img", { name: /portrait/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /test user/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /test@example.com/i }),
    ).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("renders skeletons when loading", () => {
    render(<PersonCard {...baseProps} loading />);
    expect(
      screen.getByRole("status", { name: /personCard.loadingAvatar/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PersonCard {...baseProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
