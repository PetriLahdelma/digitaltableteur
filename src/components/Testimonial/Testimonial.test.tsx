import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Testimonial from "./Testimonial";

describe("Testimonial", () => {
  const defaultProps = {
    quote: "This is a test testimonial quote.",
    name: "John Doe",
    title: "Software Engineer",
    company: "Tech Company",
  };

  it("renders testimonial quote correctly", () => {
    render(<Testimonial {...defaultProps} />);
    expect(
      screen.getByText(/this is a test testimonial quote/i),
    ).toBeInTheDocument();
  });

  it("renders author information correctly", () => {
    render(<Testimonial {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Software Engineer • Tech Company"),
    ).toBeInTheDocument();
  });

  it("renders LinkedIn link when provided", () => {
    const propsWithLinkedIn = {
      ...defaultProps,
      linkedinUrl: "https://linkedin.com/in/johndoe",
    };
    render(<Testimonial {...propsWithLinkedIn} />);

    const linkedinLink = screen.getByRole("link", {
      name: /view john doe's linkedin profile/i,
    });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://linkedin.com/in/johndoe",
    );
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render LinkedIn link when not provided", () => {
    render(<Testimonial {...defaultProps} />);
    expect(screen.queryByLabelText(/linkedin/i)).not.toBeInTheDocument();
  });

  it("renders avatar when provided", () => {
    const propsWithAvatar = {
      ...defaultProps,
      avatarUrl: "/test-avatar.jpg",
    };
    render(<Testimonial {...propsWithAvatar} />);

    const avatar = screen.getByRole("img", { name: "Portrait of John Doe" });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "/test-avatar.jpg");
    expect(avatar).toHaveAttribute("loading", "lazy");
  });

  it("does not render avatar when not provided", () => {
    render(<Testimonial {...defaultProps} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <Testimonial {...defaultProps} className="custom-testimonial" />,
    );
    const testimonialElement = container.querySelector(".custom-testimonial");
    expect(testimonialElement).toBeInTheDocument();
  });

  it("renders blockquote element with proper structure", () => {
    render(<Testimonial {...defaultProps} />);
    const blockquote = screen.getByRole("blockquote");
    expect(blockquote).toBeInTheDocument();
  });
});
