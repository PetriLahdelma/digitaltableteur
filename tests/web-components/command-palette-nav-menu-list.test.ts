import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import {
  DtCommandPaletteElement,
  type DtCommandPaletteItem,
} from "../../packages/web-components/src/native/command-palette";
import {
  DtNavMenuListElement,
  type DtNavMenuItem,
} from "../../packages/web-components/src/native/nav-menu-list";

beforeAll(() => {
  if (!customElements.get("dt-command-palette")) {
    customElements.define("dt-command-palette", DtCommandPaletteElement);
  }
  if (!customElements.get("dt-nav-menu-list")) {
    customElements.define("dt-nav-menu-list", DtNavMenuListElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
  document.body.style.overflow = "";
  vi.restoreAllMocks();
});

function commandItems(): DtCommandPaletteItem[] {
  return [
    {
      id: "home",
      label: "Go to Home",
      keywords: ["start", "index"],
      icon: "arrow-right",
      onSelect: vi.fn(),
    },
    {
      id: "blog",
      label: "Go to Blog",
      keywords: ["articles", "posts"],
      onSelect: vi.fn(),
    },
    { id: "work", label: "Go to Work", onSelect: vi.fn() },
  ];
}

describe("native CommandPalette", () => {
  it("renders an instance-scoped modal combobox and filters labels and keywords", () => {
    const first = new DtCommandPaletteElement();
    const second = new DtCommandPaletteElement();
    first.items = commandItems();
    second.items = commandItems();
    first.open = true;
    second.open = true;
    document.body.append(first, second);

    const firstInput =
      first.shadowRoot?.querySelector<HTMLInputElement>('[role="combobox"]');
    const secondInput =
      second.shadowRoot?.querySelector<HTMLInputElement>('[role="combobox"]');
    expect(first.shadowRoot?.querySelector('[role="dialog"]')).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(firstInput?.getAttribute("aria-controls")).not.toBe(
      secondInput?.getAttribute("aria-controls"),
    );
    expect(first).toHaveAttribute("inert");
    expect(second).not.toHaveAttribute("inert");
    expect(first.shadowRoot?.querySelectorAll('[role="option"]')).toHaveLength(
      3,
    );

    if (!firstInput) throw new Error("Expected command palette input");
    firstInput.value = "articles";
    firstInput.dispatchEvent(
      new Event("input", { bubbles: true, composed: true }),
    );

    const options = first.shadowRoot?.querySelectorAll('[role="option"]') ?? [];
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Go to Blog");
    expect(firstInput.getAttribute("aria-activedescendant")).toBe(
      options[0]?.id,
    );
  });

  it("wraps arrow navigation, selects with Enter, invokes the callback, and closes", () => {
    const palette = new DtCommandPaletteElement();
    const items = commandItems();
    palette.items = items;
    palette.open = true;
    document.body.append(palette);

    const selections = vi.fn();
    const openChanges = vi.fn();
    palette.addEventListener("item-select", selections);
    palette.addEventListener("open-change", openChanges);
    const input = palette.shadowRoot?.querySelector<HTMLInputElement>("input");
    input?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    input?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );

    expect(selections).toHaveBeenCalledTimes(1);
    expect((selections.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject(
      {
        id: "work",
        value: "work",
        item: { id: "work", label: "Go to Work" },
      },
    );
    expect(items[2].onSelect).toHaveBeenCalledTimes(1);
    expect(palette.open).toBe(false);
    expect((openChanges.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      open: false,
      reason: "selection",
    });
  });

  it("keeps controlled state authoritative while emitting dismiss requests", () => {
    const palette = new DtCommandPaletteElement();
    palette.items = commandItems();
    palette.controlled = true;
    palette.open = true;
    document.body.append(palette);
    const dismiss = vi.fn();
    palette.addEventListener("dismiss-request", dismiss);

    const input = palette.shadowRoot?.querySelector<HTMLInputElement>("input");
    input?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect((dismiss.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      reason: "escape",
    });
    expect(palette.open).toBe(true);

    palette.open = false;
    expect(palette.open).toBe(false);
  });

  it("supports backdrop dismissal and cancelable selection", () => {
    const palette = new DtCommandPaletteElement();
    const items = commandItems();
    palette.items = items;
    palette.open = true;
    palette.addEventListener("item-select", (event) => event.preventDefault());
    document.body.append(palette);

    palette.shadowRoot?.querySelector<HTMLElement>('[role="option"]')?.click();
    expect(items[0].onSelect).not.toHaveBeenCalled();
    expect(palette.open).toBe(true);

    palette.shadowRoot
      ?.querySelector<HTMLElement>(".overlay")
      ?.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, composed: true }),
      );
    expect(palette.open).toBe(false);
  });

  it("traps focus, inerts the background, restores focus, and cleans up scroll state", async () => {
    const wrapper = document.createElement("div");
    const before = document.createElement("button");
    before.textContent = "Before";
    const palette = new DtCommandPaletteElement();
    palette.items = commandItems();
    wrapper.append(before, palette);
    document.body.append(wrapper);
    before.focus();
    palette.open = true;

    const input = palette.shadowRoot?.querySelector<HTMLInputElement>("input");
    await waitFor(() => expect(palette.shadowRoot?.activeElement).toBe(input));
    expect(before).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("hidden");

    before.focus();
    before.dispatchEvent(
      new FocusEvent("focusin", { bubbles: true, composed: true }),
    );
    expect(palette.shadowRoot?.activeElement).toBe(input);

    palette.open = false;
    await waitFor(() => expect(before).toHaveFocus());
    expect(before).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");

    palette.open = true;
    palette.remove();
    expect(document.body.style.overflow).toBe("");
  });

  it("accepts serializable items and renders empty text without interpreting markup", () => {
    const palette = new DtCommandPaletteElement();
    palette.setAttribute(
      "items",
      JSON.stringify([{ id: "safe", label: "<strong>Safe text</strong>" }]),
    );
    palette.emptyText = "Nothing here";
    palette.open = true;
    document.body.append(palette);

    const option = palette.shadowRoot?.querySelector('[role="option"]');
    expect(option).toHaveTextContent("<strong>Safe text</strong>");
    expect(option?.querySelector("strong")).toBeNull();

    const input = palette.shadowRoot?.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("Expected command palette input");
    input.value = "missing";
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    expect(
      palette.shadowRoot?.querySelector("[part='empty']"),
    ).toHaveTextContent("Nothing here");
  });
});

const navItems: DtNavMenuItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
];

describe("native NavMenuList", () => {
  it("renders native links with exact and prefix active matching", () => {
    const nav = new DtNavMenuListElement();
    nav.items = navItems;
    nav.currentPath = "/work/client";
    document.body.append(nav);

    const links = nav.shadowRoot?.querySelectorAll("a") ?? [];
    expect(links).toHaveLength(3);
    expect(links[0]).not.toHaveAttribute("aria-current");
    expect(links[1]).toHaveAttribute("aria-current", "page");
    expect(links[1]).toHaveAttribute(
      "part",
      expect.stringContaining("active-link"),
    );

    nav.currentPath = "/";
    expect(nav.shadowRoot?.querySelectorAll("a")[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("emits composed navigation details and lets consumers cancel navigation", () => {
    const nav = new DtNavMenuListElement();
    nav.items = navItems;
    nav.currentPath = "/";
    document.body.append(nav);
    const navigate = vi.fn((event: Event) => event.preventDefault());
    nav.addEventListener("navigate", navigate);

    const link = nav.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a")[1];
    const click = new MouseEvent("click", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    link?.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect((navigate.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      item: { to: "/work", label: "Work", exact: undefined },
      to: "/work",
    });
  });

  it("parses declarative items and blocks unsafe URL schemes", () => {
    const nav = new DtNavMenuListElement();
    nav.setAttribute(
      "items",
      JSON.stringify([
        { to: "javascript:alert(1)", label: "Unsafe" },
        { to: "https://example.com", label: "External" },
      ]),
    );
    document.body.append(nav);

    const links =
      nav.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
    expect(links[0]).toHaveAttribute("href", "#");
    expect(links[1]).toHaveAttribute("href", "https://example.com");
  });

  it("uses the browser pathname when currentPath is not explicitly controlled", () => {
    const nav = new DtNavMenuListElement();
    nav.items = [{ to: "/", label: "Home", exact: true }];
    document.body.append(nav);

    expect(nav.currentPath).toBe(window.location.pathname);
    expect(nav.shadowRoot?.querySelector("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("moves the uncontrolled highlight optimistically when a SPA host cancels navigate", () => {
    const nav = new DtNavMenuListElement();
    nav.items = navItems;
    document.body.append(nav);
    nav.addEventListener("navigate", (event) => event.preventDefault());

    let links = nav.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
    expect(links[0]).toHaveAttribute("aria-current", "page");

    links[1]?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );

    links = nav.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
    expect(links[0]).not.toHaveAttribute("aria-current");
    expect(links[1]).toHaveAttribute("aria-current", "page");
  });

  it("re-syncs the uncontrolled highlight from Navigation API currententrychange", () => {
    const navigationMock = new EventTarget();
    Object.defineProperty(window, "navigation", {
      value: navigationMock,
      configurable: true,
    });
    try {
      const nav = new DtNavMenuListElement();
      nav.items = navItems;
      document.body.append(nav);

      window.history.pushState({}, "", "/about");
      navigationMock.dispatchEvent(new Event("currententrychange"));

      const links =
        nav.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
      expect(links[0]).not.toHaveAttribute("aria-current");
      expect(links[2]).toHaveAttribute("aria-current", "page");
    } finally {
      delete (window as Window & { navigation?: unknown }).navigation;
      window.history.pushState({}, "", "/");
    }
  });
});
