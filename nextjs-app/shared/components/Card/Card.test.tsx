import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import Card, { CardAction, CardTab } from "@dt/Card";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("Card", () => {
  it("renders title correctly", () => {
    render(<Card title="Test Card" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("renders body when provided", () => {
    render(<Card title="Test Card" body="Test body content" />);
    expect(screen.getByText("Test body content")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <Card title="Test Card">
        <p>Child content</p>
      </Card>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Card title="Test Card" icon={<TestIcon />} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders as link when link prop is provided", () => {
    render(
      <Card
        title="Test Card"
        link="/test"
        linkLabel="Test Link"
        body="Test body"
      />,
    );

    const linkElement = screen.getByRole("link");
    expect(linkElement).toHaveAttribute("href", "/test");
    // Note: Card component doesn't use aria-label, just check basic link functionality
  });

  it("applies custom className (div variant)", () => {
    const { container } = render(
      <Card title="Test Card" className="custom-class" />,
    );
    const cardElement = container.querySelector(".custom-class");
    expect(cardElement).toBeInTheDocument();
  });
  it("applies custom className (query selector)", () => {
    const { container } = render(
      <Card title="Test Card" className="custom-class" />,
    );
    // The custom class is applied to the top-level card div
    const cardElement = container.querySelector(".custom-class");
    expect(cardElement).toBeInTheDocument();
  });

  it("renders actions", () => {
    const actions: CardAction[] = [
      { key: "a", label: "First" },
      { key: "b", label: "Second" },
    ];
    render(<Card title="Action Card" actions={actions} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("renders loading skeleton", () => {
    render(withI18n(<Card title="Loading Card" loading body="Hidden" />));
    const skeleton = screen.getByRole("status", { name: /loading content/i });
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("forwards ref to the card element (div mode)", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card title="Ref Card" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref to the anchor in link mode", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      withI18n(<Card title="Linked" link="/x" linkLabel="Linked" ref={ref} />),
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("renders tabs and switches active (uncontrolled)", () => {
    const tabs: CardTab[] = [
      { key: "one", label: "One" },
      { key: "two", label: "Two" },
    ];
    render(<Card title="Tabbed" tabs={tabs} body="Content" />);
    const tabOne = screen.getByRole("tab", { name: /One/i });
    const tabTwo = screen.getByRole("tab", { name: /Two/i });
    expect(tabOne).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tabTwo);
    expect(tabTwo).toHaveAttribute("aria-selected", "true");
  });
});
