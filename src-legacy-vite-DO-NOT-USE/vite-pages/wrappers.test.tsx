import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import i18n from "../i18n";
import AiUsage from "./AiUsage";
import AuthorProfile from "./AuthorProfile";
import CookiePolicy from "./CookiePolicy";
import CookiePolicyFullEn from "./CookiePolicy-full-en";
import CookiePolicyFullFi from "./CookiePolicy-full-fi";
import CookiePolicyFullSv from "./CookiePolicy-full-sv";
import UnderDevelopment from "./UnderDevelopment";
import GarageJunction from "./work/garageJunction";
import Illustrations from "./work/illustrations";
import NewThingsCo from "./work/newThingsCo";
import { getAuthors } from "../data/authors";

const renderWithProviders = (
  ui: React.ReactElement,
  initialEntry = "/",
  routes?: React.ReactNode,
) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialEntry]}>
        {routes ?? ui}
      </MemoryRouter>
    </I18nextProvider>,
  );

describe("Legacy page wrappers (full coverage)", () => {
  it("renders AI usage wrapper", () => {
    renderWithProviders(<AiUsage />);
    expect(
      screen.getByText(/AI use & transparency statement/i),
    ).toBeInTheDocument();
  });

  it("renders author profile via router params", () => {
    const slug = getAuthors()[0].slug;
    renderWithProviders(
      <AuthorProfile />,
      `/blog/authors/${slug}`,
      <Routes>
        <Route path="/blog/authors/:slug" element={<AuthorProfile />} />
      </Routes>,
    );
    expect(screen.getAllByText(/Petri Lahdelma/i)[0]).toBeInTheDocument();
  });

  it("renders cookie policy variants", () => {
    renderWithProviders(<CookiePolicy />);
    renderWithProviders(<CookiePolicyFullEn />);
    renderWithProviders(<CookiePolicyFullFi />);
    renderWithProviders(<CookiePolicyFullSv />);
    expect(screen.getAllByText(/Cookie Policy/i).length).toBeGreaterThan(0);
  });

  it("renders under development placeholder", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    renderWithProviders(<UnderDevelopment />);
    expect(screen.getByText(/Site Under Development/i)).toBeInTheDocument();
    process.env.NODE_ENV = originalEnv;
  });

  it("renders work detail wrappers", () => {
    renderWithProviders(<GarageJunction />);
    expect(screen.getAllByText(/Garage Junction/i)[0]).toBeInTheDocument();

    renderWithProviders(<Illustrations />);
    expect(screen.getAllByText(/Illustrations/i)[0]).toBeInTheDocument();

    renderWithProviders(<NewThingsCo />);
    expect(screen.getAllByText(/New Things Co/i)[0]).toBeInTheDocument();
  });
});
