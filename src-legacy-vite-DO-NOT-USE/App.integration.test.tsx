import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@dt/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));
vi.mock("@dt/CookieConsent", () => ({
  default: () => <div data-testid="cookie-consent" />,
}));
vi.mock("@dt/ChunkErrorBoundary", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./pages/Home", () => ({ default: () => <div>HomeStub</div> }));
vi.mock("./pages/Work", () => ({ default: () => <div>WorkStub</div> }));
vi.mock("./pages/About", () => ({ default: () => <div>AboutStub</div> }));
vi.mock("./pages/Contact", () => ({ default: () => <div>ContactStub</div> }));
vi.mock("./pages/Blog", () => ({ default: () => <div>BlogStub</div> }));
vi.mock("./pages/BlogArticle", () => ({
  default: () => <div>BlogArticleStub</div>,
}));
vi.mock("./pages/AuthorProfile", () => ({
  default: () => <div>AuthorProfileStub</div>,
}));
vi.mock("./pages/AiUsage", () => ({ default: () => <div>AiUsageStub</div> }));
vi.mock("./pages/CookiePolicy-full-en", () => ({
  default: () => <div>CookieENStub</div>,
}));
vi.mock("./pages/CookiePolicy-full-fi", () => ({
  default: () => <div>CookieFIStub</div>,
}));
vi.mock("./pages/CookiePolicy-full-sv", () => ({
  default: () => <div>CookieSVStub</div>,
}));
vi.mock("./pages/work/newThingsCo", () => ({
  default: () => <div>WorkNewStub</div>,
}));
vi.mock("./pages/work/illustrations", () => ({
  default: () => <div>WorkIllustrationsStub</div>,
}));
vi.mock("./pages/work/garageJunction", () => ({
  default: () => <div>WorkGarageStub</div>,
}));
vi.mock("./pages/NotFound", () => ({
  default: () => <div>NotFoundStub</div>,
}));

describe("App routing", () => {
  beforeEach(() => {
    cleanup();
    window.history.pushState({}, "", "/");
  });

  const loadApp = async () => (await import("./App")).default;

  it("renders home route by default", async () => {
    const App = await loadApp();
    render(<App />);
    expect(await screen.findByText("HomeStub")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-consent")).toBeInTheDocument();
  });

  it("renders blog article route", async () => {
    window.history.pushState({}, "", "/blog/example");
    const App = await loadApp();
    render(<App />);
    expect(await screen.findByText("BlogArticleStub")).toBeInTheDocument();
  });

  it("renders author profile route", async () => {
    window.history.pushState({}, "", "/blog/authors/petri-lahdelma");
    const App = await loadApp();
    render(<App />);
    expect(await screen.findByText("AuthorProfileStub")).toBeInTheDocument();
  });

  it("renders not found for unknown route", async () => {
    window.history.pushState({}, "", "/this-route-does-not-exist");
    const App = await loadApp();
    render(<App />);
    expect(await screen.findByText("NotFoundStub")).toBeInTheDocument();
  });
});
