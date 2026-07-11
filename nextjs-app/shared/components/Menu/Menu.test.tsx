import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "./Menu";

expect.extend(toHaveNoViolations);

// Radix relies on pointer-capture and scrollIntoView, which jsdom omits.
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

function renderMenu({
  defaultOpen,
  onOpenChange,
  onSelect,
  disabled,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: () => void;
  disabled?: boolean;
} = {}) {
  return render(
    <Menu defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <MenuTrigger asChild>
        <button type="button">Actions</button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={onSelect}>Edit</MenuItem>
        <MenuItem disabled={disabled} onSelect={onSelect}>
          Archive
        </MenuItem>
        <MenuSeparator />
        <MenuItem href="/settings">Settings</MenuItem>
      </MenuContent>
    </Menu>,
  );
}

describe("Menu", () => {
  it("renders the trigger with menu semantics, closed by default", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders the menu and items when defaultOpen", () => {
    renderMenu({ defaultOpen: true });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("calls onSelect when an item is chosen", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderMenu({ defaultOpen: true, onSelect });
    await user.click(screen.getByText("Edit"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange with the next open state", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderMenu({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("does not select a disabled item and marks it disabled", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderMenu({ defaultOpen: true, onSelect, disabled: true });
    const archive = screen.getByText("Archive").closest('[role="menuitem"]');
    expect(archive).toHaveAttribute("data-disabled");
    await user.click(screen.getByText("Archive"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders href items as anchors", () => {
    renderMenu({ defaultOpen: true });
    const link = screen.getByText("Settings").closest("a");
    expect(link).toHaveAttribute("href", "/settings");
    expect(link).toHaveAttribute("role", "menuitem");
  });

  it("has no axe violations while open", async () => {
    renderMenu({ defaultOpen: true });
    // The menu portals to the top of <body>; the region (landmark) rule is a
    // page-structure concern, not a menu concern, so scope it out for this
    // isolated render.
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
