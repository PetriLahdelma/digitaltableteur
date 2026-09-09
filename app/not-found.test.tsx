import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import en from "@/nextjs-app/shared/locales/en/translation.json";
import NotFound from "./not-found";

// Resolve against the real English catalogue rather than a hand-written map:
// this asserts the copy actually reaches the DOM *and* fails if a key is
// removed from translation.json.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (en as Record<string, string>)[key] ?? `MISSING:${key}`,
  }),
}));

describe("NotFound", () => {
  it("has every translation key it renders", () => {
    render(<NotFound />);
    expect(document.body.textContent).not.toContain("MISSING:");
  });

  it("renders a single level-1 heading", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
  });

  it("explains what happened in prose", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/does not exist, or it has moved/i),
    ).toBeInTheDocument();
  });

  it("keeps the home call to action", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("link", { name: /return to the home page/i }),
    ).toBeInTheDocument();
  });

  it("offers recovery links agents can follow without JavaScript", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: /where to go next/i });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual(["/sitemap", "/work", "/blog", "/contact", "/llms.txt"]);
  });

  it("points agents at llms.txt explicitly", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("link", { name: /llms\.txt/i }),
    ).toHaveAttribute("href", "/llms.txt");
  });
});
