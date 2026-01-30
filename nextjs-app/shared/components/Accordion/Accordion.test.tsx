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

  it("all items are closed by default with hidden attribute", () => {
    render(<Accordion items={items} />);
    // Panels are in DOM but hidden (accessibility pattern for valid aria-controls)
    const panel1 = document.getElementById("panel-1");
    const panel2 = document.getElementById("panel-2");
    const panel3 = document.getElementById("panel-3");
    expect(panel1).toHaveAttribute("hidden");
    expect(panel2).toHaveAttribute("hidden");
    expect(panel3).toHaveAttribute("hidden");
  });

  it("opens item with defaultOpenId", () => {
    render(<Accordion items={items} defaultOpenId="2" />);
    const openPanel = document.getElementById("panel-2");
    const closedPanel = document.getElementById("panel-1");
    expect(openPanel).not.toHaveAttribute("hidden");
    expect(closedPanel).toHaveAttribute("hidden");
    expect(screen.getByText("Second content")).toBeVisible();
  });

  it("opens item when clicked", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByText("First Item"));
    const panel = document.getElementById("panel-1");
    expect(panel).not.toHaveAttribute("hidden");
    expect(screen.getByText("First content")).toBeVisible();
  });

  it("closes open item when clicked again", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenId="1" />);

    const panel = document.getElementById("panel-1");
    expect(panel).not.toHaveAttribute("hidden");
    await user.click(screen.getByText("First Item"));
    expect(panel).toHaveAttribute("hidden");
  });

  it("closes previous item when opening new one", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenId="1" />);

    const panel1 = document.getElementById("panel-1");
    const panel2 = document.getElementById("panel-2");
    expect(panel1).not.toHaveAttribute("hidden");
    await user.click(screen.getByText("Second Item"));
    expect(panel1).toHaveAttribute("hidden");
    expect(panel2).not.toHaveAttribute("hidden");
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

  it("content has correct region role", () => {
    render(<Accordion items={items} />);
    // Panel is always in DOM for valid aria-controls reference
    const panel = document.getElementById("panel-1");
    expect(panel).toHaveAttribute("role", "region");
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

  // Accessibility tests for hidden attribute behavior
  describe("accessibility", () => {
    it("should always have panels in DOM for aria-controls validity", () => {
      render(<Accordion items={items} />);
      // All panels should exist even when closed
      items.forEach((item) => {
        const panel = document.getElementById(`panel-${item.id}`);
        expect(panel).toBeInTheDocument();
      });
    });

    it("should use hidden attribute on closed panels", () => {
      render(<Accordion items={items} />);
      const panel = document.getElementById("panel-1");
      expect(panel).toHaveAttribute("hidden");
    });

    it("should not have hidden attribute on open panel", () => {
      render(<Accordion items={items} defaultOpenId="1" />);
      const openPanel = document.getElementById("panel-1");
      const closedPanel = document.getElementById("panel-2");
      expect(openPanel).not.toHaveAttribute("hidden");
      expect(closedPanel).toHaveAttribute("hidden");
    });

    it("should have valid aria-controls reference when panel is hidden", () => {
      render(<Accordion items={items} />);
      const trigger = screen.getByRole("button", { name: "First Item" });
      const controlsId = trigger.getAttribute("aria-controls");
      const panel = document.getElementById(controlsId!);
      expect(panel).toBeInTheDocument();
    });
  });
});
