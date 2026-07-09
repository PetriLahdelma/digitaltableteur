import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { CTASection } from "./CTASection";
import styles from "./CTASection.module.css";

expect.extend(toHaveNoViolations);

describe("CTASection", () => {
  const baseProps = {
    title: "Ready to start?",
    primaryAction: { label: "Get in touch", href: "/contact" },
  };

  it("renders the title as a heading that labels the section", () => {
    const { container } = render(<CTASection {...baseProps} />);
    const heading = screen.getByRole("heading", { name: "Ready to start?" });
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", heading.id);
  });

  it("renders the description when provided", () => {
    render(<CTASection {...baseProps} description="We reply within a day." />);
    expect(screen.getByText("We reply within a day.")).toBeInTheDocument();
  });

  it("renders the primary action as a link when href is set", () => {
    render(<CTASection {...baseProps} />);
    const link = screen.getByRole("link", { name: "Get in touch" });
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("renders a secondary action button and fires its click handler", async () => {
    const onClick = vi.fn();
    render(
      <CTASection
        {...baseProps}
        secondaryAction={{ label: "See our work", onClick }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "See our work" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("uses the custom id for the section and heading label", () => {
    const { container } = render(<CTASection {...baseProps} id="hire-us" />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "hire-us");
    expect(section).toHaveAttribute("aria-labelledby", "hire-us-title");
  });

  it("applies the brand background class and skips the texture overlay", () => {
    const { container } = render(
      <CTASection {...baseProps} background="brand" />,
    );
    expect(container.querySelector(`.${styles.brandBackground}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.textureOverlay}`)).not.toBeInTheDocument();
  });

  it("renders the texture overlay on non-brand backgrounds", () => {
    const { container } = render(<CTASection {...baseProps} />);
    expect(container.querySelector(`.${styles.textureOverlay}`)).toBeInTheDocument();
  });

  it("applies custom className to the section", () => {
    const { container } = render(
      <CTASection {...baseProps} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <CTASection
        {...baseProps}
        description="We reply within a day."
        secondaryAction={{ label: "See our work", href: "/work" }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
