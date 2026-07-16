import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

type NavigationLike = {
  addEventListener(type: "currententrychange", listener: () => void): void;
  removeEventListener(type: "currententrychange", listener: () => void): void;
};

export type DtPaginationPage = number | "...";

const styles = `
  :host {
    display: block;
    font-family: var(--font-body, var(--font-text, sans-serif));
  }
  :host([hidden]) { display: none; }
  .empty { display: none; }
  .nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-internal-4, 0.25rem);
  }
  .pages {
    display: flex;
    align-items: center;
    gap: var(--space-internal-4, 0.25rem);
  }
  .control,
  .ellipsis {
    box-sizing: border-box;
    display: inline-flex;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--radius-lg, 0.5rem);
    background: transparent;
    color: var(--color-text, CanvasText);
    font: inherit;
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: 1;
  }
  .control {
    cursor: pointer;
    transition:
      background-color var(--duration-fast, 160ms) var(--ease-out-cubic, ease-out),
      color var(--duration-fast, 160ms) var(--ease-out-cubic, ease-out);
  }
  .control:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: 2px;
  }
  .control:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-primary, CanvasText) 10%, transparent);
    color: var(--color-text, CanvasText);
  }
  .control[aria-current="page"] {
    background: var(--color-text, CanvasText);
    color: var(--color-surface-elevated, Canvas);
  }
  .control:disabled {
    color: color-mix(in srgb, var(--color-muted, GrayText) 85%, transparent);
    cursor: not-allowed;
  }
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .icon dt-icon {
    inline-size: 1.25rem;
    block-size: 1.25rem;
  }
  .ellipsis {
    color: var(--color-muted, GrayText);
  }
  @media (prefers-reduced-motion: reduce) {
    .control { transition: none; }
  }
  @media (forced-colors: active) {
    .control,
    .ellipsis {
      color: ButtonText;
      forced-color-adjust: none;
    }
    .control:hover:not(:disabled) {
      background: Canvas;
    }
    .control[aria-current="page"] {
      background: Highlight;
      color: HighlightText;
    }
    .control:disabled {
      color: GrayText;
    }
    .control:focus-visible {
      outline: 3px solid Highlight;
    }
  }
`;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): DtPaginationPage[] {
  const totalPageNumbers = siblingCount * 2 + 3;
  if (totalPages <= totalPageNumbers + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;
  const pages: DtPaginationPage[] = [1];

  if (showLeftDots) pages.push("...");

  for (let page = leftSiblingIndex; page <= rightSiblingIndex; page += 1) {
    if (page !== 1 && page !== totalPages) pages.push(page);
  }

  if (showRightDots) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

export class DtPaginationElement extends DigitaltableteurElement {
  static observedAttributes = [
    "current-page",
    "total-pages",
    "sibling-count",
    "aria-label",
    "previous-label",
    "next-label",
    "page-label",
    "page-param",
    "lang",
  ];

  private optimisticPage: number | null = null;

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
    if (name === "current-page") this.optimisticPage = null;
    if (this.isConnected) this.render();
  }

  get totalPages(): number {
    return positiveInteger(this.getAttribute("total-pages"), 1);
  }

  set totalPages(value: number) {
    reflectAttribute(this, "total-pages", value > 0 ? Math.floor(value) : 1);
  }

  get siblingCount(): number {
    const value = this.getAttribute("sibling-count");
    if (value === null) return 1;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 1;
  }

  set siblingCount(value: number) {
    reflectAttribute(
      this,
      "sibling-count",
      Number.isFinite(value) && value >= 0 ? Math.floor(value) : null,
    );
  }

  get currentPage(): number {
    const controlled = this.getAttribute("current-page");
    const value =
      controlled !== null
        ? positiveInteger(controlled, 1)
        : this.optimisticPage ?? this.pageFromLocation();
    return clamp(value, 1, Math.max(this.totalPages, 1));
  }

  set currentPage(value: number) {
    reflectAttribute(this, "current-page", value > 0 ? Math.floor(value) : 1);
  }

  private get pageParam(): string {
    return stringAttribute(this, "page-param", "page") || "page";
  }

  private readonly handleLocationChange = (): void => {
    this.optimisticPage = null;
    if (!this.hasAttribute("current-page")) this.render();
  };

  private pageFromLocation(): number {
    const view = this.ownerDocument.defaultView;
    if (!view) return 1;
    const params = new URLSearchParams(view.location.search);
    return positiveInteger(params.get(this.pageParam), 1);
  }

  private defaultAriaLabel(): string {
    return localizedText(this, {
      en: "Page navigation",
      fi: "Sivunavigointi",
      sv: "Sidnavigering",
    });
  }

  private previousLabel(): string {
    return (
      stringAttribute(this, "previous-label") ||
      localizedText(this, {
        en: "Previous page",
        fi: "Edellinen sivu",
        sv: "Föregående sida",
      })
    );
  }

  private nextLabel(): string {
    return (
      stringAttribute(this, "next-label") ||
      localizedText(this, {
        en: "Next page",
        fi: "Seuraava sivu",
        sv: "Nästa sida",
      })
    );
  }

  private pageLabel(page: number): string {
    const label = stringAttribute(this, "page-label");
    if (label) return `${label} ${page}`;
    return `${localizedText(this, {
      en: "Page",
      fi: "Sivu",
      sv: "Sida",
    })} ${page}`;
  }

  private buildPageHref(page: number): string {
    const view = this.ownerDocument.defaultView;
    if (!view) return `?${this.pageParam}=${page}`;
    const url = new URL(view.location.href);
    url.searchParams.set(this.pageParam, String(page));
    return `${url.pathname}${url.search}${url.hash}`;
  }

  private requestPageChange(
    nextPage: number,
    trigger: "page" | "previous" | "next",
  ): void {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;

    const page = clamp(nextPage, 1, totalPages);
    const href = this.buildPageHref(page);
    const navigate = new CustomEvent("navigate", {
      detail: { page, href, trigger },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(navigate);

    if (!this.hasAttribute("current-page")) {
      this.optimisticPage = page;
      this.render();
    }

    this.dispatchEvent(
      new CustomEvent("page-change", {
        detail: {
          page,
          previousPage: currentPage,
          href,
          trigger,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private createIcon(name: "arrow-left" | "arrow-right"): HTMLElement {
    const wrapper = this.ownerDocument.createElement("span");
    wrapper.className = "icon";
    wrapper.setAttribute("aria-hidden", "true");
    const icon = this.ownerDocument.createElement("dt-icon");
    icon.setAttribute("name", name);
    icon.setAttribute("size", "sm");
    icon.setAttribute("aria-label", "");
    wrapper.append(icon);
    return wrapper;
  }

  private createControl(params: {
    label: string;
    disabled?: boolean;
    current?: boolean;
    page?: number;
    trigger: "page" | "previous" | "next";
    content: Node | string;
  }): HTMLButtonElement {
    const button = this.ownerDocument.createElement("button");
    button.type = "button";
    button.className = "control";
    button.setAttribute("part", "control");
    button.setAttribute("aria-label", params.label);
    if (params.current) button.setAttribute("aria-current", "page");
    if (params.disabled) {
      button.disabled = true;
    } else if (typeof params.page === "number") {
      button.addEventListener("click", () =>
        this.requestPageChange(params.page as number, params.trigger),
      );
    }
    if (typeof params.content === "string") button.textContent = params.content;
    else button.append(params.content);
    return button;
  }

  private render(): void {
    if (this.totalPages <= 1) {
      const empty = this.ownerDocument.createElement("div");
      empty.className = "empty";
      this.replaceShadow(styles, empty);
      return;
    }

    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const pages = generatePaginationRange(
      currentPage,
      totalPages,
      this.siblingCount,
    );

    const nav = this.ownerDocument.createElement("nav");
    nav.className = "nav";
    nav.setAttribute("part", "root");
    nav.setAttribute(
      "aria-label",
      stringAttribute(this, "aria-label") || this.defaultAriaLabel(),
    );

    nav.append(
      this.createControl({
        label: this.previousLabel(),
        disabled: currentPage <= 1,
        page: currentPage - 1,
        trigger: "previous",
        content: this.createIcon("arrow-left"),
      }),
    );

    const pagesWrapper = this.ownerDocument.createElement("div");
    pagesWrapper.className = "pages";
    pagesWrapper.setAttribute("part", "pages");

    pages.forEach((page, index) => {
      if (page === "...") {
        const ellipsis = this.ownerDocument.createElement("span");
        ellipsis.className = "ellipsis";
        ellipsis.setAttribute("aria-hidden", "true");
        ellipsis.setAttribute("part", "ellipsis");
        ellipsis.textContent = "…";
        pagesWrapper.append(ellipsis);
        return;
      }

      pagesWrapper.append(
        this.createControl({
          label: this.pageLabel(page),
          current: page === currentPage,
          page,
          trigger: "page",
          content: String(page),
        }),
      );
    });

    nav.append(pagesWrapper);
    nav.append(
      this.createControl({
        label: this.nextLabel(),
        disabled: currentPage >= totalPages,
        page: currentPage + 1,
        trigger: "next",
        content: this.createIcon("arrow-right"),
      }),
    );

    this.replaceShadow(styles, nav);
  }
}
