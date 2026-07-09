import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { WorkPreviewSection, type ProjectItem } from "./WorkPreviewSection";

expect.extend(toHaveNoViolations);

// Mock the package translation adapter, not the app's i18next runtime.
vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string) => fallback ?? key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

const projects: ProjectItem[] = [
  {
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/sap.jpg",
    category: "Design Systems",
    tags: ["Enterprise"],
  },
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/hds.jpg",
    category: "Accessibility",
    tags: ["Public sector"],
  },
  {
    title: "Illustrations",
    slug: "illustrations",
    thumbnail: "/images/illustrations.jpg",
  },
];

describe("WorkPreviewSection", () => {
  it("labels the section with the title heading", () => {
    const { container } = render(
      <WorkPreviewSection title="Selected work" projects={projects} />,
    );
    const heading = screen.getByRole("heading", { name: "Selected work" });
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", heading.id);
  });

  it("omits aria-labelledby without a title", () => {
    const { container } = render(<WorkPreviewSection projects={projects} />);
    expect(container.querySelector("section")).not.toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("renders every project in the default grid layout", () => {
    render(<WorkPreviewSection projects={projects} />);
    for (const project of projects) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  it("caps the asymmetric layout at three projects (1 featured + 2)", () => {
    const four = [
      ...projects,
      { title: "Fourth", slug: "fourth", thumbnail: "/4.jpg" },
    ];
    render(<WorkPreviewSection projects={four} layout="asymmetric" />);
    expect(screen.getByText("SAP Build Apps Design System")).toBeInTheDocument();
    expect(screen.getByText("Helsinki Design System")).toBeInTheDocument();
    expect(screen.getByText("Illustrations")).toBeInTheDocument();
    expect(screen.queryByText("Fourth")).not.toBeInTheDocument();
  });

  it("caps the featured layout at three projects", () => {
    const four = [
      ...projects,
      { title: "Fourth", slug: "fourth", thumbnail: "/4.jpg" },
    ];
    render(<WorkPreviewSection projects={four} layout="featured" />);
    expect(screen.queryByText("Fourth")).not.toBeInTheDocument();
  });

  it("renders /work view-all links when enabled and none when disabled", () => {
    const { rerender } = render(<WorkPreviewSection projects={projects} />);
    const viewAll = screen
      .getAllByRole("link", { name: /View all work/i })
      .map((link) => link.getAttribute("href"));
    expect(viewAll.length).toBeGreaterThan(0);
    for (const href of viewAll) expect(href).toBe("/work");

    rerender(<WorkPreviewSection projects={projects} showViewAll={false} />);
    expect(
      screen.queryByRole("link", { name: /View all work/i }),
    ).not.toBeInTheDocument();
  });

  it("uses the custom section id", () => {
    const { container } = render(
      <WorkPreviewSection projects={projects} id="portfolio" />,
    );
    expect(container.querySelector("section")).toHaveAttribute(
      "id",
      "portfolio",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <WorkPreviewSection title="Selected work" projects={projects} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
