import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb, { type BreadcrumbItem } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders nothing when items array is empty", () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single breadcrumb item without link", () => {
    const items: BreadcrumbItem[] = [{ label: "Home" }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders multiple breadcrumb items with links for non-last items", () => {
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Details" },
    ];
    render(<Breadcrumb items={items} />);

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");

    const productsLink = screen.getByRole("link", { name: "Products" });
    expect(productsLink).toHaveAttribute("href", "/products");

    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Details" }),
    ).not.toBeInTheDocument();
  });

  it("renders separators between items", () => {
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Details" },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const separators = container.querySelectorAll('[class*="separator"]');
    expect(separators).toHaveLength(2);
  });

  it("applies custom aria-label", () => {
    const items: BreadcrumbItem[] = [{ label: "Home" }];
    render(<Breadcrumb items={items} aria-label="Custom breadcrumb" />);
    expect(screen.getByLabelText("Custom breadcrumb")).toBeInTheDocument();
  });

  it("uses default aria-label when not provided", () => {
    const items: BreadcrumbItem[] = [{ label: "Home" }];
    render(<Breadcrumb items={items} />);
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("forwards the underline prop to each link (default always → wavy underline)", () => {
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Current" },
    ];
    render(<Breadcrumb items={items} />);
    // Link owns the wavy underline via its underline="always" default.
    expect(screen.getByRole("link", { name: "Home" }).className).toContain(
      "wavyUnderline",
    );
  });

  it("omits the underline entirely when underline is none", () => {
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Current" },
    ];
    render(<Breadcrumb items={items} underline="none" />);
    expect(
      screen.getByRole("link", { name: "Home" }).className,
    ).not.toContain("wavyUnderline");
  });

  it("renders last item as current page without href", () => {
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Current Page", href: "/current" },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Current Page" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Current Page")).toBeInTheDocument();
  });
});
