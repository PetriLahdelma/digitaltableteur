import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SIDES = ["top", "right", "bottom", "left"] as const;
const ALIGNS = ["start", "center", "end"] as const;
const URL_PARSE_BASE = "https://example.invalid";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const TYPEAHEAD_RESET_MS = 500;

let menuIdSequence = 0;

export type DtMenuSide = (typeof SIDES)[number];
export type DtMenuAlign = (typeof ALIGNS)[number];

export interface DtMenuItem {
  id?: string;
  value?: string;
  label?: string;
  icon?: string;
  /** @deprecated Use `meta`. Falls back to `meta` when both are set. */
  trailing?: string;
  /** End-aligned secondary text, exposed to AT via dt-list-item's meta part. */
  meta?: string;
  /** Destructive actions (deletions) get the error treatment. */
  tone?: "neutral" | "destructive";
  href?: string;
  disabled?: boolean;
  separator?: boolean;
  children?: DtMenuItem[];
}

const styles = `
  :host {
    display: inline-flex;
    position: relative;
    vertical-align: middle;
    font-family: var(--font-text, var(--primary-body-font, sans-serif));
  }
  :host([hidden]) { display: none; }
  .wrapper { position: relative; display: inline-flex; align-items: center; }
  .fallbackTrigger {
    display: inline-flex;
    padding: var(--space-internal-8) var(--space-internal-16);
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-primary);
    color: var(--color-white);
    font: inherit;
    cursor: pointer;
  }
  .fallbackTrigger:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: 2px;
  }
  .panel {
    position: absolute;
    z-index: 6000;
    display: flex;
    /* React's global reset makes the panel border-box, so its 11rem minimum
       includes padding and border; shadow DOM gets no reset. */
    box-sizing: border-box;
    min-inline-size: 11rem;
    padding: var(--space-internal-4);
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-white);
    box-shadow: var(--shadow-lg, 0 12px 32px rgb(0 0 0 / 12%));
  }
  .panel[hidden] { display: none; }
  .itemWrap { position: relative; display: flex; }
  /* Shell only: the composed dt-list-item row owns all body visuals
     (padding, colors, highlight/disabled treatment), same split as the
     React side's Radix item shell + <ListItem>. */
  .item {
    display: flex;
    padding: 0;
    /* The control is a flex child of .itemWrap: without an explicit fill it
       hugs its content and the row highlight shrinks with it (regressed
       twice; first fixed in #1230). */
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    border: none;
    border-radius: var(--radius-md);
    outline: none;
    background: none;
    /* Shadow buttons keep the UA font (13.33px Arial) — without this reset
       the composed dt-list-item row inherits it instead of the document's
       Satoshi (parity gate catch, 2026-08-07). */
    font: inherit;
    text-align: start;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    user-select: none;
  }
  .item > dt-list-item {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
  }
  .item[aria-disabled="true"] {
    cursor: not-allowed;
  }
  /* Focus is signalled by the highlighted row background (kept in sync by
     highlightControl), matching the React/Radix menu; no extra ring.
     !important: the app's global :focus-visible outline (document context)
     otherwise beats this ::slotted declaration and draws a ring. */
  .item:focus-visible,
  .slotHost::slotted([data-dt-menu-item]:focus-visible) {
    outline: none !important;
  }
  /* Slotted consumer items (declarative light-DOM children) render their own
     body visuals directly. CASCADE TRAP: for slotted elements, normal
     declarations from the outer document tree beat ::slotted() declarations
     from the shadow tree — context is resolved BEFORE specificity — so the
     site's universal reset (Tailwind preflight: * { margin/padding: 0 } plus
     button { font: inherit; color: inherit; border-radius: 0;
     background-color: transparent }) silently strips these body visuals.
     Only !important flips the order (important inner beats important/normal
     outer), so every declaration the preflight also declares is marked
     !important below. */
  .slotHost::slotted([data-dt-menu-item]) {
    display: flex;
    box-sizing: border-box;
    min-block-size: 2.5rem;
    padding-block: var(--space-internal-8) !important;
    padding-inline: var(--space-internal-12) !important;
    flex: 1 1 auto;
    inline-size: 100%;
    align-items: center;
    gap: var(--space-internal-8);
    border: none;
    border-radius: var(--radius-md) !important;
    outline: none;
    background: none;
    color: var(--color-dark) !important;
    font: inherit;
    font-size: var(--font-size-text-s) !important;
    line-height: var(--line-height-normal) !important;
    text-align: start;
    text-decoration: none !important;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  .slotHost::slotted([data-dt-menu-item][data-highlighted="true"]) {
    background: var(--color-neutral-bg) !important;
    color: var(--color-dark) !important;
  }
  .slotHost::slotted([data-dt-menu-item][aria-disabled="true"]) {
    color: var(--color-muted) !important;
    cursor: not-allowed;
  }
  .submenuPanel {
    inset-block-start: 0;
    inset-inline-start: calc(100% + var(--space-internal-4));
  }
  .separator,
  .slotHost::slotted([data-dt-menu-separator]) {
    display: block;
    /* !important: the preflight's * { margin: 0 } otherwise cancels the
       full-bleed negative inline margins on the slotted separator. */
    margin-block: var(--space-internal-4) !important;
    margin-inline: calc(-1 * var(--space-internal-4)) !important;
    block-size: 1px;
    background: var(--color-border);
  }
  @media (hover: hover) and (pointer: fine) {
    .slotHost::slotted([data-dt-menu-item]:not([aria-disabled="true"]):hover) {
      background: var(--color-neutral-bg) !important;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .panel { scroll-behavior: auto; }
  }
  @media (forced-colors: active) {
    .panel {
      border-color: CanvasText;
      background: Canvas;
      box-shadow: none;
      forced-color-adjust: none;
    }
    .slotHost::slotted([data-dt-menu-item]) {
      color: CanvasText !important;
    }
    .slotHost::slotted([data-dt-menu-item][data-highlighted="true"]) {
      background: Highlight !important;
      color: HighlightText !important;
    }
    .separator,
    .slotHost::slotted([data-dt-menu-separator]) {
      background: CanvasText;
    }
    .slotHost::slotted([data-dt-menu-item][aria-disabled="true"]) {
      color: GrayText !important;
    }
  }
`;

type ManagedAttributes = {
  role: string | null;
  tabIndex: string | null;
  ariaDisabled: string | null;
  ariaHaspopup: string | null;
  ariaExpanded: string | null;
  dataItem: string | null;
  dataSeparator: string | null;
  dataPanelId: string | null;
};

function cloneMenuItem(item: DtMenuItem): DtMenuItem {
  return {
    ...item,
    children: item.children?.map(cloneMenuItem),
  };
}

function safeHref(value: string): string {
  const href = value.trim();
  if (!href) return "#";
  if (href.startsWith("//")) return "#";
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
    const protocol = new URL(href, URL_PARSE_BASE).protocol;
    return ALLOWED_PROTOCOLS.has(protocol) ? href : "#";
  } catch {
    return "#";
  }
}

function itemKey(item: DtMenuItem, path: string): string {
  return item.id || item.value || item.label || path;
}

function itemValue(item: DtMenuItem): string | null {
  return item.value || item.id || item.href || item.label || null;
}

export class DtMenuElement extends DigitaltableteurElement {
  static observedAttributes = [
    "side",
    "align",
    "side-offset",
    "open",
    "default-open",
    "modal",
    "items",
  ];

  private assignedItems: DtMenuItem[] | null = null;
  private initialized = false;
  private openState = false;
  private openSubmenuPath: string | null = null;
  private syncingOpenAttribute = false;
  private managedTrigger: HTMLElement | null = null;
  private managedTriggerAttributes: {
    ariaHaspopup: string | null;
    ariaExpanded: string | null;
    ariaControls: string | null;
  } | null = null;
  private managedSlottedItems = new Map<HTMLElement, ManagedAttributes>();
  private typeaheadBuffer = "";
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly menuId = `dt-menu-${++menuIdSequence}`;

  connectedCallback(): void {
    if (!this.initialized) {
      this.openState =
        this.hasAttribute("open") ||
        (!this.hasAttribute("open") && this.hasAttribute("default-open"));
      this.initialized = true;
    }
    this.observeLightDom(() => this.render());
    this.addEventListener("keydown", this.handleKeydown);
    this.render();
    if (this.openState) this.attachDismissListeners();
  }

  disconnectedCallback(): void {
    this.detachDismissListeners();
    this.removeEventListener("keydown", this.handleKeydown);
    this.releaseManagedTrigger();
    this.restoreSlottedItems();
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    const wasOpen = this.openState;
    if (name === "items") this.assignedItems = null;
    if (name === "open" && !this.syncingOpenAttribute) {
      this.openState = this.hasAttribute("open");
    }
    if (
      name === "default-open" &&
      !this.hasAttribute("open") &&
      !this.syncingOpenAttribute
    ) {
      this.openState = this.hasAttribute("default-open");
    }
    if (!this.openState) this.openSubmenuPath = null;
    if (this.isConnected) {
      if (wasOpen !== this.openState) {
        if (this.openState) this.attachDismissListeners();
        else this.detachDismissListeners();
      }
      this.render();
    }
  }

  get side(): DtMenuSide {
    return enumAttribute(this, "side", SIDES, "bottom");
  }
  set side(value: DtMenuSide) {
    reflectAttribute(this, "side", value);
  }

  get align(): DtMenuAlign {
    return enumAttribute(this, "align", ALIGNS, "start");
  }
  set align(value: DtMenuAlign) {
    reflectAttribute(this, "align", value);
  }

  get sideOffset(): number {
    const value = Number(this.getAttribute("side-offset"));
    return Number.isFinite(value) ? value : 6;
  }
  set sideOffset(value: number) {
    reflectAttribute(this, "side-offset", value);
  }

  get open(): boolean {
    return this.openState;
  }
  set open(value: boolean) {
    this.updateOpen(value);
  }

  get defaultOpen(): boolean {
    return this.hasAttribute("default-open");
  }
  set defaultOpen(value: boolean) {
    reflectBooleanAttribute(this, "default-open", value);
  }

  get modal(): boolean {
    return this.hasAttribute("modal");
  }
  set modal(value: boolean) {
    reflectBooleanAttribute(this, "modal", value);
  }

  get items(): DtMenuItem[] {
    return this.assignedItems ?? this.parseItemsAttribute();
  }
  set items(value: DtMenuItem[]) {
    this.assignedItems = value.map(cloneMenuItem);
    if (this.isConnected) this.render();
  }

  private get hasDeclarativeItems(): boolean {
    return hasDefaultSlotContent(this);
  }

  private parseItemsAttribute(): DtMenuItem[] {
    const source = this.getAttribute("items");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      return this.parseItemsArray(parsed);
    } catch {
      return [];
    }
  }

  private parseItemsArray(value: unknown): DtMenuItem[] {
    if (!Array.isArray(value)) return [];
    const items: DtMenuItem[] = [];
    value.forEach((entry, index) => {
      if (!entry || typeof entry !== "object") return [];
      const record = entry as Record<string, unknown>;
      const separator = record.separator === true;
      if (separator) {
        items.push({ separator: true, id: `separator-${index}` });
        return;
      }
      if (typeof record.label !== "string") return;
      items.push({
        id: typeof record.id === "string" ? record.id : undefined,
        value: typeof record.value === "string" ? record.value : undefined,
        label: record.label,
        icon: typeof record.icon === "string" ? record.icon : undefined,
        trailing:
          typeof record.trailing === "string" ? record.trailing : undefined,
        meta: typeof record.meta === "string" ? record.meta : undefined,
        tone: record.tone === "destructive" ? "destructive" : undefined,
        href: typeof record.href === "string" ? record.href : undefined,
        disabled: record.disabled === true,
        separator: false,
        children: this.parseItemsArray(record.children),
      });
    });
    return items;
  }

  private releaseManagedTrigger(): void {
    if (!this.managedTrigger || !this.managedTriggerAttributes) return;
    const values = this.managedTriggerAttributes;
    for (const [name, value] of [
      ["aria-haspopup", values.ariaHaspopup],
      ["aria-expanded", values.ariaExpanded],
      ["aria-controls", values.ariaControls],
    ] as const) {
      if (value === null) this.managedTrigger.removeAttribute(name);
      else this.managedTrigger.setAttribute(name, value);
    }
    this.managedTrigger.removeEventListener("click", this.handleTriggerClick);
    this.managedTrigger.removeEventListener(
      "keydown",
      this.handleTriggerKeydown,
    );
    this.managedTrigger = null;
    this.managedTriggerAttributes = null;
  }

  private syncTrigger(): void {
    this.releaseManagedTrigger();
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(
      'slot[name="trigger"]',
    );
    const trigger = slot?.assignedElements()[0];
    if (!(trigger instanceof HTMLElement)) return;
    this.managedTrigger = trigger;
    this.managedTriggerAttributes = {
      ariaHaspopup: trigger.getAttribute("aria-haspopup"),
      ariaExpanded: trigger.getAttribute("aria-expanded"),
      ariaControls: trigger.getAttribute("aria-controls"),
    };
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", this.openState ? "true" : "false");
    trigger.setAttribute("aria-controls", this.menuId);
    trigger.addEventListener("click", this.handleTriggerClick);
    trigger.addEventListener("keydown", this.handleTriggerKeydown);
  }

  private restoreSlottedItems(): void {
    for (const [item, original] of this.managedSlottedItems) {
      for (const [name, value] of [
        ["role", original.role],
        ["tabindex", original.tabIndex],
        ["aria-disabled", original.ariaDisabled],
        ["aria-haspopup", original.ariaHaspopup],
        ["aria-expanded", original.ariaExpanded],
        ["data-dt-menu-item", original.dataItem],
        ["data-dt-menu-separator", original.dataSeparator],
        ["data-dt-menu-panel-id", original.dataPanelId],
      ] as const) {
        if (value === null) item.removeAttribute(name);
        else item.setAttribute(name, value);
      }
      item.removeAttribute("data-highlighted");
    }
    this.managedSlottedItems.clear();
  }

  private syncSlottedItems(): void {
    this.restoreSlottedItems();
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(".slotHost");
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    for (const element of assigned) {
      if (!(element instanceof HTMLElement)) continue;
      const separator =
        element.getAttribute("role") === "separator" ||
        element.hasAttribute("separator") ||
        element.dataset.separator === "true";
      this.managedSlottedItems.set(element, {
        role: element.getAttribute("role"),
        tabIndex: element.getAttribute("tabindex"),
        ariaDisabled: element.getAttribute("aria-disabled"),
        ariaHaspopup: element.getAttribute("aria-haspopup"),
        ariaExpanded: element.getAttribute("aria-expanded"),
        dataItem: element.getAttribute("data-dt-menu-item"),
        dataSeparator: element.getAttribute("data-dt-menu-separator"),
        dataPanelId: element.getAttribute("data-dt-menu-panel-id"),
      });
      if (separator) {
        element.setAttribute("role", "separator");
        element.setAttribute("data-dt-menu-separator", "true");
        element.setAttribute("data-dt-menu-panel-id", "root");
        continue;
      }
      if (!element.hasAttribute("role"))
        element.setAttribute("role", "menuitem");
      element.setAttribute("tabindex", "-1");
      element.setAttribute("data-dt-menu-item", "true");
      element.setAttribute("data-dt-menu-panel-id", "root");
      if (
        this.isDisabledControl(element) &&
        !element.hasAttribute("aria-disabled")
      ) {
        element.setAttribute("aria-disabled", "true");
      }
    }
  }

  private attachDismissListeners(): void {
    this.ownerDocument.addEventListener("pointerdown", this.handlePointerDown);
  }

  private detachDismissListeners(): void {
    this.ownerDocument.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );
  }

  private updateOpen(next: boolean, returnFocus = false): void {
    if (this.openState === next) {
      if (!next && returnFocus) this.focusTrigger();
      return;
    }
    this.openState = next;
    if (!next) this.openSubmenuPath = null;
    this.syncingOpenAttribute = true;
    reflectBooleanAttribute(this, "open", next);
    this.syncingOpenAttribute = false;
    if (next) this.attachDismissListeners();
    else this.detachDismissListeners();
    this.render();
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open: next },
        bubbles: true,
        composed: true,
      }),
    );
    if (!next && returnFocus) this.focusTrigger();
  }

  private focusTrigger(): void {
    const fallback = this.shadowRoot?.querySelector<HTMLButtonElement>(
      ".fallbackTrigger",
    );
    (this.managedTrigger ?? fallback)?.focus();
  }

  private openMenu(focusLast = false): void {
    this.updateOpen(true);
    queueMicrotask(() => {
      this.focusFirstControl(focusLast ? "last" : "first", "root");
    });
  }

  private closeMenu(returnFocus = false): void {
    this.updateOpen(false, returnFocus);
  }

  private isDisabledControl(control: HTMLElement): boolean {
    return (
      control.getAttribute("aria-disabled") === "true" ||
      control.matches(":disabled")
    );
  }

  private slottedItems(): HTMLElement[] {
    return [...this.managedSlottedItems.keys()].filter(
      (item) => item.getAttribute("data-dt-menu-item") === "true",
    );
  }

  private controlsForPanel(panelId: string): HTMLElement[] {
    if (panelId === "root" && this.hasDeclarativeItems) {
      return this.slottedItems().filter(
        (item) => !this.isDisabledControl(item),
      );
    }
    return [
      ...(this.shadowRoot?.querySelectorAll<HTMLElement>(
        `[data-menu-control="true"][data-menu-panel-id="${panelId}"]`,
      ) ?? []),
    ].filter((control) => !this.isDisabledControl(control));
  }

  private controlForPath(path: string): HTMLElement | null {
    return (
      this.shadowRoot?.querySelector<HTMLElement>(
        `[data-menu-path="${path}"]`,
      ) || null
    );
  }

  private focusFirstControl(
    direction: "first" | "last",
    panelId: string,
  ): void {
    const controls = this.controlsForPanel(panelId);
    const control =
      direction === "last" ? (controls.at(-1) ?? null) : (controls[0] ?? null);
    this.highlightControl(control);
    control?.focus();
  }

  private activeControlFromEvent(event?: Event): HTMLElement | null {
    if (event) {
      for (const node of event.composedPath()) {
        if (
          node instanceof HTMLElement &&
          (node.getAttribute("data-menu-control") === "true" ||
            node.getAttribute("data-dt-menu-item") === "true")
        ) {
          return node;
        }
      }
    }
    const shadowActive = this.shadowRoot?.activeElement;
    if (
      shadowActive instanceof HTMLElement &&
      shadowActive.getAttribute("data-menu-control") === "true"
    ) {
      return shadowActive;
    }
    const documentActive = this.ownerDocument.activeElement;
    if (
      documentActive instanceof HTMLElement &&
      this.managedSlottedItems.has(documentActive)
    ) {
      return documentActive;
    }
    return null;
  }

  private panelIdForControl(control: HTMLElement): string {
    return control.getAttribute("data-menu-panel-id") || "root";
  }

  private highlightControl(active: HTMLElement | null): void {
    for (const control of [
      ...(this.shadowRoot?.querySelectorAll<HTMLElement>(
        "[data-highlighted]",
      ) ?? []),
      ...this.slottedItems().filter((item) =>
        item.hasAttribute("data-highlighted"),
      ),
    ]) {
      if (control !== active) {
        control.removeAttribute("data-highlighted");
        // Slotted consumer items have no composed row; querySelector is a
        // harmless no-op for them.
        control.querySelector("dt-list-item")?.removeAttribute("highlighted");
      }
    }
    if (active) {
      active.setAttribute("data-highlighted", "true");
      active.querySelector("dt-list-item")?.setAttribute("highlighted", "");
    }
  }

  private moveFocus(
    delta: number,
    panelId: string,
    active: HTMLElement | null,
  ): void {
    const controls = this.controlsForPanel(panelId);
    if (controls.length === 0) return;
    const currentIndex = active ? controls.indexOf(active) : -1;
    const nextIndex =
      currentIndex === -1
        ? delta > 0
          ? 0
          : controls.length - 1
        : (currentIndex + delta + controls.length) % controls.length;
    const target = controls[nextIndex] ?? null;
    this.highlightControl(target);
    target?.focus();
  }

  private printableKey(event: KeyboardEvent): string | null {
    if (event.ctrlKey || event.metaKey || event.altKey) return null;
    return event.key.length === 1 ? event.key.toLowerCase() : null;
  }

  private handleTypeahead(event: KeyboardEvent, panelId: string): boolean {
    const printable = this.printableKey(event);
    if (!printable) return false;
    const controls = this.controlsForPanel(panelId);
    if (controls.length === 0) return false;
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    this.typeaheadBuffer = `${this.typeaheadBuffer}${printable}`;
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = "";
      this.typeaheadTimer = null;
    }, TYPEAHEAD_RESET_MS);
    const active = this.activeControlFromEvent(event);
    const start = active ? controls.indexOf(active) + 1 : 0;
    const ordered = [...controls.slice(start), ...controls.slice(0, start)];
    const match = ordered.find((control) =>
      (control.getAttribute("data-search-label") || control.textContent || "")
        .trim()
        .toLowerCase()
        .startsWith(this.typeaheadBuffer),
    );
    if (!match) return false;
    event.preventDefault();
    this.highlightControl(match);
    match.focus();
    return true;
  }

  private triggerLabel(): string {
    const slotted = this.managedTrigger?.textContent?.trim();
    return slotted || "Open menu";
  }

  private closeSubmenu(returnFocus = true): void {
    const path = this.openSubmenuPath;
    if (!path) return;
    this.openSubmenuPath = null;
    this.render();
    if (returnFocus) {
      queueMicrotask(() => {
        const trigger = this.controlForPath(path);
        this.highlightControl(trigger);
        trigger?.focus();
      });
    }
  }

  private openSubmenu(path: string): void {
    if (this.openSubmenuPath === path) return;
    this.openSubmenuPath = path;
    this.render();
    queueMicrotask(() => this.focusFirstControl("first", `submenu:${path}`));
  }

  private readonly handlePointerDown = (event: Event): void => {
    if (!this.openState) return;
    if (event.composedPath().includes(this)) return;
    this.closeMenu();
  };

  private readonly handleTriggerClick = (): void => {
    if (this.openState) this.closeMenu();
    else this.openMenu(false);
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!this.openState) this.openMenu(event.key === "ArrowUp");
    else
      this.focusFirstControl(
        event.key === "ArrowUp" ? "last" : "first",
        "root",
      );
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const fromTrigger =
      event.composedPath().includes(this.managedTrigger as EventTarget) ||
      event
        .composedPath()
        .some(
          (node) =>
            node instanceof HTMLElement &&
            node.classList.contains("fallbackTrigger"),
        );
    if (!this.openState) {
      if (
        fromTrigger &&
        (event.key === "ArrowDown" || event.key === "ArrowUp")
      ) {
        this.handleTriggerKeydown(event);
      }
      return;
    }

    const active = this.activeControlFromEvent(event);
    const panelId = active ? this.panelIdForControl(active) : "root";
    const parentPath = panelId.startsWith("submenu:")
      ? panelId.slice("submenu:".length)
      : null;

    if (event.key === "Escape") {
      event.preventDefault();
      if (parentPath) this.closeSubmenu(true);
      else this.closeMenu(true);
      return;
    }

    if (event.key === "Tab") {
      if (this.modal) {
        event.preventDefault();
        this.moveFocus(event.shiftKey ? -1 : 1, panelId, active);
        return;
      }
      this.ownerDocument.defaultView?.setTimeout(() => this.closeMenu(), 0);
      return;
    }

    if (this.handleTypeahead(event, panelId)) return;

    if (event.key === "Home") {
      event.preventDefault();
      this.focusFirstControl("first", panelId);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      this.focusFirstControl("last", panelId);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.moveFocus(1, panelId, active);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.moveFocus(-1, panelId, active);
      return;
    }
    if (
      event.key === "ArrowRight" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      if (active?.getAttribute("data-has-children") === "true") {
        event.preventDefault();
        const path = active.getAttribute("data-menu-path");
        if (path) this.openSubmenu(path);
      }
      return;
    }
    if (event.key === "ArrowLeft" && parentPath) {
      event.preventDefault();
      this.closeSubmenu(true);
    }
  };

  private dispatchItemSelect(item: DtMenuItem): void {
    this.dispatchEvent(
      new CustomEvent("item-select", {
        detail: {
          item: cloneMenuItem(item),
          id: item.id ?? null,
          value: itemValue(item),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private activateItem(item: DtMenuItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    this.dispatchItemSelect(item);
    this.closeMenu(true);
  }

  private handleSlottedItemClick = (event: Event): void => {
    const item = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && this.managedSlottedItems.has(node),
      );
    if (!item || item.getAttribute("data-dt-menu-item") !== "true") return;
    if (this.isDisabledControl(item)) {
      event.preventDefault();
      return;
    }
    this.dispatchItemSelect({
      id: item.dataset.id || item.id || undefined,
      value:
        item.dataset.value ||
        item.dataset.id ||
        item.id ||
        item.textContent?.trim() ||
        undefined,
      label:
        item.getAttribute("aria-label") ||
        item.textContent?.trim() ||
        undefined,
      href:
        item instanceof HTMLAnchorElement
          ? item.getAttribute("href") || undefined
          : undefined,
      disabled: false,
    });
    this.closeMenu(true);
  };

  private applyPanelPosition(
    panel: HTMLElement,
    side: DtMenuSide,
    align: DtMenuAlign,
  ): void {
    const offset = `${this.sideOffset}px`;
    panel.style.removeProperty("inset-block-start");
    panel.style.removeProperty("inset-block-end");
    panel.style.removeProperty("inset-inline-start");
    panel.style.removeProperty("inset-inline-end");
    panel.style.removeProperty("translate");

    if (side === "bottom") {
      panel.style.insetBlockStart = `calc(100% + ${offset})`;
      if (align === "start") panel.style.insetInlineStart = "0";
      else if (align === "end") panel.style.insetInlineEnd = "0";
      else {
        panel.style.insetInlineStart = "50%";
        panel.style.translate = "-50% 0";
      }
      return;
    }
    if (side === "top") {
      panel.style.insetBlockEnd = `calc(100% + ${offset})`;
      if (align === "start") panel.style.insetInlineStart = "0";
      else if (align === "end") panel.style.insetInlineEnd = "0";
      else {
        panel.style.insetInlineStart = "50%";
        panel.style.translate = "-50% 0";
      }
      return;
    }
    if (side === "right") {
      panel.style.insetInlineStart = `calc(100% + ${offset})`;
      if (align === "start") panel.style.insetBlockStart = "0";
      else if (align === "end") panel.style.insetBlockEnd = "0";
      else {
        panel.style.insetBlockStart = "50%";
        panel.style.translate = "0 -50%";
      }
      return;
    }
    panel.style.insetInlineEnd = `calc(100% + ${offset})`;
    if (align === "start") panel.style.insetBlockStart = "0";
    else if (align === "end") panel.style.insetBlockEnd = "0";
    else {
      panel.style.insetBlockStart = "50%";
      panel.style.translate = "0 -50%";
    }
  }

  /**
   * Builds the composed row for a menu control: a `<dt-list-item>` carrying
   * the visual treatment (padding, colors, highlight/disabled states), same
   * as the React side's `<ListItem>` inside a Radix item shell. The submenu
   * chevron is the one exception — it rides the row's `trailing-icon` slot
   * instead of the `meta` attribute, matching `MenuSubTrigger`'s
   * `trailingIcon` prop.
   */
  private renderItemBody(
    item: DtMenuItem,
    trailingOverride?: Node,
  ): HTMLElement {
    const row = this.ownerDocument.createElement("dt-list-item");
    row.setAttribute("data-menu-row", "true");
    if (item.label) row.setAttribute("label", item.label);
    if (item.icon) row.setAttribute("icon", item.icon);
    if (item.tone === "destructive") row.setAttribute("tone", "destructive");
    if (item.disabled) row.setAttribute("disabled", "");
    if (trailingOverride) {
      const trailing =
        trailingOverride instanceof HTMLElement
          ? trailingOverride
          : this.ownerDocument.createElement("span");
      if (!(trailingOverride instanceof HTMLElement))
        trailing.append(trailingOverride);
      trailing.setAttribute("slot", "trailing-icon");
      row.append(trailing);
    } else {
      const meta = item.meta ?? item.trailing;
      if (meta) row.setAttribute("meta", meta);
    }
    return row;
  }

  private renderPanel(
    items: DtMenuItem[],
    panelId: string,
    parentPath: string | null,
  ): HTMLElement {
    const panel = this.ownerDocument.createElement("div");
    panel.className = `panel${parentPath ? " submenuPanel" : ""}`;
    panel.setAttribute("part", parentPath ? "submenu" : "menu");
    panel.setAttribute("role", "menu");
    panel.id = parentPath ? `${this.menuId}-${panelId}` : this.menuId;
    panel.hidden = parentPath
      ? this.openSubmenuPath !== parentPath
      : !this.openState;

    for (const [index, item] of items.entries()) {
      const path = parentPath ? `${parentPath}-${index}` : `${index}`;
      if (item.separator) {
        const separator = this.ownerDocument.createElement("div");
        separator.className = "separator";
        separator.setAttribute("part", "separator");
        separator.setAttribute("role", "separator");
        panel.append(separator);
        continue;
      }

      const children =
        item.children?.filter((child) => !child.separator) ?? [];
      const hasChildren = children.length > 0;
      const wrapper = this.ownerDocument.createElement("div");
      wrapper.className = "itemWrap";
      const control =
        item.href && !hasChildren
          ? this.ownerDocument.createElement("a")
          : this.ownerDocument.createElement("button");
      control.className = "item";
      control.setAttribute("part", "menu-item");
      control.setAttribute("role", "menuitem");
      // Non-modal menus must not trap Tab: items are focused programmatically, so
      // keep them out of the native tab order (matches the slotted-item path). Tab
      // then exits the menu naturally instead of stepping to the next menu item.
      control.setAttribute("tabindex", "-1");
      control.setAttribute("data-menu-control", "true");
      control.setAttribute("data-menu-panel-id", panelId);
      control.setAttribute("data-menu-path", path);
      control.setAttribute("data-search-label", item.label || "");
      if (item.disabled) control.setAttribute("aria-disabled", "true");
      if (hasChildren) {
        control.setAttribute("data-has-children", "true");
        control.setAttribute("aria-haspopup", "menu");
        control.setAttribute(
          "aria-expanded",
          this.openSubmenuPath === path ? "true" : "false",
        );
      }

      if (control instanceof HTMLButtonElement) {
        control.type = "button";
        control.disabled = item.disabled === true;
      } else if (item.href) {
        control.href = safeHref(item.href);
      }

      control.append(
        this.renderItemBody(
          item,
          hasChildren
            ? (() => {
                const caret = this.ownerDocument.createElement("dt-icon");
                caret.setAttribute("name", "caret-right");
                caret.setAttribute("aria-hidden", "true");
                return caret;
              })()
            : undefined,
        ),
      );

      control.addEventListener("focus", () => this.highlightControl(control));
      control.addEventListener("mouseenter", () => {
        this.highlightControl(control);
        if (hasChildren) {
          this.openSubmenuPath = path;
          this.render();
        } else if (panelId === "root" && this.openSubmenuPath) {
          this.openSubmenuPath = null;
          this.render();
        }
      });
      if (!hasChildren) {
        control.addEventListener("click", (event) =>
          this.activateItem(item, event),
        );
      }

      wrapper.append(control);
      if (hasChildren) {
        wrapper.append(this.renderPanel(children, `submenu:${path}`, path));
      }
      panel.append(wrapper);
    }

    return panel;
  }

  private renderDeclarativePanel(): HTMLElement {
    const panel = this.ownerDocument.createElement("div");
    panel.className = "panel";
    panel.setAttribute("part", "menu");
    panel.setAttribute("role", "menu");
    panel.id = this.menuId;
    panel.hidden = !this.openState;
    const slot = this.ownerDocument.createElement("slot");
    slot.className = "slotHost";
    slot.addEventListener("slotchange", () => this.syncSlottedItems());
    slot.addEventListener("click", this.handleSlottedItemClick);
    panel.append(slot);
    return panel;
  }

  private render(): void {
    const wrapper = this.ownerDocument.createElement("div");
    wrapper.className = "wrapper";

    const triggerSlot = this.ownerDocument.createElement("slot");
    triggerSlot.name = "trigger";
    triggerSlot.addEventListener("slotchange", () => this.syncTrigger());
    const fallbackTrigger = this.ownerDocument.createElement("button");
    fallbackTrigger.type = "button";
    fallbackTrigger.className = "fallbackTrigger";
    fallbackTrigger.textContent = this.triggerLabel();
    fallbackTrigger.setAttribute("aria-haspopup", "menu");
    fallbackTrigger.setAttribute(
      "aria-expanded",
      this.openState ? "true" : "false",
    );
    fallbackTrigger.setAttribute("aria-controls", this.menuId);
    fallbackTrigger.addEventListener("click", this.handleTriggerClick);
    fallbackTrigger.addEventListener("keydown", this.handleTriggerKeydown);
    triggerSlot.append(fallbackTrigger);
    wrapper.append(triggerSlot);

    const panel = this.hasDeclarativeItems
      ? this.renderDeclarativePanel()
      : this.renderPanel(this.items, "root", null);
    this.applyPanelPosition(panel, this.side, this.align);
    wrapper.append(panel);

    this.replaceShadow(styles, wrapper);
    this.syncTrigger();
    if (this.hasDeclarativeItems) this.syncSlottedItems();
    else this.restoreSlottedItems();
  }
}
