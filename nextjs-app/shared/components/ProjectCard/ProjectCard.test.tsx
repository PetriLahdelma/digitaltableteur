import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProjectCard } from "./ProjectCard";

expect.extend(toHaveNoViolations);

const baseProps = {
  title: "Helsinki Design System",
  slug: "helsinki-design-system",
  thumbnail: "/images/portfolio/hds.jpg",
};

describe("ProjectCard", () => {
  it("links to the project detail page", () => {
    render(<ProjectCard {...baseProps} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/work/helsinki-design-system",
    );
  });

  it("renders the title as a heading and the thumbnail as decorative", () => {
    render(<ProjectCard {...baseProps} />);
    expect(
      screen.getByRole("heading", { name: "Helsinki Design System" }),
    ).toBeInTheDocument();
    // alt="" — a named image would duplicate the visible title in the
    // accessible name (axe image-redundant-alt).
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders category and up to three tags", () => {
    render(
      <ProjectCard
        {...baseProps}
        category="Design systems"
        tags={["Figma", "React", "Tokens", "Ignored"]}
      />,
    );
    expect(screen.getByText("Design systems")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
    expect(screen.getByText("Tokens")).toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
  });

  it("supports the below title position", () => {
    render(<ProjectCard {...baseProps} titlePosition="below" />);
    expect(
      screen.getByRole("heading", { name: "Helsinki Design System" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations (overlay)", async () => {
    const { container } = render(
      <ProjectCard {...baseProps} category="Design systems" tags={["Figma"]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (below)", async () => {
    const { container } = render(
      <ProjectCard {...baseProps} titlePosition="below" category="Design systems" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
