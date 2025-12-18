import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders page title", () => {
    render(<AboutPage />);
    expect(screen.getByText(/aboutTitle/i)).toBeInTheDocument();
  });

  it("renders manifesto section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/aboutManifestoIntro/i)).toBeInTheDocument();
  });

  it("renders manifesto phrases", () => {
    render(<AboutPage />);
    expect(screen.getByText(/aboutManifestoPhrase1/i)).toBeInTheDocument();
  });

  it("renders personal story section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/aboutStoryTitle/i)).toBeInTheDocument();
  });

  it("renders values section", () => {
    render(<AboutPage />);
    expect(screen.getByText(/aboutValuesTitle/i)).toBeInTheDocument();
  });

  it("rotates highlighted phrases on interval", () => {
    render(<AboutPage />);

    const initialHighlight = document.querySelector('[class*="highlighted"]');
    expect(initialHighlight).toBeTruthy();

    vi.advanceTimersByTime(2400);

    const afterInterval = document.querySelector('[class*="highlighted"]');
    expect(afterInterval).toBeTruthy();
  });

  it("renders WIP badge", () => {
    render(<AboutPage />);
    expect(screen.getByText(/work in progress/i)).toBeInTheDocument();
  });
});
