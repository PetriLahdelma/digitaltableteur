import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkIndexPage } from "./WorkIndexPage";

describe("WorkIndexPage", () => {
  it("renders page title", () => {
    render(<WorkIndexPage />);
    expect(screen.getByText(/workTitle/i)).toBeInTheDocument();
  });

  it("renders work examples", () => {
    render(<WorkIndexPage />);
    expect(screen.getByText(/Helsinki Design System/i)).toBeInTheDocument();
  });

  it("renders project cards", () => {
    render(<WorkIndexPage />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders project links", () => {
    render(<WorkIndexPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
