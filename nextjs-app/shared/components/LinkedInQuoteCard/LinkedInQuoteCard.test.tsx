import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import LinkedInQuoteCard from "./LinkedInQuoteCard";

expect.extend(toHaveNoViolations);

describe("LinkedInQuoteCard", () => {
  const defaultProps = {
    quote: "Systems protect consistency. People protect meaning.",
    name: "Petri Lahdelma",
    title: "Lead UX Designer",
    company: "Digitaltableteur",
  };

  it("renders the quote text", () => {
    render(<LinkedInQuoteCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.quote)).toBeInTheDocument();
  });

  it("renders the author name", () => {
    render(<LinkedInQuoteCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
  });

  it("renders the title and company", () => {
    render(<LinkedInQuoteCard {...defaultProps} />);
    expect(
      screen.getByText(`${defaultProps.title}, ${defaultProps.company}`)
    ).toBeInTheDocument();
  });

  it("renders connection degree when provided", () => {
    render(<LinkedInQuoteCard {...defaultProps} connectionDegree="1st" />);
    expect(screen.getByText("1st")).toBeInTheDocument();
  });

  it("renders avatar when avatarUrl is provided", () => {
    render(
      <LinkedInQuoteCard
        {...defaultProps}
        avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
      />
    );
    const avatar = screen.getByAltText(`Portrait of ${defaultProps.name}`);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute(
      "src",
      "/images/portfolio/helsinki-design-system/team/petri.png"
    );
  });

  it("renders placeholder when no avatar is provided", () => {
    render(<LinkedInQuoteCard {...defaultProps} />);
    expect(
      screen.queryByAltText(`Portrait of ${defaultProps.name}`)
    ).not.toBeInTheDocument();
  });

  it("renders LinkedIn link when linkedinUrl is provided", () => {
    render(
      <LinkedInQuoteCard
        {...defaultProps}
        linkedinUrl="https://linkedin.com/in/petrilahdelma"
      />
    );
    const link = screen.getByRole("link", {
      name: `View ${defaultProps.name}'s LinkedIn profile`,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://linkedin.com/in/petrilahdelma"
    );
  });

  it("does not render LinkedIn link when linkedinUrl is not provided", () => {
    render(<LinkedInQuoteCard {...defaultProps} />);
    expect(
      screen.queryByRole("link", {
        name: `View ${defaultProps.name}'s LinkedIn profile`,
      })
    ).not.toBeInTheDocument();
  });

  it("renders company logo when companyLogoUrl is provided", () => {
    render(
      <LinkedInQuoteCard {...defaultProps} companyLogoUrl="/dt-logo.svg" />
    );
    const logo = screen.getByAltText(`${defaultProps.company} logo`);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/dt-logo.svg");
  });

  it("applies custom className", () => {
    const { container } = render(
      <LinkedInQuoteCard {...defaultProps} className="custom-class" />
    );
    const card = container.querySelector("article");
    expect(card).toHaveClass("custom-class");
  });

  it("applies variant data attribute", () => {
    const { container } = render(
      <LinkedInQuoteCard {...defaultProps} variant="dark" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute("data-variant", "dark");
  });

  describe("accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(
        <LinkedInQuoteCard
          {...defaultProps}
          avatarUrl="/images/portfolio/helsinki-design-system/team/petri.png"
          linkedinUrl="https://linkedin.com/in/petrilahdelma"
          companyLogoUrl="/dt-logo.svg"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper aria-label on the card", () => {
      render(<LinkedInQuoteCard {...defaultProps} />);
      expect(
        screen.getByRole("article", {
          name: `LinkedIn post by ${defaultProps.name}`,
        })
      ).toBeInTheDocument();
    });

    it("uses semantic blockquote for the quote", () => {
      const { container } = render(<LinkedInQuoteCard {...defaultProps} />);
      const blockquote = container.querySelector("blockquote");
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveTextContent(defaultProps.quote);
    });
  });
});
