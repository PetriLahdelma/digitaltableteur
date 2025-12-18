import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Accordion from "./Accordion";

describe("Accordion", () => {
  const items = [
    { id: "1", title: "First Item", content: "First content" },
    { id: "2", title: "Second Item", content: "Second content" },
    { id: "3", title: "Third Item", content: "Third content" },
  ];

  it("renders all accordion items", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("First Item")).toBeInTheDocument();
    expect(screen.getByText("Second Item")).toBeInTheDocument();
    expect(screen.getByText("Third Item")).toBeInTheDocument();
  });

  it("all items are closed by default", () => {
    render(<Accordion items={items} />);
    expect(screen.queryByText("First content")).not.toBeInTheDocument();
    expect(screen.queryByText("Second content")).not.toBeInTheDocument();
    expect(screen.queryByText("Third content")).not.toBeInTheDocument();
  });

  it("opens item with defaultOpenId", () => {
    render(<Accordion items={items} defaultOpenId="2" />);
    expect(screen.getByText("Second content")).toBeInTheDocument();
    expect(screen.queryByText("First content")).not.toBeInTheDocument();
  });

  it("opens item when clicked", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByText("First Item"));
    expect(screen.getByText("First content")).toBeInTheDocument();
  });

  it("closes open item when clicked again", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenId="1" />);

    expect(screen.getByText("First content")).toBeInTheDocument();
    await user.click(screen.getByText("First Item"));
    expect(screen.queryByText("First content")).not.toBeInTheDocument();
  });

  it("closes previous item when opening new one", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenId="1" />);

    expect(screen.getByText("First content")).toBeInTheDocument();
    await user.click(screen.getByText("Second Item"));
    expect(screen.queryByText("First content")).not.toBeInTheDocument();
    expect(screen.getByText("Second content")).toBeInTheDocument();
  });

  it("has correct aria-expanded attributes", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    const firstButton = screen.getByText("First Item").closest("button");
    expect(firstButton).toHaveAttribute("aria-expanded", "false");

    await user.click(firstButton!);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  it("has correct aria-controls attribute", () => {
    render(<Accordion items={items} />);
    const firstButton = screen.getByText("First Item").closest("button");
    expect(firstButton).toHaveAttribute("aria-controls", "panel-1");
  });

  it("content has correct region role", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByText("First Item"));
    const content = screen.getByText("First content").parentElement;
    expect(content).toHaveAttribute("role", "region");
  });

  it("renders content as React node", async () => {
    const user = userEvent.setup();
    const complexItems = [
      {
        id: "1",
        title: "Item",
        content: (
          <div>
            <strong>Bold</strong> text
          </div>
        ),
      },
    ];
    render(<Accordion items={complexItems} />);

    await user.click(screen.getByText("Item"));
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("renders icon for each item", () => {
    const { container } = render(<Accordion items={items} />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(items.length);
  });
});
