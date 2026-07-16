import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  DtBreadcrumbElement,
  computeLeadingCount,
} from "../../packages/web-components/src/native/breadcrumb";
import {
  DtPaginationElement,
  generatePaginationRange,
} from "../../packages/web-components/src/native/pagination";
import { DtIconElement } from "../../packages/web-components/src/native/icon";
import { DtLinkElement } from "../../packages/web-components/src/native/link";
import { DtMenuElement } from "../../packages/web-components/src/native/menu";

function defineIfNeeded(
  tagName: string,
  constructor: CustomElementConstructor,
): void {
  if (!customElements.get(tagName)) customElements.define(tagName, constructor);
}

beforeAll(() => {
  defineIfNeeded("dt-icon", DtIconElement);
  defineIfNeeded("dt-link", DtLinkElement);
  defineIfNeeded("dt-menu", DtMenuElement);
  defineIfNeeded("dt-breadcrumb", DtBreadcrumbElement);
  defineIfNeeded("dt-pagination", DtPaginationElement);
});

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute("lang");
  window.history.pushState({}, "", "/");
  delete (window as Window & { navigation?: unknown }).navigation;
});

describe("native Breadcrumb", () => {
  it("renders the current page as plain text and middle href-less items as text", () => {
    const breadcrumb = new DtBreadcrumbElement();
    breadcrumb.items = [
      { label: "Home", href: "/" },
      { label: "Archive" },
      { label: "Article", href: "/article" },
    ];
    document.body.append(breadcrumb);

    const current = breadcrumb.shadowRoot?.querySelectorAll(".current") ?? [];
    const links = breadcrumb.shadowRoot?.querySelectorAll("dt-link") ?? [];
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(current).toHaveLength(2);
    expect(current[0]).toHaveTextContent("Archive");
    expect(current[0]).not.toHaveAttribute("aria-current");
    expect(current[1]).toHaveTextContent("Article");
    expect(current[1]).toHaveAttribute("aria-current", "page");
  });

  it("dispatches cancelable navigate events for visible links", () => {
    const breadcrumb = new DtBreadcrumbElement();
    breadcrumb.items = [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Article" },
    ];
    document.body.append(breadcrumb);

    const navigate = vi.fn((event: Event) => event.preventDefault());
    breadcrumb.addEventListener("navigate", navigate);

    const link = breadcrumb.shadowRoot?.querySelector("dt-link");
    const click = new MouseEvent("click", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    link?.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect((navigate.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      item: { label: "Home", href: "/" },
      href: "/",
    });
  });

  it("collapses long trails into an ellipsis menu when max-items is set", async () => {
    const breadcrumb = new DtBreadcrumbElement();
    breadcrumb.items = [
      { label: "Home", href: "/" },
      { label: "Components", href: "/components" },
      { label: "Overlays", href: "/components/overlays" },
      { label: "Menu", href: "/components/overlays/menu" },
      { label: "Button" },
    ];
    breadcrumb.maxItems = 4;
    document.body.append(breadcrumb);

    const menu = breadcrumb.shadowRoot?.querySelector("dt-menu");
    const trigger = menu?.querySelector("button[slot='trigger']") as
      | HTMLButtonElement
      | undefined;
    expect(trigger).toHaveAttribute("aria-label", "Show 2 hidden breadcrumbs");

    const visibleLabels = Array.from(
      breadcrumb.shadowRoot?.querySelectorAll("dt-link, .current") ?? [],
    ).map((node) => node.textContent?.trim() ?? "");
    expect(visibleLabels).toContain("Home");
    expect(visibleLabels).toContain("Components");
    expect(visibleLabels).toContain("Button");
    expect(visibleLabels).not.toContain("Overlays");

    const hiddenLinks = menu?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
    expect(hiddenLinks).toHaveLength(2);
    expect(hiddenLinks[0]).toHaveTextContent("Overlays");
    expect(hiddenLinks[0]).toHaveAttribute("href", "/components/overlays");
    expect(hiddenLinks[1]).toHaveTextContent("Menu");
  });

  it("renders the first item as a home icon with the original accessible name", () => {
    const breadcrumb = new DtBreadcrumbElement();
    breadcrumb.homeIcon = true;
    breadcrumb.items = [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Article" },
    ];
    document.body.append(breadcrumb);

    const firstLink = breadcrumb.shadowRoot?.querySelector("dt-link");
    const icon = firstLink?.querySelector("dt-icon");
    expect(icon).toHaveAttribute("name", "house");
    expect(icon).toHaveAttribute("aria-label", "Home");
    expect(firstLink?.textContent?.trim()).toBe("");
  });
});

describe("computeLeadingCount", () => {
  it("keeps as many leading items as fit before the ellipsis", () => {
    expect(
      computeLeadingCount({
        itemWidths: [100, 100, 100, 100, 100],
        ellipsisWidth: 40,
        listGap: 0,
        available: 340,
      }),
    ).toBe(2);
  });

  it("returns show-all for unmeasured layouts", () => {
    expect(
      computeLeadingCount({
        itemWidths: [0, 0, 0, 0],
        ellipsisWidth: 0,
        listGap: 0,
        available: 0,
      }),
    ).toBeNull();
  });
});

describe("native Pagination", () => {
  it("renders nothing when total-pages is 1", () => {
    const pagination = new DtPaginationElement();
    pagination.totalPages = 1;
    document.body.append(pagination);

    expect(pagination.shadowRoot?.querySelector("nav")).toBeNull();
  });

  it("marks the current page and disables edge controls", () => {
    const pagination = new DtPaginationElement();
    pagination.currentPage = 1;
    pagination.totalPages = 5;
    document.body.append(pagination);

    const buttons =
      pagination.shadowRoot?.querySelectorAll<HTMLButtonElement>("button") ?? [];
    expect(buttons[0]).toBeDisabled();
    expect(
      pagination.shadowRoot?.querySelector('button[aria-label="Page 1"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  it("dispatches navigate and page-change when a numbered page is activated", async () => {
    const pagination = new DtPaginationElement();
    pagination.currentPage = 2;
    pagination.totalPages = 5;
    document.body.append(pagination);

    const navigate = vi.fn((event: Event) => event.preventDefault());
    const pageChange = vi.fn();
    pagination.addEventListener("navigate", navigate);
    pagination.addEventListener("page-change", pageChange);

    const pageFour = pagination.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Page 4"]',
    );
    await userEvent.click(pageFour as HTMLButtonElement);

    expect((navigate.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      page: 4,
      href: "/?page=4",
      trigger: "page",
    });
    expect((pageChange.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      page: 4,
      previousPage: 2,
      href: "/?page=4",
      trigger: "page",
    });
  });

  it("updates the uncontrolled current page optimistically when a SPA host cancels navigation", async () => {
    const pagination = new DtPaginationElement();
    pagination.totalPages = 9;
    document.body.append(pagination);
    pagination.addEventListener("navigate", (event) => event.preventDefault());

    const pageTwo = pagination.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Page 2"]',
    );
    await userEvent.click(pageTwo as HTMLButtonElement);

    const current = pagination.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-current="page"]',
    );
    expect(current).toHaveAttribute("aria-label", "Page 2");
  });

  it("re-syncs uncontrolled state from location changes", () => {
    const navigationMock = new EventTarget();
    Object.defineProperty(window, "navigation", {
      value: navigationMock,
      configurable: true,
    });

    const pagination = new DtPaginationElement();
    pagination.totalPages = 12;
    document.body.append(pagination);
    pagination.addEventListener("navigate", (event) => event.preventDefault());

    const pageTwo = pagination.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Page 2"]',
    );
    pageTwo?.click();
    expect(
      pagination.shadowRoot?.querySelector('button[aria-current="page"]'),
    ).toHaveAttribute("aria-label", "Page 2");

    window.history.pushState({}, "", "/blog?page=6");
    navigationMock.dispatchEvent(new Event("currententrychange"));

    expect(
      pagination.shadowRoot?.querySelector('button[aria-current="page"]'),
    ).toHaveAttribute("aria-label", "Page 6");
  });

  it("supports keyboard activation on focused controls", async () => {
    const pagination = new DtPaginationElement();
    pagination.totalPages = 5;
    document.body.append(pagination);

    const pageTwo = pagination.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Page 2"]',
    );
    pageTwo?.focus();
    await userEvent.keyboard("{Enter}");

    expect(
      pagination.shadowRoot?.querySelector('button[aria-current="page"]'),
    ).toHaveAttribute("aria-label", "Page 2");
  });
});

describe("generatePaginationRange", () => {
  it("adds ellipsis to long ranges and widens by sibling count", () => {
    expect(generatePaginationRange(25, 50, 1)).toEqual([
      1,
      "...",
      24,
      25,
      26,
      "...",
      50,
    ]);
    expect(generatePaginationRange(10, 20, 2)).toEqual([
      1,
      "...",
      8,
      9,
      10,
      11,
      12,
      "...",
      20,
    ]);
  });
});
