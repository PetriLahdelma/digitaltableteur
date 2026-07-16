import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const UNDERLINES = ["always", "hover", "none"] as const;
const URL_PARSE_BASE = "https://example.invalid";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export type DtBreadcrumbItem = {
  label: string;
  href?: string;
};

export type DtBreadcrumbUnderline = (typeof UNDERLINES)[number];

const styles = `
  :host {
    display: block;
    min-inline-size: 0;
    font-family: var(--font-text, var(--font-body, sans-serif));
  }
  :host([hidden]) { display: none; }
  .empty { display: none; }
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-inline-size: 0;
    font-size: 0.95rem;
    white-space: nowrap;
    color: var(--secondary-text-color, var(--color-muted, currentcolor));
  }
  .list {
    display: inline-flex;
    margin: 0;
    padding: 0;
    min-inline-size: 0;
    align-items: baseline;
    gap: 0.25rem;
    list-style: none;
    list-style-type: " ";
  }
  .item {
    display: inline-flex;
    min-inline-size: 0;
    align-items: baseline;
    gap: 0.25rem;
  }
  .item dt-link {
    --link-color: var(--color-primary, currentcolor);
    color: var(--color-primary, currentcolor);
    font-size: inherit;
    font-weight: 500;
  }
  .current {
    color: var(--color-muted, currentcolor);
    font-weight: 400;
  }
  .separator {
    flex: none;
    color: var(--color-border, currentcolor);
    font-size: 0.9rem;
  }
  .homeLink {
    align-self: center;
  }
  .ellipsisHost {
    display: inline-flex;
    position: relative;
    align-items: center;
  }
  .ellipsis {
    display: inline-flex;
    padding: 0;
    align-items: center;
    border: none;
    background: none;
    color: var(--color-primary, currentcolor);
    font: inherit;
    line-height: 1;
    cursor: pointer;
  }
  .ellipsis:focus-visible {
    border-radius: var(--radius-md, 0.375rem);
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: 2px;
  }
  .ellipsisDots,
  .ellipsisCaret {
    display: inline-flex;
    inline-size: 1.25rem;
    justify-content: center;
  }
  .ellipsisDots { font-size: 1.1em; }
  .ellipsisCaret { display: none; }
  .ellipsis[aria-expanded="true"] .ellipsisDots { display: none; }
  .ellipsis[aria-expanded="true"] .ellipsisCaret { display: inline-flex; }
  .menuLink,
  .menuText {
    display: flex;
    min-block-size: 2.5rem;
    padding-block: var(--space-internal-8, 0.5rem);
    padding-inline: var(--space-internal-12, 0.75rem);
    align-items: center;
    border: none;
    border-radius: var(--radius-md, 0.375rem);
    background: transparent;
    color: var(--color-text, CanvasText);
    font: inherit;
    font-size: var(--font-size-text-s, 0.875rem);
    text-align: start;
    text-decoration: none;
  }
  .menuText[aria-disabled="true"] {
    color: var(--color-muted, GrayText);
    cursor: default;
  }
  .measurer {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    visibility: hidden;
    pointer-events: none;
  }
  @media (forced-colors: active) {
    .separator { color: CanvasText; }
    .item dt-link,
    .ellipsis { color: LinkText; forced-color-adjust: none; }
    .current { color: CanvasText; }
    .ellipsis:focus-visible {
      outline: 3px solid Highlight;
    }
  }
`;

function cloneItem(item: DtBreadcrumbItem): DtBreadcrumbItem {
  return { label: item.label, href: item.href };
}

function parseItems(value: string | null): DtBreadcrumbItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as Record<string, unknown>;
      if (typeof item.label !== "string") return [];
      return [
        {
          label: item.label,
          href: typeof item.href === "string" ? item.href : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
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

export function computeLeadingCount(params: {
  itemWidths: number[];
  ellipsisWidth: number;
  listGap: number;
  available: number;
}): number | null {
  const { itemWidths, ellipsisWidth, listGap, available } = params;
  const count = itemWidths.length;
  if (count <= 3) return null;
  if (available <= 0 || itemWidths.some((width) => width <= 0)) return null;

  const fullWidth =
    itemWidths.reduce((sum, width) => sum + width, 0) + listGap * (count - 1);
  if (fullWidth <= available) return null;

  const currentWidth = itemWidths[count - 1];
  for (let leading = count - 2; leading >= 1; leading -= 1) {
    let width = ellipsisWidth + currentWidth + listGap * (leading + 1);
    for (let index = 0; index < leading; index += 1) {
      width += itemWidths[index];
    }
    if (width <= available) return leading;
  }
  return 1;
}

function staticLeadingCount(count: number, maxItems: number): number | null {
  if (count <= maxItems || count <= 3) return null;
  return Math.min(Math.max(1, maxItems - 2), count - 2);
}

export class DtBreadcrumbElement extends DigitaltableteurElement {
  static observedAttributes = [
    "items",
    "aria-label",
    "underline",
    "max-items",
    "collapse-label",
    "home-icon",
    "lang",
  ];

  private assignedItems: DtBreadcrumbItem[] | null = null;
  private autoLeading: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private measureFrame: number | null = null;

  connectedCallback(): void {
    this.render();
    this.attachResizeObserver();
    this.scheduleMeasurement();
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.measureFrame !== null) {
      this.ownerDocument.defaultView?.cancelAnimationFrame(this.measureFrame);
      this.measureFrame = null;
    }
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "items") this.assignedItems = null;
    if (name === "max-items") this.autoLeading = null;
    if (this.isConnected) {
      this.render();
      this.scheduleMeasurement();
    }
  }

  get items(): DtBreadcrumbItem[] {
    return (this.assignedItems ?? parseItems(this.getAttribute("items"))).map(
      cloneItem,
    );
  }

  set items(value: DtBreadcrumbItem[]) {
    this.assignedItems = value
      .filter(
        (item) =>
          item &&
          typeof item.label === "string" &&
          (item.href === undefined || typeof item.href === "string"),
      )
      .map(cloneItem);
    if (this.isConnected) {
      this.render();
      this.scheduleMeasurement();
    }
  }

  get underline(): DtBreadcrumbUnderline {
    return enumAttribute(this, "underline", UNDERLINES, "always");
  }

  set underline(value: DtBreadcrumbUnderline) {
    reflectAttribute(this, "underline", value);
  }

  get maxItems(): number {
    const parsed = Number(this.getAttribute("max-items"));
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }

  set maxItems(value: number) {
    reflectAttribute(this, "max-items", value > 0 ? Math.floor(value) : null);
  }

  get homeIcon(): boolean {
    return this.hasAttribute("home-icon");
  }

  set homeIcon(value: boolean) {
    reflectBooleanAttribute(this, "home-icon", value);
  }

  private attachResizeObserver(): void {
    const Observer = this.ownerDocument.defaultView?.ResizeObserver;
    if (!Observer || this.resizeObserver) return;
    this.resizeObserver = new Observer(() => this.scheduleMeasurement());
    this.resizeObserver.observe(this);
  }

  private scheduleMeasurement(): void {
    if (this.maxItems > 0 || this.items.length <= 3) return;
    const view = this.ownerDocument.defaultView;
    if (!view) return;
    if (this.measureFrame !== null) view.cancelAnimationFrame(this.measureFrame);
    this.measureFrame = view.requestAnimationFrame(() => {
      this.measureFrame = null;
      this.measureOverflow();
    });
  }

  private measureOverflow(): void {
    const root = this.shadowRoot;
    if (!root) return;
    const nav = root.querySelector<HTMLElement>("[data-breadcrumb-root]");
    const measurer = root.querySelector<HTMLOListElement>("[data-measurer]");
    if (!nav || !measurer) return;

    const available = nav.clientWidth;
    const itemWidths = Array.from(
      measurer.querySelectorAll<HTMLElement>("[data-measure-item]"),
    ).map((element) => element.offsetWidth);
    const ellipsisWidth =
      measurer.querySelector<HTMLElement>("[data-measure-ellipsis]")
        ?.offsetWidth ?? 0;
    const gap = Number.parseFloat(
      this.ownerDocument.defaultView
        ?.getComputedStyle(measurer)
        .columnGap.replace("normal", "0") ?? "0",
    );
    const next = computeLeadingCount({
      itemWidths,
      ellipsisWidth,
      listGap: Number.isFinite(gap) ? gap : 0,
      available,
    });
    if (next !== this.autoLeading) {
      this.autoLeading = next;
      this.render();
    }
  }

  private defaultAriaLabel(): string {
    return localizedText(this, {
      en: "Breadcrumb",
      fi: "Murupolku",
      sv: "Brödsmulor",
    });
  }

  private collapseLabel(hiddenCount: number): string {
    if (this.getAttribute("collapse-label")) {
      return stringAttribute(this, "collapse-label");
    }
    const locale = localizedText(this, {
      en: "en",
      fi: "fi",
      sv: "sv",
    });
    if (locale === "fi") {
      return `Näytä ${hiddenCount} piilotettua murupolkutasoa`;
    }
    if (locale === "sv") {
      return `Visa ${hiddenCount} dolda nivåer i brödsmulorna`;
    }
    return `Show ${hiddenCount} hidden breadcrumb${
      hiddenCount === 1 ? "" : "s"
    }`;
  }

  private dispatchNavigate(item: DtBreadcrumbItem, href: string, event: Event) {
    const navigate = new CustomEvent("navigate", {
      detail: { item: cloneItem(item), href },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(navigate)) event.preventDefault();
  }

  private createHomeIcon(label: string): HTMLElement {
    const icon = this.ownerDocument.createElement("dt-icon");
    icon.setAttribute("name", "house");
    icon.setAttribute("size", "sm");
    icon.setAttribute("weight", "bold");
    icon.setAttribute("aria-label", label);
    return icon;
  }

  private createItemNode(
    item: DtBreadcrumbItem,
    index: number,
    isLast: boolean,
  ): HTMLElement {
    const linkable = Boolean(item.href) && !isLast;
    if (this.homeIcon && index === 0) {
      if (linkable) {
        const link = this.ownerDocument.createElement("dt-link");
        link.className = "link homeLink";
        link.setAttribute("href", safeHref(item.href as string));
        link.setAttribute("size", "sm");
        link.setAttribute("underline", "none");
        link.append(this.createHomeIcon(item.label));
        link.addEventListener("click", (event) =>
          this.dispatchNavigate(item, safeHref(item.href as string), event),
        );
        return link;
      }

      const current = this.ownerDocument.createElement("span");
      current.className = "current homeLink";
      if (isLast) current.setAttribute("aria-current", "page");
      current.append(this.createHomeIcon(item.label));
      return current;
    }

    if (linkable) {
      const link = this.ownerDocument.createElement("dt-link");
      link.className = "link";
      link.setAttribute("href", safeHref(item.href as string));
      link.setAttribute("size", "sm");
      link.setAttribute("underline", this.underline);
      link.textContent = item.label;
      link.addEventListener("click", (event) =>
        this.dispatchNavigate(item, safeHref(item.href as string), event),
      );
      return link;
    }

    const current = this.ownerDocument.createElement("span");
    current.className = "current";
    if (isLast) current.setAttribute("aria-current", "page");
    current.textContent = item.label;
    return current;
  }

  private createSeparator(): HTMLElement {
    const separator = this.ownerDocument.createElement("span");
    separator.className = "separator";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "/";
    return separator;
  }

  private createEllipsisMenu(hiddenItems: DtBreadcrumbItem[]): HTMLElement {
    const host = this.ownerDocument.createElement("dt-menu");
    host.className = "ellipsisHost";
    host.setAttribute("side", "bottom");
    host.setAttribute("align", "start");
    host.setAttribute("side-offset", "6");

    const trigger = this.ownerDocument.createElement("button");
    trigger.type = "button";
    trigger.className = "ellipsis";
    trigger.slot = "trigger";
    trigger.setAttribute("aria-label", this.collapseLabel(hiddenItems.length));

    const dots = this.ownerDocument.createElement("span");
    dots.className = "ellipsisDots";
    dots.setAttribute("aria-hidden", "true");
    dots.textContent = "…";

    const caret = this.ownerDocument.createElement("span");
    caret.className = "ellipsisCaret";
    caret.setAttribute("aria-hidden", "true");
    const icon = this.ownerDocument.createElement("dt-icon");
    icon.setAttribute("name", "caret-down");
    icon.setAttribute("rotate", "180");
    icon.setAttribute("size", "sm");
    icon.setAttribute("aria-label", "");
    caret.append(icon);

    trigger.append(dots, caret);
    host.append(trigger);

    hiddenItems.forEach((item, index) => {
      if (item.href) {
        const anchor = this.ownerDocument.createElement("a");
        anchor.className = "menuLink";
        anchor.dataset.dtMenuItem = "true";
        anchor.dataset.id = `hidden-${index}`;
        anchor.href = safeHref(item.href);
        anchor.textContent = item.label;
        anchor.addEventListener("click", (event) =>
          this.dispatchNavigate(item, safeHref(item.href as string), event),
        );
        host.append(anchor);
        return;
      }

      const button = this.ownerDocument.createElement("button");
      button.className = "menuText";
      button.dataset.dtMenuItem = "true";
      button.type = "button";
      button.setAttribute("aria-disabled", "true");
      button.disabled = true;
      button.textContent = item.label;
      host.append(button);
    });

    return host;
  }

  private renderTrail(list: HTMLOListElement, items: DtBreadcrumbItem[]): void {
    const lastIndex = items.length - 1;
    items.forEach((item, index) => {
      const listItem = this.ownerDocument.createElement("li");
      listItem.className = "item";
      listItem.append(this.createItemNode(item, index, index === lastIndex));
      if (index !== lastIndex) listItem.append(this.createSeparator());
      list.append(listItem);
    });
  }

  private renderMeasuredTrail(
    list: HTMLOListElement,
    items: DtBreadcrumbItem[],
  ): void {
    const lastIndex = items.length - 1;
    items.forEach((item, index) => {
      const listItem = this.ownerDocument.createElement("li");
      listItem.className = "item";
      listItem.setAttribute("data-measure-item", "true");
      listItem.append(this.createItemNode(item, index, index === lastIndex));
      if (index !== lastIndex) listItem.append(this.createSeparator());
      list.append(listItem);
    });

    const ellipsisItem = this.ownerDocument.createElement("li");
    ellipsisItem.className = "item";
    ellipsisItem.setAttribute("data-measure-ellipsis", "true");
    const ellipsis = this.ownerDocument.createElement("span");
    ellipsis.className = "ellipsis";
    const dots = this.ownerDocument.createElement("span");
    dots.className = "ellipsisDots";
    dots.textContent = "…";
    ellipsis.append(dots);
    ellipsisItem.append(ellipsis, this.createSeparator());
    list.append(ellipsisItem);
  }

  private render(): void {
    const items = this.items;
    if (items.length === 0) {
      const empty = this.ownerDocument.createElement("div");
      empty.className = "empty";
      this.replaceShadow(styles, empty);
      return;
    }

    const nav = this.ownerDocument.createElement("nav");
    nav.className = "breadcrumb";
    nav.setAttribute("part", "root");
    nav.setAttribute("data-breadcrumb-root", "true");
    nav.setAttribute(
      "aria-label",
      stringAttribute(this, "aria-label") || this.defaultAriaLabel(),
    );

    const list = this.ownerDocument.createElement("ol");
    list.className = "list";
    list.setAttribute("part", "list");

    const staticLeading =
      this.maxItems > 0 ? staticLeadingCount(items.length, this.maxItems) : null;
    const leadingCount = this.maxItems > 0 ? staticLeading : this.autoLeading;
    const lastIndex = items.length - 1;

    if (leadingCount !== null) {
      const leading = items.slice(0, leadingCount);
      const hidden = items.slice(leadingCount, lastIndex);
      const current = items[lastIndex];

      leading.forEach((item, index) => {
        const listItem = this.ownerDocument.createElement("li");
        listItem.className = "item";
        listItem.append(this.createItemNode(item, index, false));
        listItem.append(this.createSeparator());
        list.append(listItem);
      });

      const ellipsisItem = this.ownerDocument.createElement("li");
      ellipsisItem.className = "item";
      ellipsisItem.append(this.createEllipsisMenu(hidden), this.createSeparator());
      list.append(ellipsisItem);

      const currentItem = this.ownerDocument.createElement("li");
      currentItem.className = "item";
      currentItem.append(this.createItemNode(current, lastIndex, true));
      list.append(currentItem);
    } else {
      this.renderTrail(list, items);
    }

    nav.append(list);

    if (this.maxItems === 0 && items.length > 3) {
      const measurer = this.ownerDocument.createElement("ol");
      measurer.className = "list measurer";
      measurer.setAttribute("aria-hidden", "true");
      measurer.setAttribute("inert", "");
      measurer.setAttribute("data-measurer", "true");
      this.renderMeasuredTrail(measurer, items);
      nav.append(measurer);
    }

    this.replaceShadow(styles, nav);
  }
}
