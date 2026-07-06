import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { WorkGrid } from "./WorkGrid";
import { projects } from "../../data/projects";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const sample = projects.slice(0, 3);

describe("WorkGrid", () => {
  it("renders a labelled list with one item per project", () => {
    render(<WorkGrid projects={sample} animateItems={false} />);
    const list = screen.getByRole("list", { name: "Project gallery" });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders each project title as a heading", () => {
    render(<WorkGrid projects={sample} animateItems={false} />);
    expect(
      screen.getByRole("heading", { name: sample[0].title }),
    ).toBeInTheDocument();
  });

  it("shows a helpful empty state when there are no projects", () => {
    render(<WorkGrid projects={[]} />);
    expect(
      screen.getByRole("heading", { name: "No projects found" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <WorkGrid projects={sample} animateItems={false} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the empty state", async () => {
    const { container } = render(<WorkGrid projects={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
