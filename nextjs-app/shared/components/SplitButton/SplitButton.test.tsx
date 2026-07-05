import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SplitButton, { type SplitButtonOption } from "./SplitButton";

// The dropdown is the Radix-backed Menu primitive, which relies on
// pointer-capture and scrollIntoView (absent in jsdom).
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

const openMenu = async () => {
  const toggle = screen.getAllByRole("button")[1];
  await userEvent.click(toggle);
};

describe("SplitButton", () => {
  it("renders primary button with label", () => {
    render(<SplitButton label="Save" options={[{ label: "Save as draft" }]} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls onPrimaryClick when main button is clicked", () => {
    const handleClick = vi.fn();
    render(
      <SplitButton
        label="Save"
        onPrimaryClick={handleClick}
        options={[{ label: "Save as draft" }]}
      />,
    );

    fireEvent.click(screen.getByText("Save"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("opens the menu when the toggle is clicked", async () => {
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft" }, { label: "Save and publish" }]}
      />,
    );

    await openMenu();

    expect(
      await screen.findByRole("menuitem", { name: "Save as draft" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Save and publish" }),
    ).toBeInTheDocument();
  });

  it("calls option onSelect when an option is clicked", async () => {
    const handleSelect = vi.fn();
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft", onSelect: handleSelect }]}
      />,
    );

    await openMenu();
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Save as draft" }),
    );
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it("closes the menu after selecting an option", async () => {
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft", onSelect: vi.fn() }]}
      />,
    );

    await openMenu();
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Save as draft" }),
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("disables both buttons when disabled prop is true", () => {
    render(
      <SplitButton
        label="Save"
        disabled
        options={[{ label: "Save as draft" }]}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it("renders a submenu trigger when an option has children", async () => {
    const options: SplitButtonOption[] = [
      {
        label: "Export",
        children: [{ label: "Export as PDF" }, { label: "Export as CSV" }],
      },
    ];

    render(<SplitButton label="Save" options={options} />);
    await openMenu();

    expect(await screen.findByText("Export")).toBeInTheDocument();
  });

  it("marks a disabled option as disabled", async () => {
    render(
      <SplitButton
        label="Save"
        options={[
          { label: "Save as draft" },
          { label: "Delete", disabled: true },
        ]}
      />,
    );

    await openMenu();
    const item = await screen.findByRole("menuitem", { name: "Delete" });
    expect(item).toHaveAttribute("data-disabled");
  });

  it("closes the menu when clicking outside", async () => {
    render(
      <div>
        <SplitButton label="Save" options={[{ label: "Save as draft" }]} />
        <button>Outside</button>
      </div>,
    );

    await openMenu();
    expect(
      await screen.findByRole("menuitem", { name: "Save as draft" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the menu on Escape", async () => {
    render(<SplitButton label="Save" options={[{ label: "Save as draft" }]} />);

    await openMenu();
    expect(
      await screen.findByRole("menuitem", { name: "Save as draft" }),
    ).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("applies custom className to the wrapper", () => {
    const { container } = render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft" }]}
        className="custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with different variants", () => {
    const { container } = render(
      <SplitButton
        label="Save"
        variant="secondary"
        options={[{ label: "Save as draft" }]}
      />,
    );

    expect(
      container.querySelector('[data-variant="secondary"]'),
    ).toBeInTheDocument();
  });

  it("does not call onPrimaryClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <SplitButton
        label="Save"
        disabled
        onPrimaryClick={handleClick}
        options={[{ label: "Save as draft" }]}
      />,
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not open the menu when the toggle is disabled", async () => {
    render(
      <SplitButton
        label="Save"
        disabled
        options={[{ label: "Save as draft" }]}
      />,
    );

    await openMenu();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
