import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { WorkIndexPage } from "@dt/WorkIndex/WorkIndexPage";
import { NewThingsCoPage } from "@dt/NewThingsCo/NewThingsCoPage";
import { GarageJunctionPage } from "@dt/GarageJunction/GarageJunctionPage";
import { IllustrationsPage } from "@dt/Illustrations/IllustrationsPage";
import { RawViewPage } from "@dt/RawView/RawViewPage";
import { TulliPage } from "@dt/Tulli/TulliPage";
import { IntrumPage } from "@dt/Intrum/IntrumPage";
import { projects } from "../../../data/projects";

describe("Work pages", () => {
  it("renders work index with project links", () => {
    render(<WorkIndexPage nav={<div data-testid="work-nav">NAV</div>} />);
    expect(screen.getByTestId("work-nav")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(projects.length);
  });

  it("renders New Things Co case study content", () => {
    render(<NewThingsCoPage nav={<div>Nav</div>} />);
    expect(
      screen.getByRole("heading", { name: /New Things Co/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Branding/i)[0]).toBeInTheDocument();
  });

  it("renders Garage Junction headings", () => {
    render(<GarageJunctionPage nav={<div>Nav</div>} />);
    expect(
      screen.getByRole("heading", { name: /Garage Junction/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Research & Discovery/i)).toBeInTheDocument();
  });

  it("renders Illustrations page", () => {
    render(<IllustrationsPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Illustrations/i)).toBeInTheDocument();
  });

  it("renders Raw View page", () => {
    render(<RawViewPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Raw View/i)).toBeInTheDocument();
  });

  it("renders Tulli page", () => {
    render(<TulliPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Tulli/i)).toBeInTheDocument();
  });

  it("renders Intrum page", () => {
    render(<IntrumPage nav={<div>Nav</div>} />);
    expect(screen.getByText(/Intrum/i)).toBeInTheDocument();
  });
});
