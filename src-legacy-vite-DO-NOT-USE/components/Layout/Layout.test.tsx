import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Layout from "./Layout";

vi.mock("../../patterns/Header/Header", () => ({
  default: () => <div data-testid="header">HeaderStub</div>,
}));
vi.mock("../../patterns/Footer/Footer", () => ({
  default: () => <div data-testid="footer">FooterStub</div>,
}));
vi.mock("../ChatWidget/ChatWidget", () => ({
  default: () => <div data-testid="chatwidget">ChatWidgetStub</div>,
}));
vi.mock("../../Components/Button", () => ({
  default: ({ children, onClick, className }: any) => (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("Layout", () => {
  it("renders shell and skip link focuses main content", () => {
    render(
      <Layout>
        <div>ChildContent</div>
      </Layout>,
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("chatwidget")).toBeInTheDocument();
    expect(screen.getByText("ChildContent")).toBeInTheDocument();

    const skipLink = screen.getByText(/Skip to main content/i);
    fireEvent.click(skipLink);
    expect(window.location.hash).toBe("#main");
  });
});
