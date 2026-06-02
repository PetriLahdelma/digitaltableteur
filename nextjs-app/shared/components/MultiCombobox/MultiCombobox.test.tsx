import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import MultiCombobox from "@dt/MultiCombobox";

const OPTIONS = [
  { value: "website", label: "Website" },
  { value: "brand-identity", label: "Brand & Identity" },
  { value: "other", label: "Other" },
];

describe("MultiCombobox", () => {
  it("shows placeholder on the combobox input when empty", () => {
    render(
      <MultiCombobox
        label="Project type"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
        placeholder="Select one or more..."
      />,
    );

    expect(
      screen.getByPlaceholderText("Select one or more..."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens dropdown, filters options, and toggles selections", () => {
    const onValueChange = vi.fn();

    render(
      <MultiCombobox
        label="Project type"
        options={OPTIONS}
        value={["website"]}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText("Website")).toBeInTheDocument();

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "brand" } });

    const listbox = screen.getByRole("listbox");
    expect(
      within(listbox).getByRole("option", { name: /Brand & Identity/i }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: /^Other$/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(listbox).getByRole("option", { name: /Brand & Identity/i }),
    );
    expect(onValueChange).toHaveBeenCalledWith(["website", "brand-identity"]);
  });

  it("removes a chip without closing the field", () => {
    const onValueChange = vi.fn();

    render(
      <MultiCombobox
        label="Project type"
        options={OPTIONS}
        value={["website", "other"]}
        onValueChange={onValueChange}
      />,
    );

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => button.closest("[data-chip-remove]"));
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0]!);
    expect(onValueChange).toHaveBeenCalledWith(["other"]);
  });

  it("closes the dropdown when the chevron is clicked while open", () => {
    render(
      <MultiCombobox
        label="Project type"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /toggle options/i }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opts the dropdown out of Lenis wheel capture for nested scrolling", () => {
    render(
      <MultiCombobox
        label="Project type"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("data-lenis-prevent-wheel");
    expect(listbox).toHaveAttribute("data-lenis-prevent");
  });

  it("shows an error message when provided", () => {
    render(
      <MultiCombobox
        label="Project type"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
        error="Pick at least one project type"
      />,
    );

    expect(
      screen.getByText("Pick at least one project type"),
    ).toBeInTheDocument();
  });
});
