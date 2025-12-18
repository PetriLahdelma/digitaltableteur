import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextHeader } from "./NextHeader";

const mockUsePathname = vi.fn(() => "/");
const mockCycleTheme = vi.fn();
const mockUsePersistentTheme = vi.fn(() => ({
  theme: "light",
  cycleTheme: mockCycleTheme,
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("../../hooks/usePersistentTheme", () => ({
  usePersistentTheme: mockUsePersistentTheme,
}));

vi.mock("@/providers/ToastProvider", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe("NextHeader", () => {
  beforeEach(() => {
    mockCycleTheme.mockClear();
    mockUsePathname.mockReturnValue("/");
    mockUsePersistentTheme.mockReturnValue({
      theme: "light",
      cycleTheme: mockCycleTheme,
    });
  });

  it("renders navigation items", () => {
    render(<NextHeader />);
    expect(screen.getByText(/navHome/i)).toBeInTheDocument();
  });

  it("renders logo", () => {
    render(<NextHeader />);
    const logo = screen.getByRole("link", { name: /logo|home/i });
    expect(logo).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(<NextHeader />);
    const themeButton = screen.getByRole("button", { name: /theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it("renders language selector", () => {
    render(<NextHeader />);
    expect(screen.getByText(/EN|FI|SV/i)).toBeInTheDocument();
  });

  it("renders mobile menu toggle", () => {
    render(<NextHeader />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("opens mobile menu when toggle is clicked", () => {
    render(<NextHeader />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);
    expect(
      screen.getByRole("navigation", { name: /mobile/i }),
    ).toBeInTheDocument();
  });

  it("closes mobile menu when toggle is clicked again", () => {
    render(<NextHeader />);
    const menuButton = screen.getByRole("button", { name: /menu/i });

    fireEvent.click(menuButton);
    expect(
      screen.getByRole("navigation", { name: /mobile/i }),
    ).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(
      screen.queryByRole("navigation", { name: /mobile/i }),
    ).not.toBeInTheDocument();
  });

  it("cycles theme when theme button is clicked", () => {
    render(<NextHeader />);
    const themeButton = screen.getByRole("button", { name: /theme/i });

    fireEvent.click(themeButton);
    expect(mockCycleTheme).toHaveBeenCalledTimes(1);
  });

  it("renders all navigation links", () => {
    render(<NextHeader />);

    expect(screen.getByText(/navHome/i)).toBeInTheDocument();
    expect(screen.getByText(/navWork/i)).toBeInTheDocument();
    expect(screen.getByText(/navAbout/i)).toBeInTheDocument();
    expect(screen.getByText(/navContact/i)).toBeInTheDocument();
  });

  it("highlights active navigation item", () => {
    mockUsePathname.mockReturnValue("/work");

    render(<NextHeader />);
    const workLink = screen.getByText(/navWork/i).closest("a");

    expect(workLink).toHaveAttribute("aria-current", "page");
  });

  it("applies sticky positioning class", () => {
    const { container } = render(<NextHeader />);
    const header = container.querySelector("header");

    expect(header).toHaveClass("sticky");
  });

  it("renders with proper semantic HTML structure", () => {
    render(<NextHeader />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });

  it("language selector shows current language", () => {
    render(<NextHeader />);
    const languageButton = screen.getByRole("button", {
      name: /language|EN|FI|SV/i,
    });

    expect(languageButton).toBeInTheDocument();
  });

  it("closes mobile menu when a navigation link is clicked", () => {
    render(<NextHeader />);
    const menuButton = screen.getByRole("button", { name: /menu/i });

    fireEvent.click(menuButton);
    expect(
      screen.getByRole("navigation", { name: /mobile/i }),
    ).toBeInTheDocument();

    const homeLink = screen.getAllByText(/navHome/i)[0];
    fireEvent.click(homeLink);

    expect(
      screen.queryByRole("navigation", { name: /mobile/i }),
    ).not.toBeInTheDocument();
  });

  it("renders skip to main content link", () => {
    render(<NextHeader />);
    const skipLink = screen.getByText(/skip to main content/i);

    expect(skipLink).toBeInTheDocument();
  });

  it("logo links to home page", () => {
    render(<NextHeader />);
    const logo = screen.getByRole("link", { name: /logo|home/i });

    expect(logo).toHaveAttribute("href", "/");
  });

  it("applies dark theme class when theme is dark", () => {
    mockUsePersistentTheme.mockReturnValue({
      theme: "dark",
      cycleTheme: mockCycleTheme,
    });

    const { container } = render(<NextHeader />);
    const header = container.querySelector("header");

    expect(header).toHaveClass("dark");
  });

  it("mobile menu has proper accessibility attributes", () => {
    render(<NextHeader />);
    const menuButton = screen.getByRole("button", { name: /menu/i });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  it("renders language options when language selector is clicked", () => {
    render(<NextHeader />);
    const languageButton = screen.getByRole("button", {
      name: /language|EN|FI|SV/i,
    });

    fireEvent.click(languageButton);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Suomi")).toBeInTheDocument();
    expect(screen.getByText("Svenska")).toBeInTheDocument();
  });

  it("closes language menu when option is selected", () => {
    render(<NextHeader />);
    const languageButton = screen.getByRole("button", {
      name: /language|EN|FI|SV/i,
    });

    fireEvent.click(languageButton);
    expect(screen.getByText("English")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Suomi"));
    expect(screen.queryByText("English")).not.toBeInTheDocument();
  });
});
