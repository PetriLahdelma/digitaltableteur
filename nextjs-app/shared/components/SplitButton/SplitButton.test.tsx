import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SplitButton, { type SplitButtonOption } from "./SplitButton";

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

  it("opens menu when toggle button is clicked", () => {
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft" }, { label: "Save and publish" }]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    expect(screen.getByText("Save as draft")).toBeInTheDocument();
    expect(screen.getByText("Save and publish")).toBeInTheDocument();
  });

  it("calls option onSelect when option is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft", onSelect: handleSelect }]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    fireEvent.click(screen.getByText("Save as draft"));
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it("closes menu after selecting an option", async () => {
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft", onSelect: vi.fn() }]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);
    expect(screen.getByText("Save as draft")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: /save as draft/i }));
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
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

  it("renders nested submenu when option has children", () => {
    const options: SplitButtonOption[] = [
      {
        label: "Export",
        children: [{ label: "Export as PDF" }, { label: "Export as CSV" }],
      },
    ];

    render(<SplitButton label="Save" options={options} />);

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("renders option icons when provided", () => {
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Save as draft", icon: "save" }]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    expect(screen.getByText("Save as draft")).toBeInTheDocument();
  });

  it("disables specific options when disabled prop is set", () => {
    render(
      <SplitButton
        label="Save"
        options={[
          { label: "Save as draft" },
          { label: "Delete", disabled: true },
        ]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    const deleteButton = screen.getByText("Delete").closest("button");
    expect(deleteButton).toBeDisabled();
  });

  it("closes menu when clicking outside", () => {
    render(
      <div>
        <SplitButton label="Save" options={[{ label: "Save as draft" }]} />
        <button>Outside</button>
      </div>,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);
    expect(screen.getByText("Save as draft")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("handles keyboard navigation with arrow keys", () => {
    render(
      <SplitButton
        label="Save"
        options={[{ label: "Option 1" }, { label: "Option 2" }]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowUp" });

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("closes menu on Escape key", () => {
    render(<SplitButton label="Save" options={[{ label: "Save as draft" }]} />);

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);
    expect(screen.getByText("Save as draft")).toBeInTheDocument();

    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("applies custom className to wrapper", () => {
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

  it("renders with different sizes", () => {
    render(
      <SplitButton
        label="Save"
        size="s"
        options={[{ label: "Save as draft" }]}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("opens submenu on hover", async () => {
    const options: SplitButtonOption[] = [
      {
        label: "Export",
        children: [{ label: "Export as PDF" }],
      },
    ];

    render(<SplitButton label="Save" options={options} />);

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    const exportOption = screen.getByText("Export");
    fireEvent.mouseEnter(exportOption);

    expect(screen.getByText("Export as PDF")).toBeInTheDocument();
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

    const primaryButton = screen.getAllByRole("button")[0];
    fireEvent.click(primaryButton);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not open menu when toggle is disabled", () => {
    render(
      <SplitButton
        label="Save"
        disabled
        options={[{ label: "Save as draft" }]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("handles rapid toggle clicks", () => {
    render(<SplitButton label="Save" options={[{ label: "Save as draft" }]} />);

    const toggleButton = screen.getAllByRole("button")[1];

    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    expect(screen.getByText("Save as draft")).toBeInTheDocument();
  });

  it("renders option descriptions when provided", () => {
    render(
      <SplitButton
        label="Save"
        options={[
          { label: "Save as draft", description: "Save without publishing" },
        ]}
      />,
    );

    const toggleButton = screen.getAllByRole("button")[1];
    fireEvent.click(toggleButton);

    expect(
      screen.getByRole("menuitem", { name: /save as draft/i }),
    ).toHaveAttribute("title", "Save without publishing");
  });
});
