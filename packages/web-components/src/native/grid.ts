import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";

type TrackValue = number | string;

type OriginalPlacement = {
  gridColumn: string;
  gridRow: string;
  hadGridColumn: boolean;
  hadGridRow: boolean;
};

const FORWARDED_ATTRIBUTES = [
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    display: grid;
    inline-size: 100%;
    box-sizing: border-box;
    grid-auto-rows: minmax(6.25rem, auto);
  }
  .responsive {
    grid-template-columns: var(--grid-cols);
    gap: var(--grid-gap);
  }
  slot { display: contents; }
  @media (width >= 768px) {
    .responsive {
      grid-template-columns: var(--grid-cols-tablet, var(--grid-cols));
      gap: var(--grid-gap-tablet, var(--grid-gap));
    }
  }
  @media (width >= 1024px) {
    .responsive {
      grid-template-columns: var(
        --grid-cols-desktop,
        var(--grid-cols-tablet, var(--grid-cols))
      );
      gap: var(--grid-gap-desktop, var(--grid-gap-tablet, var(--grid-gap)));
    }
  }
  @media (width >= 1440px) {
    .responsive {
      grid-template-columns: var(
        --grid-cols-wide,
        var(--grid-cols-desktop, var(--grid-cols-tablet, var(--grid-cols)))
      );
      gap: var(
        --grid-gap-wide,
        var(--grid-gap-desktop, var(--grid-gap-tablet, var(--grid-gap)))
      );
    }
  }
  @media (width >= 1920px) {
    .responsive {
      grid-template-columns: var(
        --grid-cols-ultra,
        var(
          --grid-cols-wide,
          var(--grid-cols-desktop, var(--grid-cols-tablet, var(--grid-cols)))
        )
      );
      gap: var(
        --grid-gap-ultra,
        var(
          --grid-gap-wide,
          var(--grid-gap-desktop, var(--grid-gap-tablet, var(--grid-gap)))
        )
      );
    }
  }
`;

function numberLike(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}

function trackAttribute(
  element: Element,
  name: string,
  fallback?: TrackValue,
): TrackValue | undefined {
  const value = element.getAttribute(name)?.trim();
  if (!value) return fallback;
  return numberLike(value) ? Number(value) : value;
}

function positiveIntegerAttribute(
  element: Element,
  name: string,
): number | null {
  const value = element.getAttribute(name)?.trim();
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
}

function toResponsiveTemplate(value: TrackValue): string {
  return typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;
}

function toLegacyTemplate(value: TrackValue): string {
  return typeof value === "number" ? `repeat(${value}, 1fr)` : value;
}

function setStyleProperty(
  element: HTMLElement,
  property: string,
  value: string | null,
): void {
  if (value === null) element.style.removeProperty(property);
  else element.style.setProperty(property, value);
}

export class DtGridElement extends DigitaltableteurElement {
  static observedAttributes = [
    "columns",
    "tablet-columns",
    "desktop-columns",
    "wide-columns",
    "ultra-columns",
    "rows",
    "gap",
    "tablet-gap",
    "desktop-gap",
    "wide-gap",
    "ultra-gap",
    "row-gap",
    "col-gap",
    "align",
    "justify",
    ...FORWARDED_ATTRIBUTES,
  ];

  private childObserver?: MutationObserver;
  private managedPlacements = new Map<HTMLElement, OriginalPlacement>();

  connectedCallback(): void {
    this.render();
    this.observeChildPlacement();
    this.applyChildPlacement();
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.render();
    this.applyChildPlacement();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.childObserver?.disconnect();
    this.restoreManagedPlacement();
  }

  get columns(): TrackValue {
    return trackAttribute(this, "columns", 1) ?? 1;
  }

  set columns(value: TrackValue) {
    reflectAttribute(this, "columns", value);
  }

  get tabletColumns(): TrackValue | undefined {
    return trackAttribute(this, "tablet-columns");
  }

  set tabletColumns(value: TrackValue | undefined) {
    reflectAttribute(this, "tablet-columns", value ?? null);
  }

  get desktopColumns(): TrackValue | undefined {
    return trackAttribute(this, "desktop-columns");
  }

  set desktopColumns(value: TrackValue | undefined) {
    reflectAttribute(this, "desktop-columns", value ?? null);
  }

  get wideColumns(): TrackValue | undefined {
    return trackAttribute(this, "wide-columns");
  }

  set wideColumns(value: TrackValue | undefined) {
    reflectAttribute(this, "wide-columns", value ?? null);
  }

  get ultraColumns(): TrackValue | undefined {
    return trackAttribute(this, "ultra-columns");
  }

  set ultraColumns(value: TrackValue | undefined) {
    reflectAttribute(this, "ultra-columns", value ?? null);
  }

  get rows(): TrackValue | undefined {
    return trackAttribute(this, "rows");
  }

  set rows(value: TrackValue | undefined) {
    reflectAttribute(this, "rows", value ?? null);
  }

  get gap(): string {
    return stringAttribute(this, "gap", "1rem");
  }

  set gap(value: string) {
    reflectAttribute(this, "gap", value || null);
  }

  get tabletGap(): string {
    return stringAttribute(this, "tablet-gap");
  }

  set tabletGap(value: string) {
    reflectAttribute(this, "tablet-gap", value || null);
  }

  get desktopGap(): string {
    return stringAttribute(this, "desktop-gap");
  }

  set desktopGap(value: string) {
    reflectAttribute(this, "desktop-gap", value || null);
  }

  get wideGap(): string {
    return stringAttribute(this, "wide-gap");
  }

  set wideGap(value: string) {
    reflectAttribute(this, "wide-gap", value || null);
  }

  get ultraGap(): string {
    return stringAttribute(this, "ultra-gap");
  }

  set ultraGap(value: string) {
    reflectAttribute(this, "ultra-gap", value || null);
  }

  get rowGap(): string {
    return stringAttribute(this, "row-gap");
  }

  set rowGap(value: string) {
    reflectAttribute(this, "row-gap", value || null);
  }

  get colGap(): string {
    return stringAttribute(this, "col-gap");
  }

  set colGap(value: string) {
    reflectAttribute(this, "col-gap", value || null);
  }

  get align(): string {
    return stringAttribute(this, "align");
  }

  set align(value: string) {
    reflectAttribute(this, "align", value || null);
  }

  get justify(): string {
    return stringAttribute(this, "justify");
  }

  set justify(value: string) {
    reflectAttribute(this, "justify", value || null);
  }

  private isResponsive(): boolean {
    return (
      this.tabletColumns !== undefined ||
      this.desktopColumns !== undefined ||
      this.wideColumns !== undefined ||
      this.ultraColumns !== undefined ||
      Boolean(this.tabletGap) ||
      Boolean(this.desktopGap) ||
      Boolean(this.wideGap) ||
      Boolean(this.ultraGap)
    );
  }

  private observeChildPlacement(): void {
    const Observer = this.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;

    this.childObserver?.disconnect();
    this.childObserver = new Observer(() => this.applyChildPlacement());
    this.childObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["span", "row-span", "slot"],
    });
  }

  private directChildren(): HTMLElement[] {
    return [...this.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
  }

  private snapshotPlacement(child: HTMLElement): OriginalPlacement {
    return {
      gridColumn: child.style.getPropertyValue("grid-column"),
      gridRow: child.style.getPropertyValue("grid-row"),
      hadGridColumn: child.style.getPropertyValue("grid-column") !== "",
      hadGridRow: child.style.getPropertyValue("grid-row") !== "",
    };
  }

  private restoreManagedPlacement(): void {
    for (const [child, original] of this.managedPlacements) {
      setStyleProperty(
        child,
        "grid-column",
        original.hadGridColumn ? original.gridColumn : null,
      );
      setStyleProperty(
        child,
        "grid-row",
        original.hadGridRow ? original.gridRow : null,
      );
    }
    this.managedPlacements.clear();
  }

  private applyChildPlacement(): void {
    const children = this.directChildren();
    const currentChildren = new Set(children);

    for (const [child, original] of this.managedPlacements) {
      if (currentChildren.has(child)) continue;
      setStyleProperty(
        child,
        "grid-column",
        original.hadGridColumn ? original.gridColumn : null,
      );
      setStyleProperty(
        child,
        "grid-row",
        original.hadGridRow ? original.gridRow : null,
      );
      this.managedPlacements.delete(child);
    }

    for (const child of children) {
      const span = positiveIntegerAttribute(child, "span");
      const rowSpan = positiveIntegerAttribute(child, "row-span");

      if (span === null && rowSpan === null) {
        const original = this.managedPlacements.get(child);
        if (!original) continue;
        setStyleProperty(
          child,
          "grid-column",
          original.hadGridColumn ? original.gridColumn : null,
        );
        setStyleProperty(
          child,
          "grid-row",
          original.hadGridRow ? original.gridRow : null,
        );
        this.managedPlacements.delete(child);
        continue;
      }

      const original =
        this.managedPlacements.get(child) ?? this.snapshotPlacement(child);
      this.managedPlacements.set(child, original);

      setStyleProperty(
        child,
        "grid-column",
        span === null
          ? original.hadGridColumn
            ? original.gridColumn
            : null
          : `span ${span}`,
      );
      setStyleProperty(
        child,
        "grid-row",
        rowSpan === null
          ? original.hadGridRow
            ? original.gridRow
            : null
          : `span ${rowSpan}`,
      );
    }
  }

  private render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = ["root", this.isResponsive() ? "responsive" : ""]
      .filter(Boolean)
      .join(" ");
    root.setAttribute("part", "root grid");

    const columns = this.columns;
    if (this.isResponsive()) {
      root.style.setProperty("--grid-cols", toResponsiveTemplate(columns));
      if (this.tabletColumns !== undefined) {
        root.style.setProperty(
          "--grid-cols-tablet",
          toResponsiveTemplate(this.tabletColumns),
        );
      }
      if (this.desktopColumns !== undefined) {
        root.style.setProperty(
          "--grid-cols-desktop",
          toResponsiveTemplate(this.desktopColumns),
        );
      }
      if (this.wideColumns !== undefined) {
        root.style.setProperty(
          "--grid-cols-wide",
          toResponsiveTemplate(this.wideColumns),
        );
      }
      if (this.ultraColumns !== undefined) {
        root.style.setProperty(
          "--grid-cols-ultra",
          toResponsiveTemplate(this.ultraColumns),
        );
      }

      root.style.setProperty("--grid-gap", this.gap);
      if (this.tabletGap)
        root.style.setProperty("--grid-gap-tablet", this.tabletGap);
      if (this.desktopGap) {
        root.style.setProperty("--grid-gap-desktop", this.desktopGap);
      }
      if (this.wideGap) root.style.setProperty("--grid-gap-wide", this.wideGap);
      if (this.ultraGap) {
        root.style.setProperty("--grid-gap-ultra", this.ultraGap);
      }
    } else {
      root.style.gridTemplateColumns = toLegacyTemplate(columns);
      root.style.gap = this.gap;
    }

    const rows = this.rows;
    if (rows !== undefined) {
      root.style.gridTemplateRows =
        typeof rows === "number" ? `repeat(${rows}, 1fr)` : rows;
    }
    if (this.rowGap) root.style.rowGap = this.rowGap;
    if (this.colGap) root.style.columnGap = this.colGap;
    if (this.align) root.style.alignItems = this.align;
    if (this.justify) root.style.justifyItems = this.justify;

    for (const attribute of FORWARDED_ATTRIBUTES) {
      const value = this.getAttribute(attribute);
      if (value !== null) root.setAttribute(attribute, value);
    }

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    slot.addEventListener("slotchange", () => this.applyChildPlacement());
    root.append(slot);

    this.replaceShadow(styles, root);
  }
}
