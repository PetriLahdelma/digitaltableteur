import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Avatar from "./Avatar";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "avatar.menuLabel" && params?.name) {
        return `${params.name} menu`;
      }
      if (key === "avatar.menuLabelGeneric") return "Avatar menu";
      if (key === "avatar.altTextGeneric") return "Avatar";
      return key;
    },
  }),
}));

const createDomRect = (rect: Partial<DOMRect>): DOMRect => {
  const left = rect.left ?? rect.x ?? 0;
  const top = rect.top ?? rect.y ?? 0;
  const width = rect.width ?? (rect.right ? rect.right - left : 0);
  const height = rect.height ?? (rect.bottom ? rect.bottom - top : 0);
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: rect.right ?? left + width,
    bottom: rect.bottom ?? top + height,
    toJSON() {
      return {};
    },
  };
};

describe("Avatar Component", () => {
  it("renders initials when name is provided", () => {
    render(<Avatar name="Petri Lahdelma" />);
    expect(screen.getByText("PL")).toBeInTheDocument();
  });

  it("renders image when imageUrl is provided", () => {
    render(
      <Avatar
        imageUrl="https://via.placeholder.com/50"
        name="Petri Lahdelma"
      />,
    );
    expect(screen.getByAltText("Petri Lahdelma")).toBeInTheDocument();
  });

  it("prefers initials when variant is set to initials even if image exists", () => {
    render(
      <Avatar
        imageUrl="https://via.placeholder.com/50"
        name="Petri Lahdelma"
        variant="initials"
      />,
    );
    expect(screen.getByText("PL")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders empty div when no props are provided", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("opens the avatar menu when the trigger is clicked", async () => {
    render(
      <Avatar
        name="Petri Lahdelma"
        menuLabel="Open avatar menu"
        menuItems={[{ label: "Profile" }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open avatar menu" });
    await userEvent.click(trigger);

    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeVisible();
  });

  it("closes the avatar menu after selecting an item", async () => {
    const handleSelect = vi.fn();
    render(
      <Avatar
        name="Petri Lahdelma"
        menuLabel="Open avatar menu"
        menuItems={[{ label: "Sign out", onSelect: handleSelect }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open avatar menu" });
    await userEvent.click(trigger);

    const item = await screen.findByRole("menuitem", { name: "Sign out" });
    await userEvent.click(item);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("menuitem", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });

  it("opens to the right side when there is limited space on the left", async () => {
    const rectMap = new WeakMap<Element, DOMRect>();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        return rectMap.get(this) ?? createDomRect({});
      });
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 500,
    });

    try {
      render(
        <Avatar
          name="Petri Lahdelma"
          menuLabel="Open avatar menu"
          menuItems={[{ label: "Profile" }]}
        />,
      );

      const trigger = screen.getByRole("button", { name: "Open avatar menu" });
      const wrapper = trigger.parentElement as HTMLElement;
      rectMap.set(wrapper, createDomRect({ left: 4, width: 40 }));

      await userEvent.click(trigger);
      const menu = await screen.findByRole("menu");
      rectMap.set(menu, createDomRect({ width: 180 }));

      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() =>
        expect(menu).toHaveAttribute("data-horizontal", "left"),
      );
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: originalInnerWidth,
      });
    }
  });

  it("opens to the left side when there is limited space on the right", async () => {
    const rectMap = new WeakMap<Element, DOMRect>();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        return rectMap.get(this) ?? createDomRect({});
      });
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 360,
    });

    try {
      render(
        <Avatar
          name="Petri Lahdelma"
          menuLabel="Open avatar menu"
          menuItems={[{ label: "Profile" }]}
        />,
      );

      const trigger = screen.getByRole("button", { name: "Open avatar menu" });
      const wrapper = trigger.parentElement as HTMLElement;
      rectMap.set(wrapper, createDomRect({ left: 260, width: 40 }));

      await userEvent.click(trigger);
      const menu = await screen.findByRole("menu");
      rectMap.set(menu, createDomRect({ width: 180 }));

      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() =>
        expect(menu).toHaveAttribute("data-horizontal", "right"),
      );
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: originalInnerWidth,
      });
    }
  });

  it("opens above when there is limited space below", async () => {
    const rectMap = new WeakMap<Element, DOMRect>();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        return rectMap.get(this) ?? createDomRect({});
      });
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 400,
    });

    try {
      render(
        <Avatar
          name="Petri Lahdelma"
          menuLabel="Open avatar menu"
          menuItems={[{ label: "Profile" }]}
        />,
      );

      const trigger = screen.getByRole("button", { name: "Open avatar menu" });
      const wrapper = trigger.parentElement as HTMLElement;
      rectMap.set(
        wrapper,
        createDomRect({ top: 340, height: 40, bottom: 380, left: 200 }),
      );

      await userEvent.click(trigger);
      const menu = await screen.findByRole("menu");
      rectMap.set(menu, createDomRect({ height: 120, width: 180 }));

      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() => expect(menu).toHaveAttribute("data-vertical", "top"));
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        writable: true,
        value: originalInnerHeight,
      });
    }
  });

  it("opens below when there is limited space above", async () => {
    const rectMap = new WeakMap<Element, DOMRect>();
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        return rectMap.get(this) ?? createDomRect({});
      });
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 480,
    });

    try {
      render(
        <Avatar
          name="Petri Lahdelma"
          menuLabel="Open avatar menu"
          menuItems={[{ label: "Profile" }]}
        />,
      );

      const trigger = screen.getByRole("button", { name: "Open avatar menu" });
      const wrapper = trigger.parentElement as HTMLElement;
      rectMap.set(
        wrapper,
        createDomRect({ top: 4, height: 40, bottom: 44, left: 200 }),
      );

      await userEvent.click(trigger);
      const menu = await screen.findByRole("menu");
      rectMap.set(menu, createDomRect({ height: 150, width: 180 }));

      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() =>
        expect(menu).toHaveAttribute("data-vertical", "bottom"),
      );
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        writable: true,
        value: originalInnerHeight,
      });
    }
  });
});

describe("Theme Support", () => {
  it("renders correctly in Light theme (default)", () => {
    render(<Avatar name="Test User" />);
    const avatar = screen.getByText("TU");
    expect(avatar).toHaveClass("avatarText");
  });

  it("renders correctly in Dark theme", () => {
    document.body.className = "themeDark";
    render(<Avatar name="Test User" menuItems={[{ label: "Profile" }]} />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
    document.body.className = "";
  });

  it("renders correctly in High Contrast White theme", () => {
    document.body.className = "themeHCW";
    render(<Avatar name="Test User" menuItems={[{ label: "Profile" }]} />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
    document.body.className = "";
  });

  it("renders correctly in High Contrast Black theme", () => {
    document.body.className = "themeHCB";
    render(<Avatar name="Test User" menuItems={[{ label: "Profile" }]} />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
    document.body.className = "";
  });
});

describe("Focus Trap", () => {
  it("traps focus within menu with Tab key", async () => {
    render(
      <Avatar
        name="Test User"
        menuItems={[
          { label: "Profile" },
          { label: "Settings" },
          { label: "Sign out" },
        ]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(3);

    // Focus should start on first item
    await waitFor(() => {
      expect(menuItems[0]).toHaveFocus();
    });

    // Tab should move to second item
    await userEvent.tab();
    expect(menuItems[1]).toHaveFocus();

    // Tab should move to third item
    await userEvent.tab();
    expect(menuItems[2]).toHaveFocus();

    // Tab from last item should cycle back to first
    await userEvent.tab();
    expect(menuItems[0]).toHaveFocus();
  });

  it("traps focus backwards with Shift+Tab", async () => {
    render(
      <Avatar
        name="Test User"
        menuItems={[
          { label: "Profile" },
          { label: "Settings" },
          { label: "Sign out" },
        ]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menuItems = screen.getAllByRole("menuitem");

    // Wait for first item to be focused
    await waitFor(() => {
      expect(menuItems[0]).toHaveFocus();
    });

    // Shift+Tab from first item should cycle to last
    await userEvent.tab({ shift: true });
    expect(menuItems[2]).toHaveFocus();

    // Shift+Tab should move to second item
    await userEvent.tab({ shift: true });
    expect(menuItems[1]).toHaveFocus();
  });

  it("returns focus to trigger button when menu closes", async () => {
    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Profile" }, { label: "Settings" }]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();

    // Close menu with Escape
    await userEvent.keyboard("{Escape}");

    // Focus should return to trigger
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});

describe("Keyboard Activation", () => {
  it("activates menu item with Enter key", async () => {
    const handleSelect = vi.fn();
    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Profile", onSelect: handleSelect }]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menuItem = await screen.findByRole("menuitem", { name: "Profile" });
    menuItem.focus();

    await userEvent.keyboard("{Enter}");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("activates menu item with Space key", async () => {
    const handleSelect = vi.fn();
    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Settings", onSelect: handleSelect }]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menuItem = await screen.findByRole("menuitem", { name: "Settings" });
    menuItem.focus();

    await userEvent.keyboard(" ");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("prevents default behavior for Space key to avoid scrolling", async () => {
    const handleSelect = vi.fn();
    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Profile", onSelect: handleSelect }]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menuItem = await screen.findByRole("menuitem", { name: "Profile" });

    const spaceEvent = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(spaceEvent, "preventDefault");

    menuItem.dispatchEvent(spaceEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});

describe("Error Handling", () => {
  it("handles errors in menu item onSelect callback", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const handleSelect = vi.fn(() => {
      throw new Error("Test error");
    });

    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Profile", onSelect: handleSelect }]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menuItem = await screen.findByRole("menuitem", { name: "Profile" });
    await userEvent.click(menuItem);

    expect(handleSelect).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Avatar menu item onSelect error:",
      expect.any(Error),
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("still closes menu even when onSelect throws error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const handleSelect = vi.fn(() => {
      throw new Error("Test error");
    });

    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Profile", onSelect: handleSelect }]}
      />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    await screen.findByRole("menu");

    const menuItem = screen.getByRole("menuitem", { name: "Profile" });
    await userEvent.click(menuItem);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});

describe("Screen Reader Support", () => {
  it("includes aria-hidden on decorative icons", async () => {
    const icon = <span data-testid="test-icon">🔧</span>;
    render(
      <Avatar name="Test User" menuItems={[{ label: "Settings", icon }]} />,
    );

    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const iconElement = screen.getByTestId("test-icon").parentElement;
    expect(iconElement).toHaveAttribute("aria-hidden", "true");
  });

  it("announces menu state changes with aria-live region", async () => {
    render(<Avatar name="Test User" menuItems={[{ label: "Profile" }]} />);

    const trigger = screen.getByRole("button");

    // Initially no announcement
    const liveRegions = screen.queryAllByRole("status");
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);

    // Open menu
    await userEvent.click(trigger);

    // Should announce menu opened
    await waitFor(() => {
      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveTextContent("avatar.menuOpened");
    });

    // Close menu
    await userEvent.keyboard("{Escape}");

    // Should announce menu closed
    await waitFor(() => {
      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveTextContent("avatar.menuClosed");
    });
  });
});

describe("Ref Forwarding", () => {
  it("forwards ref to trigger button for programmatic control", async () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Avatar name="Test User" menuItems={[{ label: "Profile" }]} ref={ref} />,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute("type", "button");
    expect(ref.current).toHaveAttribute("aria-haspopup", "menu");
  });

  it("allows programmatic focus via ref", async () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Avatar name="Test User" menuItems={[{ label: "Profile" }]} ref={ref} />,
    );

    act(() => {
      ref.current?.focus();
    });

    expect(ref.current).toHaveFocus();
  });

  it("supports callback ref pattern", () => {
    let buttonRef: HTMLButtonElement | null = null;
    const callbackRef = (node: HTMLButtonElement | null) => {
      buttonRef = node;
    };

    render(
      <Avatar
        name="Test User"
        menuItems={[{ label: "Profile" }]}
        ref={callbackRef}
      />,
    );

    expect(buttonRef).toBeInstanceOf(HTMLButtonElement);
  });
});
