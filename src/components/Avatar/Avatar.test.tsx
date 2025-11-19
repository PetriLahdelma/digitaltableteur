import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Avatar from "./Avatar";

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
