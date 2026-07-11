import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { CommandPalette, type CommandPaletteItem } from "./CommandPalette";

expect.extend(toHaveNoViolations);

const makeItems = (): CommandPaletteItem[] => [
  { id: "home", label: "Go to Home", keywords: ["start"], onSelect: vi.fn() },
  { id: "blog", label: "Go to Blog", keywords: ["articles"], onSelect: vi.fn() },
  { id: "work", label: "Go to Work", onSelect: vi.fn() },
];

describe("CommandPalette", () => {
  it("renders a modal dialog with a combobox and listbox when open", () => {
    render(<CommandPalette open onClose={() => {}} items={makeItems()} />);
    expect(screen.getByRole("dialog", { name: "Command palette" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("renders nothing when closed", () => {
    render(<CommandPalette open={false} onClose={() => {}} items={makeItems()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters by label and by keyword", () => {
    render(<CommandPalette open onClose={() => {}} items={makeItems()} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "blog" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Go to Blog");
    fireEvent.change(input, { target: { value: "articles" } });
    expect(screen.getByRole("option")).toHaveTextContent("Go to Blog");
  });

  it("shows the empty state when nothing matches", () => {
    render(<CommandPalette open onClose={() => {}} items={makeItems()} emptyText="Nothing" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("moves the active option with arrows and runs it on Enter, then closes", () => {
    const items = makeItems();
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} items={items} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // active -> index 1 (Blog)
    fireEvent.keyDown(input, { key: "Enter" });
    expect(items[1].onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} items={makeItems()} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("runs a command on click", () => {
    const items = makeItems();
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} items={items} />);
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Go to Work"));
    expect(items[2].onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps focus while open and restores prior focus when closed", async () => {
    const main = document.createElement("main");
    main.id = "main-content";
    const before = document.createElement("button");
    before.type = "button";
    before.textContent = "Before";
    main.appendChild(before);
    document.body.appendChild(main);
    before.focus();

    const onClose = vi.fn();
    const { rerender } = render(
      <CommandPalette open onClose={onClose} items={makeItems()} />,
    );

    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
    expect(main).toHaveAttribute("inert");

    rerender(
      <CommandPalette open={false} onClose={onClose} items={makeItems()} />,
    );

    expect(before).toHaveFocus();
    expect(main).not.toHaveAttribute("inert");
    main.remove();
  });

  it("has no axe violations", async () => {
    const { baseElement } = render(
      <CommandPalette open onClose={() => {}} items={makeItems()} />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
