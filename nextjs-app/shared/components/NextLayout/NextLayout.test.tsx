import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextLayout } from "./NextLayout";

vi.mock("../ChatWidget/ChatWidget", () => ({
  default: () => <div>Mocked chat</div>,
}));

vi.mock("../CookieConsent/CookieConsent", () => ({
  default: () => <div>Mocked cookie consent</div>,
}));

describe("NextLayout", () => {
  it("renders children", () => {
    render(
      <NextLayout>
        <div>Test Content</div>
      </NextLayout>,
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders skip link", () => {
    render(
      <NextLayout>
        <div>Content</div>
      </NextLayout>,
    );
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders main element with id", () => {
    const { container } = render(
      <NextLayout>
        <div>Content</div>
      </NextLayout>,
    );
    const main = container.querySelector("#main-content");
    expect(main).toBeInTheDocument();
    expect(main?.tagName).toBe("MAIN");
  });

  it("renders header component", () => {
    const { container } = render(
      <NextLayout>
        <div>Content</div>
      </NextLayout>,
    );
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders footer component", () => {
    const { container } = render(
      <NextLayout>
        <div>Content</div>
      </NextLayout>,
    );
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("applies layout styles", () => {
    const { container } = render(
      <NextLayout>
        <div>Content</div>
      </NextLayout>,
    );
    const layout = container.querySelector('[class*="layout"]');
    expect(layout).toBeInTheDocument();
  });

  it("applies main styles", () => {
    const { container } = render(
      <NextLayout>
        <div>Content</div>
      </NextLayout>,
    );
    const main = container.querySelector('[class*="main"]');
    expect(main).toBeInTheDocument();
  });
});
