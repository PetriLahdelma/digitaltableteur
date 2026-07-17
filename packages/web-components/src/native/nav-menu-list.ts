import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";

export interface DtNavMenuItem {
  to: string;
  label: string;
  exact?: boolean;
}

/**
 * Structural subset of the Navigation API — typed locally so strict builds
 * don't depend on lib.dom shipping `Window.navigation`.
 */
type NavigationLike = {
  addEventListener(type: "currententrychange", listener: () => void): void;
  removeEventListener(type: "currententrychange", listener: () => void): void;
};

const URL_PARSE_BASE = "https://example.invalid";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const styles = `
  :host {
    display: block;
    font-family: var(--font-text, var(--font-body, sans-serif));
  }
  :host([hidden]) { display: none; }
  .nav {
    display: flex;
    margin: 0;
    padding: 0;
    flex-direction: column;
    gap: var(--dt-nav-menu-gap, var(--space-internal-8, 0.5rem));
    /* The site's global typography (typography.css ul rule) doesn't cross
       the shadow boundary; the React list inherits it. */
    line-height: var(--line-height-relaxed, 1.625);
    list-style: none;
  }
  .navItem { margin: 0; padding: 0; }
  .navLink {
    box-sizing: border-box;
    display: block;
    position: relative;
    inline-size: 100%;
    padding: var(--dt-nav-menu-link-padding, var(--space-internal-12, 0.75rem) var(--space-internal-16, 1rem));
    border-radius: var(--dt-nav-menu-link-radius, 0);
    font: inherit;
    font-size: var(--font-size-text-m, 1rem);
    font-weight: 600;
    letter-spacing: 0.015em;
    text-decoration: none;
    color: var(--primary-text-color, var(--color-text, #111));
    transition: background-color 160ms ease, color 160ms ease;
  }
  .navLink:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: var(--focus-ring-offset, 2px);
  }
  .navLink:hover { background: rgb(0 0 0 / 6%); }
  .navLinkActive {
    margin-inline-end: var(--space-internal-16, 1rem);
    background: rgb(0 0 0 / 8%);
    color: var(--color-primary, currentcolor);
  }
  .navLinkActive::after {
    position: absolute;
    inset: 0;
    border: 1px solid rgb(0 0 0 / 15%);
    border-radius: inherit;
    pointer-events: none;
    content: "";
  }
  @supports (color: color-mix(in srgb, #000, #fff)) {
    .navLink:hover {
      background: color-mix(in srgb, var(--color-primary, #111) 10%, transparent);
    }
    .navLinkActive {
      background: color-mix(in srgb, var(--color-primary, #111) 12%, transparent);
    }
    .navLinkActive::after {
      border-color: color-mix(in srgb, var(--color-primary, #111) 45%, transparent);
    }
  }
  /* Parent-driven active outline, exactly as NavMenuList.module.css. */
  @supports selector(:has(*)) {
    .navItem:has(> .navLink[aria-current="page"]) {
      outline: 2px solid
        color-mix(in srgb, var(--color-primary, #111) 100%, transparent);
      outline-offset: 2px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .navLink { transition: none; }
  }
`;

function cloneItem(item: DtNavMenuItem): DtNavMenuItem {
  return { to: item.to, label: item.label, exact: item.exact };
}

function safeHref(value: string): string {
  const href = value.trim();
  if (!href || href.startsWith("//")) return "#";
  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  ) {
    return href;
  }
  try {
    return ALLOWED_PROTOCOLS.has(new URL(href, URL_PARSE_BASE).protocol)
      ? href
      : "#";
  } catch {
    return "#";
  }
}

export class DtNavMenuListElement extends DigitaltableteurElement {
  static observedAttributes = ["items", "current-path"];

  private assignedItems: DtNavMenuItem[] | null = null;

  /**
   * Uncontrolled-mode guess at the current path after a host-cancelled link
   * click: SPA routers pushState without firing popstate, so until a location
   * event confirms the change this is the only signal the element has.
   */
  private optimisticPath: string | null = null;

  private get navigationApi(): NavigationLike | null {
    const view = this.ownerDocument.defaultView as
      | (Window & { navigation?: NavigationLike })
      | null;
    return view?.navigation ?? null;
  }

  connectedCallback(): void {
    this.ownerDocument.defaultView?.addEventListener(
      "popstate",
      this.handleLocationChange,
    );
    this.navigationApi?.addEventListener(
      "currententrychange",
      this.handleLocationChange,
    );
    this.render();
  }

  disconnectedCallback(): void {
    this.ownerDocument.defaultView?.removeEventListener(
      "popstate",
      this.handleLocationChange,
    );
    this.navigationApi?.removeEventListener(
      "currententrychange",
      this.handleLocationChange,
    );
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "items") this.assignedItems = null;
    if (name === "current-path") this.optimisticPath = null;
    if (this.isConnected) this.render();
  }

  get items(): DtNavMenuItem[] {
    return (this.assignedItems ?? this.parseItemsAttribute()).map(cloneItem);
  }

  set items(value: DtNavMenuItem[]) {
    this.assignedItems = value
      .filter(
        (item) =>
          item && typeof item.to === "string" && typeof item.label === "string",
      )
      .map(cloneItem);
    if (this.isConnected) this.render();
  }

  get currentPath(): string {
    return (
      stringAttribute(this, "current-path") ||
      this.optimisticPath ||
      this.ownerDocument.defaultView?.location.pathname ||
      "/"
    );
  }

  set currentPath(value: string) {
    reflectAttribute(this, "current-path", value || null);
  }

  private readonly handleLocationChange = (): void => {
    this.optimisticPath = null;
    if (!this.hasAttribute("current-path")) this.render();
  };

  private parseItemsAttribute(): DtNavMenuItem[] {
    const source = this.getAttribute("items");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const item = entry as Record<string, unknown>;
        if (typeof item.to !== "string" || typeof item.label !== "string") {
          return [];
        }
        return [{ to: item.to, label: item.label, exact: item.exact === true }];
      });
    } catch {
      return [];
    }
  }

  private isActive(item: DtNavMenuItem): boolean {
    const pathname = this.currentPath;
    return item.exact
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`);
  }

  private render(): void {
    const list = this.ownerDocument.createElement("ul");
    list.className = "nav";
    list.setAttribute("part", "list");

    for (const item of this.items) {
      const active = this.isActive(item);
      const listItem = this.ownerDocument.createElement("li");
      listItem.className = "navItem";
      listItem.setAttribute("part", "item");

      const link = this.ownerDocument.createElement("a");
      link.className = `navLink${active ? " navLinkActive" : ""}`;
      link.setAttribute("part", active ? "link active-link" : "link");
      link.href = safeHref(item.to);
      link.textContent = item.label;
      if (active) link.setAttribute("aria-current", "page");
      link.addEventListener("click", (event) => {
        const approved = this.dispatchEvent(
          new CustomEvent("navigate", {
            detail: { item: cloneItem(item), to: item.to },
            bubbles: true,
            composed: true,
            cancelable: true,
          }),
        );
        if (!approved) {
          event.preventDefault();
          // Host-cancelled = SPA routing; move the highlight now instead of
          // waiting for a popstate that pushState never fires.
          if (!this.hasAttribute("current-path")) {
            this.optimisticPath = item.to;
            this.render();
          }
        }
      });

      listItem.append(link);
      list.append(listItem);
    }

    this.replaceShadow(styles, list);
  }
}
