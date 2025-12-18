import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextMobileMenu } from "./NextMobileMenu";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock usePersistentTheme
vi.mock("../../hooks/usePersistentTheme", () => ({
  usePersistentTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

const mockNavItems = [
  { href: "/", label: "Home", exact: true },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
];

const mockLanguages = [
  { code: "en", label: "English" },
  { code: "fi", label: "Suomi" },
];

describe("NextMobileMenu", () => {
  it("renders when open", () => {
    render(
      <NextMobileMenu
        isOpen={true}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <NextMobileMenu
        isOpen={false}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(container.querySelector('[class*="menu"]')).not.toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    render(
      <NextMobileMenu
        isOpen={true}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(
      <NextMobileMenu
        isOpen={true}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <NextMobileMenu
        isOpen={true}
        onClose={onClose}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onNavigate when nav item clicked", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(
      <NextMobileMenu
        isOpen={true}
        onNavigate={onNavigate}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );

    const aboutLink = screen.getByText("About");
    await user.click(aboutLink);

    expect(onNavigate).toHaveBeenCalled();
  });

  it("renders language buttons", () => {
    render(
      <NextMobileMenu
        isOpen={true}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(
      screen.getByRole("button", { name: /english/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /suomi/i })).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(
      <NextMobileMenu
        isOpen={true}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(screen.getByRole("button", { name: /theme/i })).toBeInTheDocument();
  });

  it("uses custom id when provided", () => {
    const { container } = render(
      <NextMobileMenu
        isOpen={true}
        id="custom-menu"
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(container.querySelector("#custom-menu")).toBeInTheDocument();
  });

  it("marks active link with aria-current", () => {
    render(
      <NextMobileMenu
        isOpen={true}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
