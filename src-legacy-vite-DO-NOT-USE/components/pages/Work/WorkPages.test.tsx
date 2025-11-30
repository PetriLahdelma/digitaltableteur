import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { WorkIndexPage } from "./WorkIndex/WorkIndexPage";
import { NewThingsCoPage } from "./NewThingsCo/NewThingsCoPage";
import { GarageJunctionPage } from "./GarageJunction/GarageJunctionPage";
import { IllustrationsPage } from "./Illustrations/IllustrationsPage";

describe("Work pages", () => {
  it("renders work index with project links", () => {
    render(<WorkIndexPage nav={<div data-testid="work-nav">NAV</div>} />);
    expect(screen.getByTestId("work-nav")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /project details/i }),
    ).toHaveLength(3);
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
});
