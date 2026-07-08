import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ArticleCard from "@dt/ArticleCard";

expect.extend(toHaveNoViolations);

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

  it("hides read time when not provided", () => {
    const props = { ...defaultProps };
    delete props.readTime;
    render(<ArticleCard {...props} />);
    expect(screen.queryByText(/read$/i)).not.toBeInTheDocument();
  });

  it("shows read more text", () => {
    render(<ArticleCard {...defaultProps} />);

    expect(screen.getByText("Read article")).toBeInTheDocument();
  });

  it("renders skeletons when loading", () => {
    render(<ArticleCard {...defaultProps} loading />);
    expect(
      screen.getByRole("status", { name: /loading article title/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
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

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(<ArticleCard {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper link semantics", () => {
      render(<ArticleCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/test-article");
    });

    it("has proper heading hierarchy", () => {
      render(<ArticleCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });
});
