import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ArticleCard from "./ArticleCard";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        blogRead: "read",
        blogReadMore: "Read more",
      };
      return translations[key] || key;
    },
  }),
}));

describe("ArticleCard", () => {
  const defaultProps = {
    title: "Test Article Title",
    lead: "This is a test article lead paragraph.",
    link: "/test-article",
    readTime: "5 min read",
  };

  it("renders article title", () => {
    render(<ArticleCard {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Test Article Title",
    );
  });

  it("renders article lead when provided", () => {
    render(<ArticleCard {...defaultProps} />);

    expect(
      screen.getByText("This is a test article lead paragraph."),
    ).toBeInTheDocument();
  });

  it("does not render lead when not provided", () => {
    const { lead, ...propsWithoutLead } = defaultProps;
    render(<ArticleCard {...propsWithoutLead} />);

    expect(
      screen.queryByText("This is a test article lead paragraph."),
    ).not.toBeInTheDocument();
  });

  it("creates correct link with href", () => {
    render(<ArticleCard {...defaultProps} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test-article");
  });

  it("translates read time correctly", () => {
    render(<ArticleCard {...defaultProps} />);

    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });

  it("handles read time without translation pattern", () => {
    const props = { ...defaultProps, readTime: "Quick read" };
    render(<ArticleCard {...props} />);

    expect(screen.getByText("Quick read")).toBeInTheDocument();
  });

  it("shows read more text", () => {
    render(<ArticleCard {...defaultProps} />);

    expect(screen.getByText("Read more")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const props = { ...defaultProps, className: "custom-class" };
    render(<ArticleCard {...props} />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
  });

  it("handles case insensitive read time pattern", () => {
    const props = { ...defaultProps, readTime: "3 Min READ" };
    render(<ArticleCard {...props} />);

    expect(screen.getByText("3 min read")).toBeInTheDocument();
  });
});
