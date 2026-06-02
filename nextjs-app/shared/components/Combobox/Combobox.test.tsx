import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Combobox from "@dt/Combobox";

const OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "flexible", label: "Flexible" },
];

describe("Combobox", () => {
  it("shows placeholder when no value is selected", () => {
    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
        placeholder="Select..."
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Select...");
  });

  it("opens dropdown and selects an option", () => {
    const onValueChange = vi.fn();

    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={onValueChange}
        placeholder="Select..."
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "ASAP" }));
    expect(onValueChange).toHaveBeenCalledWith("asap");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when the chevron is clicked while open", () => {
    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("button", { name: /toggle options/i }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
