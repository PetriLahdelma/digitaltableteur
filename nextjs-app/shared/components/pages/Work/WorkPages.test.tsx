import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { WorkIndexPage } from "./WorkIndex/WorkIndexPage";
import { NewThingsCoPage } from "./NewThingsCo/NewThingsCoPage";
import { GarageJunctionPage } from "./GarageJunction/GarageJunctionPage";
import { IllustrationsPage } from "./Illustrations/IllustrationsPage";
import { IntrumPage } from "./Intrum/IntrumPage";
import { RawViewPage } from "./RawView/RawViewPage";
import { TulliPage } from "./Tulli/TulliPage";
import { projects } from "../../../data/projects";

describe("Work pages", () => {
  it("renders work index with project links", () => {
    renderWithProviders(
      <WorkIndexPage nav={<div data-testid="work-nav">NAV</div>} />,
    );
    expect(screen.getByTestId("work-nav")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(projects.length);
  });

  it("renders New Things Co case study content", () => {
    renderWithProviders(<NewThingsCoPage nav={<div>Nav</div>} />);
    expect(
      screen.getByRole("heading", { name: /New Things Co/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders Garage Junction headings", () => {
    renderWithProviders(<GarageJunctionPage nav={<div>Nav</div>} />);
    expect(
      screen.getByRole("heading", { name: /Garage Junction/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders Illustrations page", () => {
    renderWithProviders(<IllustrationsPage nav={<div>Nav</div>} />);
    expect(
      screen.getByRole("heading", { name: /Illustrations/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("shows missing-project state for legacy Raw View slug", () => {
    renderWithProviders(<RawViewPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
  });

  it("shows missing-project state for legacy Tulli slug", () => {
    renderWithProviders(<TulliPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
  });

  it("shows missing-project state for legacy Intrum slug", () => {
    renderWithProviders(<IntrumPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
  });
});
