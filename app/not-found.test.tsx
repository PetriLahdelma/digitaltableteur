import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import en from "@/nextjs-app/shared/locales/en/translation.json";
import NotFound from "./not-found";

// Resolve against the real English catalogue rather than a hand-written map:
// this asserts the copy actually reaches the DOM *and* fails if a key is
// removed from translation.json.
// The hook's real module pulls in the whole site shell; behaviour is covered
// in NextLayout.test.tsx instead.
vi.mock("@dt/NextLayout", () => ({
  useHideChatWidget: vi.fn(),
}));

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

  it("offers exactly two destinations: home and the sitemap", () => {
    render(<NotFound />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/sitemap"]);
  });

  it("labels the sitemap action", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("link", { name: /view sitemap/i }),
    ).toHaveAttribute("href", "/sitemap");
  });

  it("does not repeat the header navigation", () => {
    render(<NotFound />);
    for (const label of [/^work$/i, /^blog$/i, /^contact$/i]) {
      expect(screen.queryByRole("link", { name: label })).toBeNull();
    }
  });

  it("does not surface llms.txt to humans (it ships as a Link header instead)", () => {
    render(<NotFound />);
    expect(screen.queryByRole("link", { name: /llms/i })).toBeNull();
  });
});
