import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const VARIANTS = ["primary", "secondary", "tertiary"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const SURFACES = ["default", "onDark", "onBrand"] as const;
const MENU_ALIGNS = ["start", "end"] as const;
const URL_PARSE_BASE = "https://example.invalid";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const TYPEAHEAD_RESET_MS = 500;

let splitButtonIdSequence = 0;

export type DtSplitButtonVariant = (typeof VARIANTS)[number];
export type DtSplitButtonSize = (typeof SIZES)[number];
export type DtSplitButtonSurface = (typeof SURFACES)[number];
export type DtSplitButtonMenuAlign = (typeof MENU_ALIGNS)[number];

export interface DtSplitButtonOption {
  id?: string;
  value?: string;
  label: string;
  description?: string;
  icon?: string;
  trailingIcon?: string;
  /** Destructive actions (deletions) get the error treatment. */
  tone?: "neutral" | "destructive";
  href?: string;
  disabled?: boolean;
  title?: string;
  children?: DtSplitButtonOption[];
}

const styles = `
  :host {
    display: inline-flex;
    vertical-align: middle;
    font-family: var(--font-text, var(--primary-body-font, sans-serif));
  }
  :host([hidden]) { display: none; }
  .wrapper {
    --btn-accent: var(--color-primary);
    --btn-on-accent: var(--color-white);
    position: relative;
    display: inline-flex;
    align-items: stretch;
    gap: 0;
  }
  .wrapper[data-variant="secondary"] { --btn-border-width: 0.125rem; }
  .wrapper[data-variant="tertiary"] { --btn-border-width: 0; }
  .primary,
  .toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-internal-8);
    border-radius: var(--radius-lg);
    font: inherit;
    font-family: var(--primary-body-font);
    /* React Button wraps its label in a line-height:1 span, so min-block-size
       (not the inherited body line box) decides the control height. */
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out-cubic),
      border-color var(--duration-fast) var(--ease-out-cubic),
      color var(--duration-fast) var(--ease-out-cubic),
      filter var(--duration-fast) var(--ease-out-cubic),
      transform var(--duration-instant) var(--ease-out-cubic);
  }
  .primary:focus-visible,
  .toggle:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: 2px;
  }
  .primary:active:not(:disabled),
  .toggle:active:not(:disabled) {
    transform: scale(0.97);
  }
  .primary { margin-inline-end: -1px; border-end-end-radius: 0; border-start-end-radius: 0; }
  .toggle {
    min-inline-size: 2.75rem;
    padding-inline: var(--space-internal-12);
    border-end-start-radius: 0;
    border-start-start-radius: 0;
  }
  .toggle::before {
    position: absolute;
    inset-block: 0.5rem;
    inset-inline-start: 0;
    inline-size: 1px;
    background: color-mix(in srgb, var(--btn-on-accent) 50%, transparent);
    content: "";
  }
  .secondary.primary { margin-inline-end: -2px; }
  .secondary.toggle::before { content: none; }
  .tertiary.toggle::before {
    background: color-mix(in srgb, var(--btn-accent) 50%, transparent);
  }
  .primary.primaryVariant,
  .toggle.primaryVariant {
    border: 0;
    background: var(--btn-accent);
    color: var(--btn-on-accent);
  }
  .primary.secondaryVariant,
  .toggle.secondaryVariant {
    border: 0.125rem solid var(--btn-accent);
    background: transparent;
    color: var(--btn-accent);
  }
  .primary.tertiaryVariant,
  .toggle.tertiaryVariant {
    border: 0;
    background: transparent;
    color: var(--btn-accent);
  }
  .sm {
    min-block-size: 2rem;
    padding-block: var(--space-internal-4);
    padding-inline: var(--space-internal-12);
    font-size: var(--font-size-button-s);
  }
  .md {
    min-block-size: 2.5rem;
    padding-block: var(--space-internal-8);
    padding-inline: var(--space-internal-16);
    font-size: var(--font-size-button-m);
  }
  .lg {
    min-block-size: 3rem;
    padding-block: var(--space-internal-12);
    padding-inline: var(--space-internal-24);
    font-size: var(--font-size-button-l);
  }
  /* After the size rules, as in Button.module.css: the toggle's narrow
     padding must beat the per-size padding-inline. */
  .toggle { padding-inline: var(--space-internal-12); }
  /* Touch targets: >= 44px on small viewports, matching Button.module.css. */
  @media (width <= 768px) {
    .sm, .md { min-block-size: 2.75rem; }
  }
  .rounded { border-radius: 9999px; }
  .rounded.primary { border-end-end-radius: 0; border-start-end-radius: 0; }
  .rounded.toggle { border-end-start-radius: 0; border-start-start-radius: 0; }
  .primary.onDark.primaryVariant,
  .toggle.onDark.primaryVariant { background: var(--color-white); color: var(--color-primary); }
  .primary.onDark.secondaryVariant,
  .toggle.onDark.secondaryVariant { border-color: var(--color-white); color: var(--color-white); }
  .primary.onDark.tertiaryVariant,
  .toggle.onDark.tertiaryVariant { color: var(--color-white); }
  .primary.onBrand.primaryVariant,
  .toggle.onBrand.primaryVariant { background: var(--logo-color); color: var(--logo-background); }
  .primary.onBrand.secondaryVariant,
  .toggle.onBrand.secondaryVariant { border-color: var(--logo-color); color: var(--logo-color); }
  .primary.onBrand.tertiaryVariant,
  .toggle.onBrand.tertiaryVariant { color: var(--logo-color); }
  .primary:disabled,
  .toggle:disabled { cursor: not-allowed; }
  .primary.primaryVariant:disabled,
  .toggle.primaryVariant:disabled {
    background: var(--color-disabled-bg);
    color: var(--color-muted);
  }
  .primary.secondaryVariant:disabled,
  .primary.tertiaryVariant:disabled,
  .toggle.secondaryVariant:disabled,
  .toggle.tertiaryVariant:disabled {
    border-color: var(--color-primary-disabled);
    color: var(--color-muted);
  }
  .toggle:disabled::before {
    background: color-mix(in srgb, var(--color-muted) 50%, transparent);
  }
  .labelFallback { display: inline-flex; }
  /* 1.5rem matches the React caret Icon box; with md padding it is exactly
     what makes the secondary segments 44px tall (React parity). */
  .caret {
    display: inline-flex;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    align-items: center;
    justify-content: center;
  }
  .menu {
    position: absolute;
    inset-block-start: calc(100% + 0.375rem);
    z-index: 6000;
    display: flex;
    /* React's global reset makes the panel border-box, so its 11rem minimum
       includes padding and border; shadow DOM gets no reset. */
    box-sizing: border-box;
    min-inline-size: 11rem;
    padding: var(--space-internal-4);
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-white);
    box-shadow: 0 12px 32px rgb(0 0 0 / 15%);
  }
  .menu[data-align="end"] { inset-inline-end: 0; }
  .menu[data-align="start"] { inset-inline-start: 0; }
  .menu[hidden] { display: none; }
  .menuWrap { position: relative; display: flex; }
  /* Shell only: the composed dt-list-item row owns all body visuals
     (padding, colors, highlight/disabled treatment), same split as the
     React side's Radix item shell + <ListItem>. */
  .menuItem {
    display: flex;
    padding: 0;
    /* The control is a flex child of .menuWrap: without an explicit fill it
       hugs its content and the row highlight shrinks with it (regressed
       twice; first fixed in #1230). */
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    border: none;
    border-radius: var(--radius-md);
    outline: none;
    background: none;
    text-align: start;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    user-select: none;
  }
  .menuItem > dt-list-item {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
  }
  .menuItem[aria-disabled="true"] {
    cursor: not-allowed;
  }
  /* Focus is signalled by the highlighted row background (kept in sync by
     highlightControl), matching the React/Radix menu; no extra ring. */
  .menuItem:focus-visible {
    outline: none;
  }
  .submenu {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: calc(100% + var(--space-internal-4));
  }
  @media (hover: hover) and (pointer: fine) {
    .primary.primaryVariant:hover,
    .toggle.primaryVariant:hover { filter: brightness(0.94); }
    .primary.secondaryVariant:hover,
    .primary.tertiaryVariant:hover,
    .toggle.secondaryVariant:hover,
    .toggle.tertiaryVariant:hover {
      background: color-mix(in srgb, var(--btn-accent) 10%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .primary,
    .toggle { transition: background-color var(--duration-fast) var(--ease-out-cubic), border-color var(--duration-fast) var(--ease-out-cubic), color var(--duration-fast) var(--ease-out-cubic); }
    .primary:active:not(:disabled),
    .toggle:active:not(:disabled) { transform: none; }
  }
  @media (forced-colors: active) {
    /* The buttons get NO forced-color-adjust: the React Button has none, so
       forced-colors must strip both implementations identically. */
    .menu {
      forced-color-adjust: none;
    }
    .menu {
      border-color: CanvasText;
      background: Canvas;
      box-shadow: none;
    }
    .primary:focus-visible,
    .toggle:focus-visible {
      outline: 3px solid Highlight;
    }
  }
`;

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

function cloneOption(option: DtSplitButtonOption): DtSplitButtonOption {
  return {
    ...option,
    children: option.children?.map(cloneOption),
  };
}

function optionValue(option: DtSplitButtonOption): string | null {
  return option.value || option.id || option.href || option.label;
}

export class DtSplitButtonElement extends DigitaltableteurElement {
  static observedAttributes = [
    "label",
    "options",
    "variant",
    "size",
    "surface",
    "rounded",
    "disabled",
    "toggle-label",
    "menu-align",
    "tooltip",
    "accessible-name",
  ];

  private assignedOptions: DtSplitButtonOption[] | null = null;
  private menuOpen = false;
  private openSubmenuPath: string | null = null;
  private typeaheadBuffer = "";
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;
  private menuCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly menuId = `dt-split-button-menu-${++splitButtonIdSequence}`;

  connectedCallback(): void {
    this.observeLightDom(() => this.render());
    this.addEventListener("keydown", this.handleKeydown);
    this.render();
  }

  disconnectedCallback(): void {
    this.ownerDocument.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );
    this.removeEventListener("keydown", this.handleKeydown);
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    if (this.menuCloseTimer) clearTimeout(this.menuCloseTimer);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "options") this.assignedOptions = null;
    if (this.isConnected) this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get options(): DtSplitButtonOption[] {
    return this.assignedOptions ?? this.parseOptionsAttribute();
  }
  set options(value: DtSplitButtonOption[]) {
    this.assignedOptions = value.map(cloneOption);
    if (this.isConnected) this.render();
  }

  get variant(): DtSplitButtonVariant {
    return enumAttribute(this, "variant", VARIANTS, "primary");
  }
  set variant(value: DtSplitButtonVariant) {
    reflectAttribute(this, "variant", value);
  }

  get size(): DtSplitButtonSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtSplitButtonSize) {
    reflectAttribute(this, "size", value);
  }

  get surface(): DtSplitButtonSurface {
    return enumAttribute(this, "surface", SURFACES, "default");
  }
  set surface(value: DtSplitButtonSurface) {
    reflectAttribute(this, "surface", value);
  }

  get rounded(): boolean {
    return this.hasAttribute("rounded");
  }
  set rounded(value: boolean) {
    reflectBooleanAttribute(this, "rounded", value);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  get toggleLabel(): string {
    return stringAttribute(this, "toggle-label");
  }
  set toggleLabel(value: string) {
    reflectAttribute(this, "toggle-label", value || null);
  }

  get menuAlign(): DtSplitButtonMenuAlign {
    return enumAttribute(this, "menu-align", MENU_ALIGNS, "end");
  }
  set menuAlign(value: DtSplitButtonMenuAlign) {
    reflectAttribute(this, "menu-align", value);
  }

  get tooltip(): string {
    return stringAttribute(this, "tooltip");
  }
  set tooltip(value: string) {
    reflectAttribute(this, "tooltip", value || null);
  }

  get accessibleName(): string {
    return stringAttribute(this, "accessible-name");
  }
  set accessibleName(value: string) {
    reflectAttribute(this, "accessible-name", value || null);
  }

  private get hasLabelSlot(): boolean {
    return hasNamedSlot(this, "label");
  }

  private defaultToggleLabel(): string {
    if (this.toggleLabel) return this.toggleLabel;
    return localizedText(this, {
      en: "More options",
      fi: "Lisää vaihtoehtoja",
      sv: "Fler alternativ",
    });
  }

  private parseOptionsAttribute(): DtSplitButtonOption[] {
    const source = this.getAttribute("options");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      return this.parseOptionsArray(parsed);
    } catch {
      return [];
    }
  }

  private parseOptionsArray(value: unknown): DtSplitButtonOption[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const record = entry as Record<string, unknown>;
      if (typeof record.label !== "string") return [];
      return [
        {
          id: typeof record.id === "string" ? record.id : undefined,
          value: typeof record.value === "string" ? record.value : undefined,
          label: record.label,
          description:
            typeof record.description === "string"
              ? record.description
              : undefined,
          icon: typeof record.icon === "string" ? record.icon : undefined,
          trailingIcon:
            typeof record.trailingIcon === "string"
              ? record.trailingIcon
              : undefined,
          tone: record.tone === "destructive" ? "destructive" : undefined,
          href: typeof record.href === "string" ? record.href : undefined,
          disabled: record.disabled === true,
          title: typeof record.title === "string" ? record.title : undefined,
          children: this.parseOptionsArray(record.children),
        },
      ];
    });
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

  private openMenu(focusLast = false): void {
    if (this.menuOpen) return;
    this.menuOpen = true;
    this.attachDismissListeners();
    this.render();
    queueMicrotask(() =>
      this.focusControl(focusLast ? "last" : "first", "root"),
    );
  }

  private closeMenu(returnFocus = false): void {
    if (!this.menuOpen) {
      if (returnFocus) this.focusToggle();
      return;
    }
    this.menuOpen = false;
    this.openSubmenuPath = null;
    this.detachDismissListeners();
    this.render();
    if (returnFocus) this.focusToggle();
  }

  private focusToggle(): void {
    this.shadowRoot?.querySelector<HTMLButtonElement>(".toggle")?.focus();
  }

  private isDisabledControl(control: HTMLElement): boolean {
    return (
      control.getAttribute("aria-disabled") === "true" ||
      control.matches(":disabled")
    );
  }

  private controlsForPanel(panelId: string): HTMLElement[] {
    return [
      ...(this.shadowRoot?.querySelectorAll<HTMLElement>(
        `[data-menu-control="true"][data-menu-panel-id="${panelId}"]`,
      ) ?? []),
    ].filter((control) => !this.isDisabledControl(control));
  }

  private highlightControl(active: HTMLElement | null): void {
    for (const control of this.shadowRoot?.querySelectorAll<HTMLElement>(
      "[data-highlighted]",
    ) ?? []) {
      if (control !== active) {
        control.removeAttribute("data-highlighted");
        control.querySelector("dt-list-item")?.removeAttribute("highlighted");
      }
    }
    if (active) {
      active.setAttribute("data-highlighted", "true");
      active.querySelector("dt-list-item")?.setAttribute("highlighted", "");
    }
  }

  private focusControl(direction: "first" | "last", panelId: string): void {
    const controls = this.controlsForPanel(panelId);
    const target =
      direction === "last" ? (controls.at(-1) ?? null) : (controls[0] ?? null);
    this.highlightControl(target);
    target?.focus();
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

  private activeControlFromEvent(event?: Event): HTMLElement | null {
    if (event) {
      for (const node of event.composedPath()) {
        if (
          node instanceof HTMLElement &&
          node.getAttribute("data-menu-control") === "true"
        ) {
          return node;
        }
      }
    }
    const active = this.shadowRoot?.activeElement;
    return active instanceof HTMLElement &&
      active.getAttribute("data-menu-control") === "true"
      ? active
      : null;
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
      (control.getAttribute("data-search-label") || "")
        .toLowerCase()
        .startsWith(this.typeaheadBuffer),
    );
    if (!match) return false;
    event.preventDefault();
    this.highlightControl(match);
    match.focus();
    return true;
  }

  private dispatchPrimaryClick(): void {
    this.dispatchEvent(
      new CustomEvent("primary-click", {
        detail: { label: this.currentLabelText() },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchOptionSelect(option: DtSplitButtonOption): void {
    this.dispatchEvent(
      new CustomEvent("option-select", {
        detail: {
          item: cloneOption(option),
          id: option.id ?? null,
          value: optionValue(option),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private currentLabelText(): string {
    if (this.hasLabelSlot) {
      const slot =
        this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]');
      const text = slot
        ?.assignedNodes({ flatten: true })
        .map((node) => node.textContent || "")
        .join("")
        .trim();
      if (text) return text;
    }
    return this.label;
  }

  /**
   * Builds the composed row for a menu option: a `<dt-list-item>` carrying
   * the visual treatment (padding, colors, highlight/disabled states), same
   * as the React side's `<ListItem>` inside a Radix item shell. The submenu
   * chevron is the one exception — it rides the row's `trailing-icon`
   * attribute exactly like an option-supplied `trailingIcon`, matching
   * `MenuSubTrigger`'s `trailingIcon` prop.
   */
  private renderOptionBody(
    option: DtSplitButtonOption,
    trailingCaret = false,
  ): HTMLElement {
    const row = this.ownerDocument.createElement("dt-list-item");
    row.setAttribute("data-menu-row", "true");
    if (option.label) row.setAttribute("label", option.label);
    if (option.icon) row.setAttribute("icon", option.icon);
    if (option.tone === "destructive") row.setAttribute("tone", "destructive");
    if (option.disabled) row.setAttribute("disabled", "");
    if (trailingCaret) {
      row.setAttribute("trailing-icon", "caret-right");
    } else if (option.trailingIcon) {
      row.setAttribute("trailing-icon", option.trailingIcon);
    }
    return row;
  }

  private renderMenuPanel(
    options: DtSplitButtonOption[],
    panelId: string,
    parentPath: string | null,
  ): HTMLElement {
    const panel = this.ownerDocument.createElement("div");
    panel.className = `menu${parentPath ? " submenu" : ""}`;
    panel.setAttribute("part", parentPath ? "submenu" : "menu");
    panel.setAttribute("role", "menu");
    panel.hidden = parentPath
      ? this.openSubmenuPath !== parentPath
      : !this.menuOpen;
    if (!parentPath) {
      panel.id = this.menuId;
      panel.setAttribute("data-align", this.menuAlign);
    }

    for (const [index, option] of options.entries()) {
      const path = parentPath ? `${parentPath}-${index}` : `${index}`;
      const children = option.children ?? [];
      const hasChildren = children.length > 0;
      const wrap = this.ownerDocument.createElement("div");
      wrap.className = "menuWrap";

      const control =
        option.href && !hasChildren
          ? this.ownerDocument.createElement("a")
          : this.ownerDocument.createElement("button");
      control.className = "menuItem";
      control.setAttribute("part", "menu-item");
      control.setAttribute("role", "menuitem");
      // Items are focused programmatically; keep them out of the native tab order
      // so Tab exits the (non-modal) menu instead of stepping between items.
      control.setAttribute("tabindex", "-1");
      control.setAttribute("data-menu-control", "true");
      control.setAttribute("data-menu-panel-id", panelId);
      control.setAttribute("data-menu-path", path);
      control.setAttribute("data-search-label", option.label);
      if (option.title) control.title = option.title;
      if (option.disabled) control.setAttribute("aria-disabled", "true");
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
        control.disabled = option.disabled === true;
      } else if (option.href) {
        control.href = safeHref(option.href);
      }
      control.append(this.renderOptionBody(option, hasChildren));
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
        control.addEventListener("click", (event) => {
          if (option.disabled) {
            event.preventDefault();
            return;
          }
          this.dispatchOptionSelect(option);
          this.closeMenu(true);
        });
      }
      wrap.append(control);
      if (hasChildren) {
        wrap.append(this.renderMenuPanel(children, `submenu:${path}`, path));
      }
      panel.append(wrap);
    }

    return panel;
  }

  private focusToggleOrItem(): void {
    const toggle = this.shadowRoot?.querySelector<HTMLButtonElement>(".toggle");
    if (toggle) toggle.focus();
  }

  private closeSubmenu(returnFocus = true): void {
    const path = this.openSubmenuPath;
    if (!path) return;
    this.openSubmenuPath = null;
    this.render();
    if (returnFocus) {
      queueMicrotask(() => {
        const control = this.shadowRoot?.querySelector<HTMLElement>(
          `[data-menu-path="${path}"]`,
        );
        this.highlightControl(control ?? null);
        control?.focus();
      });
    }
  }

  private readonly handlePrimaryClick = (): void => {
    if (this.disabled) return;
    this.dispatchPrimaryClick();
  };

  private readonly handleToggleClick = (): void => {
    if (this.disabled || this.options.length === 0) return;
    if (this.menuOpen) this.closeMenu(true);
    else this.openMenu(false);
  };

  private readonly handleToggleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    // This listener is authoritative for toggle arrows; stop the (composed) event
    // so the host keydown listener does not run the open-and-focus logic a second
    // time.
    event.stopPropagation();
    if (!this.menuOpen) this.openMenu(event.key === "ArrowUp");
    else this.focusControl(event.key === "ArrowUp" ? "last" : "first", "root");
  };

  private readonly handlePointerDown = (event: Event): void => {
    if (!this.menuOpen) return;
    if (event.composedPath().includes(this)) return;
    this.closeMenu();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // Toggle arrows are handled by the toggle's own listener (which stops
    // propagation); the host listener only drives navigation while the menu is open.
    if (!this.menuOpen) return;

    const active = this.activeControlFromEvent(event);
    const panelId = active?.getAttribute("data-menu-panel-id") || "root";
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
      if (this.menuCloseTimer) clearTimeout(this.menuCloseTimer);
      this.menuCloseTimer = setTimeout(() => {
        this.menuCloseTimer = null;
        this.closeMenu();
      }, 0);
      return;
    }

    if (this.handleTypeahead(event, panelId)) return;

    if (event.key === "Home") {
      event.preventDefault();
      this.focusControl("first", panelId);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      this.focusControl("last", panelId);
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
        if (path) {
          this.openSubmenuPath = path;
          this.render();
          queueMicrotask(() => this.focusControl("first", `submenu:${path}`));
        }
      }
      return;
    }
    if (event.key === "ArrowLeft" && parentPath) {
      event.preventDefault();
      this.closeSubmenu(true);
    }
  };

  private render(): void {
    // replaceShadow rebuilds the tree, so snapshot the focused control first and
    // restore it afterward — otherwise a re-render while the menu is open (light-DOM
    // mutation, attribute change) drops keyboard focus to <body>.
    const activeControl = this.shadowRoot?.activeElement as HTMLElement | null;
    const activePanelId =
      activeControl?.getAttribute("data-menu-panel-id") ?? null;
    const activePath = activeControl?.getAttribute("data-menu-path") ?? null;
    const toggleWasFocused =
      activeControl?.classList.contains("toggle") ?? false;
    const wrapper = this.ownerDocument.createElement("div");
    wrapper.className = "wrapper";
    wrapper.setAttribute("data-variant", this.variant);
    if (this.variant === "secondary") wrapper.classList.add("secondary");
    if (this.rounded) wrapper.classList.add("rounded");

    const primary = this.ownerDocument.createElement("button");
    primary.type = "button";
    primary.className = [
      "primary",
      this.variant === "primary" ? "primaryVariant" : "",
      this.variant === "secondary" ? "secondaryVariant secondary" : "",
      this.variant === "tertiary" ? "tertiaryVariant tertiary" : "",
      this.size,
      this.surface === "onDark" ? "onDark" : "",
      this.surface === "onBrand" ? "onBrand" : "",
      this.rounded ? "rounded" : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (this.tooltip) primary.title = this.tooltip;
    if (this.accessibleName)
      primary.setAttribute("aria-label", this.accessibleName);
    primary.disabled = this.disabled;
    primary.addEventListener("click", this.handlePrimaryClick);

    if (this.hasLabelSlot) {
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "label";
      primary.append(slot);
    } else {
      const label = this.ownerDocument.createElement("span");
      label.className = "labelFallback";
      label.textContent = this.label;
      primary.append(label);
    }

    const toggle = this.ownerDocument.createElement("button");
    toggle.type = "button";
    toggle.className = [
      "toggle",
      this.variant === "primary" ? "primaryVariant" : "",
      this.variant === "secondary" ? "secondaryVariant secondary" : "",
      this.variant === "tertiary" ? "tertiaryVariant tertiary" : "",
      this.size,
      this.surface === "onDark" ? "onDark" : "",
      this.surface === "onBrand" ? "onBrand" : "",
      this.rounded ? "rounded" : "",
    ]
      .filter(Boolean)
      .join(" ");
    toggle.disabled = this.disabled || this.options.length === 0;
    toggle.setAttribute("aria-label", this.defaultToggleLabel());
    toggle.setAttribute("aria-haspopup", "menu");
    toggle.setAttribute("aria-expanded", this.menuOpen ? "true" : "false");
    toggle.setAttribute("aria-controls", this.menuId);
    toggle.title = this.defaultToggleLabel();
    toggle.addEventListener("click", this.handleToggleClick);
    toggle.addEventListener("keydown", this.handleToggleKeydown);
    const caret = this.ownerDocument.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    // The same Phosphor glyph the React caret renders (<Icon name="caret-down">).
    const caretGlyph = this.ownerDocument.createElement("dt-icon");
    caretGlyph.setAttribute("name", "caret-down");
    caretGlyph.setAttribute("aria-hidden", "true");
    caret.append(caretGlyph);
    toggle.append(caret);

    wrapper.append(primary, toggle);
    wrapper.append(this.renderMenuPanel(this.options, "root", null));

    this.replaceShadow(styles, wrapper);

    if (toggleWasFocused || (this.menuOpen && activePath !== null)) {
      queueMicrotask(() => {
        if (toggleWasFocused) {
          this.shadowRoot?.querySelector<HTMLElement>(".toggle")?.focus();
          return;
        }
        this.shadowRoot
          ?.querySelector<HTMLElement>(
            `[data-menu-panel-id="${activePanelId}"][data-menu-path="${activePath}"]`,
          )
          ?.focus();
      });
    }
  }
}
