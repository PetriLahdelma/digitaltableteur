import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  it("renders hero title", () => {
    renderWithProviders(<AboutPage />);
    expect(
      screen.getAllByText(/What we do/i).length,
    ).toBeGreaterThan(0);
  });

  it("renders manifesto section", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/Digitaltableteur is/i)).toBeInTheDocument();
  });

  it("renders manifesto phrases", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/No-Fluff Thinking/i)).toBeInTheDocument();
  });

  it("renders values section", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/What we bring/i)).toBeInTheDocument();
  });
});
