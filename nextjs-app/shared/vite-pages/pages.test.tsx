import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import i18n from "../i18n";
import Contact from "./Contact";
import Blog from "./Blog";
import Work from "./Work";
import Home from "./Home";
import BlogArticle from "./BlogArticle";
import { getBlogPosts } from "../data/blogPosts";

vi.mock("leaflet", () => {
  const noop = () => {};
  const dummyMap = {
    setView: () => dummyMap,
    remove: noop,
  };
  return {
    default: {
      map: vi.fn(() => dummyMap),
      tileLayer: vi.fn(() => ({ addTo: noop })),
      icon: vi.fn(() => ({})),
      marker: vi.fn(() => ({ addTo: () => ({ bindPopup: vi.fn() }) })),
      Icon: { Default: { prototype: { options: {} }, mergeOptions: vi.fn() } },
    },
  };
});
const withRouter = (ui: React.ReactElement, initialEntries = ["/"]) => (
  <I18nextProvider i18n={i18n}>
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  </I18nextProvider>
);

describe("Legacy page wrappers", () => {
  it("renders core pages", () => {
    render(withRouter(<Contact />));
    expect(
      screen.getByText(/Connect for a free discovery session/i),
    ).toBeInTheDocument();

    render(withRouter(<Blog />));
    expect(screen.getByText(/Latest Articles/i)).toBeInTheDocument();

    render(withRouter(<Work />));
    expect(screen.getByText(/View New Things Co project/i)).toBeInTheDocument();

    render(withRouter(<Home />));
    expect(
      screen.getByText(/We design the future of intelligent products/i),
    ).toBeInTheDocument();
  });

  it("renders blog article route via router params", () => {
    const [first] = getBlogPosts();
    render(
      withRouter(
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticle />} />
        </Routes>,
        [`/blog/${first.slug}`],
      ),
    );

    expect(screen.getByText(first.title)).toBeInTheDocument();
  });
});
