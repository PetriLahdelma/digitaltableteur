import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { EnhancedProjectCard } from "./EnhancedProjectCard";

expect.extend(toHaveNoViolations);

const baseProps = {
  title: "SAP Build Apps Design System",
  slug: "sap-build-apps",
  thumbnail: "/images/portfolio/sap-build-apps/icon.png",
  category: "Design Systems",
  description: "Tokens, components, and governance that scale with your product.",
  tags: ["Enterprise", "Low-Code"],
};

describe("EnhancedProjectCard", () => {
  it("renders the title as a level-3 heading", () => {
    render(<EnhancedProjectCard {...baseProps} />);
    expect(
      screen.getByRole("heading", { level: 3, name: baseProps.title }),
    ).toBeInTheDocument();
  });

  it("renders the whole card as a link to the project detail page", () => {
    render(<EnhancedProjectCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/work/sap-build-apps");
  });

  it("exposes category, description, and tags to assistive tech via aria-describedby", () => {
    render(<EnhancedProjectCard {...baseProps} />);
    const link = screen.getByRole("link");
    const describedBy = link.getAttribute("aria-describedby");
    expect(describedBy).toBe(`${baseProps.slug}-desc`);
    const description = document.getElementById(describedBy as string);
    expect(description).toHaveTextContent(/Category: Design Systems/);
    expect(description).toHaveTextContent(/Tags: Enterprise, Low-Code/);
  });

  it("marks the thumbnail image as decorative (empty alt)", () => {
    const { container } = render(<EnhancedProjectCard {...baseProps} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
  });

  it("does not hide image assets behind load-state opacity", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "EnhancedProjectCard.tsx"), "utf8");
    const css = readFileSync(
      join(here, "EnhancedProjectCard.module.css"),
      "utf8",
    );

    expect(source).not.toContain("assetLoading");
    expect(source).not.toContain("imageLoaded");
    expect(source).not.toContain("styles.skeleton");
    expect(css).not.toMatch(/\.assetLoading\b/);
    expect(css).not.toMatch(/\.skeleton\b/);
  });

  it("ships an aspect-ratio class per variant and guards motion under reduced-motion", () => {
    // The CSS Module carries the styling axes and a full reduced-motion guard.
    // Assert the source so neither can silently rot behind the vitest CSS proxy.
    const here = dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(
      join(here, "EnhancedProjectCard.module.css"),
      "utf8",
    );
    for (const cls of ["square", "video", "portrait", "landscape"]) {
      expect(css).toMatch(new RegExp(`\\.${cls}\\b`));
    }
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<EnhancedProjectCard {...baseProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders comingSoon as a non-interactive card with the badge", () => {
    render(
      <EnhancedProjectCard
        {...baseProps}
        comingSoon
        comingSoonLabel="Coming soon"
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: baseProps.title, level: 3 }),
    ).toBeInTheDocument();
  });

  it("comingSoon card has no axe violations", async () => {
    const { container } = render(
      <EnhancedProjectCard {...baseProps} comingSoon />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
