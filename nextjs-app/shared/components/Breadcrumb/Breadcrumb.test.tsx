import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Breadcrumb, {
  computeLeadingCount,
  type BreadcrumbItem,
} from "./Breadcrumb";

// The ellipsis dropdown is the Radix-backed Menu (pointer-capture + scrollIntoView).
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

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

describe("computeLeadingCount", () => {
  it("never collapses three or fewer items", () => {
    expect(
      computeLeadingCount({
        itemWidths: [100, 100, 100],
        ellipsisWidth: 40,
        listGap: 0,
        available: 10,
      }),
    ).toBeNull();
  });

  it("shows every item when the full trail fits", () => {
    expect(
      computeLeadingCount({
        itemWidths: [50, 50, 50, 50],
        ellipsisWidth: 40,
        listGap: 0,
        available: 1000,
      }),
    ).toBeNull();
  });

  it("keeps as many leading items as fit before the ellipsis", () => {
    // full = 500 > 340; leading=2 → 200 + 40 + 100 = 340 ≤ 340.
    expect(
      computeLeadingCount({
        itemWidths: [100, 100, 100, 100, 100],
        ellipsisWidth: 40,
        listGap: 0,
        available: 340,
      }),
    ).toBe(2);
  });

  it("still shows first / … / current when nothing else fits", () => {
    expect(
      computeLeadingCount({
        itemWidths: [100, 100, 100, 100, 100],
        ellipsisWidth: 40,
        listGap: 0,
        available: 200,
      }),
    ).toBe(1);
  });

  it("treats an unmeasured trail (zero widths) as show-all", () => {
    expect(
      computeLeadingCount({
        itemWidths: [0, 0, 0, 0, 0],
        ellipsisWidth: 0,
        listGap: 0,
        available: 0,
      }),
    ).toBeNull();
  });
});

describe("Breadcrumb collapse (static maxItems)", () => {
  const longTrail: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Overlays", href: "/components/overlays" },
    { label: "Menu", href: "/components/overlays/menu" },
    { label: "Button" },
  ];

  it("does not collapse when items fit within maxItems", () => {
    render(<Breadcrumb items={longTrail} maxItems={10} />);
    expect(
      screen.queryByRole("button", { name: /hidden breadcrumb/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overlays" })).toBeInTheDocument();
  });

  it("collapses the middle into an ellipsis trigger, keeping first and current", () => {
    render(<Breadcrumb items={longTrail} maxItems={4} />);
    // First (maxItems-2=2) leading links stay visible.
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Components" }),
    ).toBeInTheDocument();
    // The middle links are collapsed (not directly in the trail).
    expect(
      screen.queryByRole("link", { name: "Overlays" }),
    ).not.toBeInTheDocument();
    // Current is always shown as text.
    expect(screen.getByText("Button")).toBeInTheDocument();
    // Ellipsis trigger is present with an accessible name.
    expect(
      screen.getByRole("button", { name: /hidden breadcrumb/i }),
    ).toBeInTheDocument();
  });

  it("reveals the hidden levels as links when the ellipsis menu opens", async () => {
    render(<Breadcrumb items={longTrail} maxItems={4} />);
    await userEvent.click(
      screen.getByRole("button", { name: /hidden breadcrumb/i }),
    );
    expect(
      await screen.findByRole("menuitem", { name: "Overlays" }),
    ).toHaveAttribute("href", "/components/overlays");
    expect(
      screen.getByRole("menuitem", { name: "Menu" }),
    ).toHaveAttribute("href", "/components/overlays/menu");
  });

  it("renders the first item as a house icon while keeping its accessible name", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Article" },
        ]}
        homeIcon
      />,
    );
    // The first link is announced by its label (the icon's accessible name)
    // but shows no text label.
    const first = screen.getByRole("link", { name: "Home" });
    expect(first).toHaveAttribute("href", "/");
    expect(first).not.toHaveTextContent("Home");
    // Other items are unaffected.
    expect(screen.getByRole("link", { name: "Blog" })).toHaveTextContent(
      "Blog",
    );
  });

  it("uses a custom collapseLabel when provided", () => {
    render(
      <Breadcrumb
        items={longTrail}
        maxItems={4}
        collapseLabel="More levels"
      />,
    );
    expect(
      screen.getByRole("button", { name: "More levels" }),
    ).toBeInTheDocument();
  });
});
