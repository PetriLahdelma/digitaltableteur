import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll } from "vitest";
import Avatar from "@dt/Avatar";

// Mock the package translation adapter.
vi.mock("../../lib/translation", () => {
  const t = (key: string, params?: Record<string, unknown>) => {
    if (key === "avatar.menuLabel" && params?.name) {
      return `${params.name} menu`;
    }
    if (key === "avatar.menuLabelGeneric") return "Avatar menu";
    if (key === "avatar.altTextGeneric") return "Avatar";
    return key;
  };
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

// The avatar menu is the Radix-backed Menu primitive, which relies on
// pointer-capture and scrollIntoView (absent in jsdom).
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

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

  it("exposes the trigger with menu semantics when menuItems are provided", () => {
    render(
      <Avatar
        name="Petri Lahdelma"
        menuLabel="Open avatar menu"
        menuItems={[{ label: "Profile" }]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open avatar menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
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

    expect(
      await screen.findByRole("menuitem", { name: "Profile" }),
    ).toBeVisible();
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

  it("renders href menu items as links", async () => {
    render(
      <Avatar
        name="Petri Lahdelma"
        menuLabel="Open avatar menu"
        menuItems={[{ label: "Profile", href: "/profile" }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open avatar menu" });
    await userEvent.click(trigger);

    const item = await screen.findByRole("menuitem", { name: "Profile" });
    expect(item.closest("a")).toHaveAttribute("href", "/profile");
  });

  it("applies custom size via CSS variable", () => {
    const { container } = render(
      <Avatar name="Petri Lahdelma" size="4rem" />,
    );
    const sized = container.querySelector('[style*="--avatar-size"]');
    expect(sized).toBeTruthy();
    expect(sized?.getAttribute("style")).toContain("4rem");
  });

  it.each([
    ["sm", "2rem"],
    ["md", "2.5rem"],
    ["lg", "3rem"],
    ["xl", "4rem"],
  ])("resolves the %s token to %s", (token, length) => {
    const { container } = render(
      <Avatar name="Petri Lahdelma" size={token} />,
    );
    const sized = container.querySelector('[style*="--avatar-size"]');
    expect(sized?.getAttribute("style")).toContain(`--avatar-size: ${length}`);
  });

  it("resolves token sizes in the img sizes attribute", () => {
    const { container } = render(
      <Avatar name="Petri Lahdelma" imageUrl="/test.jpg" size="sm" />,
    );
    expect(container.querySelector("img")?.getAttribute("sizes")).toBe("2rem");
  });

  it("navigates when clickable with destinationUrl", async () => {
    const hrefSetter = vi.fn();
    const locationMock = {
      href: "http://localhost:3000/",
      assign: vi.fn(),
      replace: vi.fn(),
    };
    Object.defineProperty(locationMock, "href", {
      configurable: true,
      get: () => "http://localhost:3000/",
      set: hrefSetter,
    });
    vi.stubGlobal("location", locationMock);

    render(
      <Avatar
        name="Petri Lahdelma"
        clickable
        destinationUrl="https://example.com/profile"
      />,
    );

    await userEvent.click(screen.getByText("PL"));
    expect(hrefSetter).toHaveBeenCalledWith("https://example.com/profile");
    vi.unstubAllGlobals();
  });

  it("closes menu when clicking outside", async () => {
    render(
      <div>
        <Avatar
          name="Petri Lahdelma"
          menuLabel="Open menu"
          menuItems={[{ label: "Profile" }]}
        />
        <button>Outside</button>
      </div>,
    );

    const trigger = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(trigger);
    expect(
      await screen.findByRole("menuitem", { name: "Profile" }),
    ).toBeVisible();

    const outsideButton = screen.getByRole("button", { name: "Outside" });
    await userEvent.click(outsideButton);

    expect(
      screen.queryByRole("menuitem", { name: "Profile" }),
    ).not.toBeInTheDocument();
  });

  it("closes menu on Escape key", async () => {
    render(
      <Avatar
        name="Petri Lahdelma"
        menuLabel="Open menu"
        menuItems={[{ label: "Profile" }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(trigger);
    expect(
      await screen.findByRole("menuitem", { name: "Profile" }),
    ).toBeVisible();

    await userEvent.keyboard("{Escape}");

    expect(
      screen.queryByRole("menuitem", { name: "Profile" }),
    ).not.toBeInTheDocument();
  });

  it("generates correct initials for single word names", () => {
    render(<Avatar name="Petri" />);
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("generates correct initials for hyphenated names", () => {
    render(<Avatar name="Mary-Jane Watson" />);
    expect(screen.getByText("MW")).toBeInTheDocument();
  });

  it("handles empty string name gracefully", () => {
    const { container } = render(<Avatar name="" />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("renders menu item icons", async () => {
    render(
      <Avatar
        name="Petri Lahdelma"
        menuLabel="Open menu"
        menuItems={[{ label: "Profile", icon: "👤" }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(trigger);

    expect(await screen.findByText("👤")).toBeInTheDocument();
  });

  it("uses fallback alt text when name is not provided", () => {
    render(<Avatar imageUrl="https://via.placeholder.com/50" />);
    expect(screen.getByAltText("Avatar")).toBeInTheDocument();
  });
});
