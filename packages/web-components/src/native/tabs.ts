import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["default", "pills", "underline"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;
const ACTIVATIONS = ["manual", "automatic"] as const;

export type DtTabsSize = (typeof SIZES)[number];
export type DtTabsVariant = (typeof VARIANTS)[number];
export type DtTabsOrientation = (typeof ORIENTATIONS)[number];
export type DtTabsActivation = (typeof ACTIVATIONS)[number];

export interface DtTabItem {
  key: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  count?: number;
}

const ICON_PX: Record<DtTabsSize, string> = {
  sm: "16",
  md: "18",
  lg: "20",
};

const styles = `
  :host { display: block; font-family: var(--font-text, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .root { display: grid; gap: var(--space-internal-12, 0.75rem); }
  .tabs {
    display: inline-flex;
    position: relative;
    max-inline-size: 100%;
    inline-size: fit-content;
    gap: 0;
    align-items: stretch;
    font-family: inherit;
    --tab-ind-offset: 0px;
    --tab-ind-size: 0px;
  }
  .tabs.vertical {
    display: flex;
    flex-direction: column;
    inline-size: min(100%, 24rem);
  }
  .tabs.default {
    border: 1px solid var(--color-border, currentcolor);
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--color-light-bg, color-mix(in srgb, currentcolor 6%, transparent));
    overflow: hidden;
  }
  .tabs.pills {
    padding: var(--space-internal-4, 0.25rem);
    gap: var(--space-internal-4, 0.25rem);
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--color-light-bg, color-mix(in srgb, currentcolor 6%, transparent));
  }
  .tabs.underline {
    gap: var(--space-internal-4, 0.25rem);
    border-bottom: 1px solid var(--color-border, currentcolor);
  }
  .tabs.vertical.underline {
    border-bottom: 0;
    border-inline-start: 1px solid var(--color-border, currentcolor);
    padding-inline-start: var(--space-internal-4, 0.25rem);
  }
  .tab {
    display: inline-flex;
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
    justify-content: center;
    align-items: center;
    border: none;
    background: transparent;
    font: inherit;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    color: var(--color-muted, currentcolor);
    cursor: pointer;
    transition:
      color var(--duration-fast, 0.15s) var(--ease-out-cubic, ease),
      transform var(--duration-instant, 0.05s) var(--ease-out-cubic, ease);
  }
  .vertical .tab { justify-content: flex-start; inline-size: 100%; }
  .tab:focus-visible {
    z-index: 2;
    border-radius: var(--radius-md, 0.5rem);
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: -2px;
  }
  .tab:active { transform: scale(0.97); }
  .tabs--sm { font-size: var(--font-size-button-s, 0.875rem); }
  .tabs--md { font-size: var(--font-size-button-m, 1rem); }
  .tabs--lg { font-size: var(--font-size-button-l, 1.125rem); }
  .tabs--sm .tab {
    padding: var(--space-internal-4, 0.25rem) var(--space-internal-8, 0.5rem);
    gap: var(--space-internal-6, 0.375rem);
  }
  .tabs--md .tab {
    padding: var(--space-internal-6, 0.375rem) var(--space-internal-12, 0.75rem);
    gap: var(--space-internal-6, 0.375rem);
  }
  .tabs--lg .tab {
    padding: var(--space-internal-8, 0.5rem) var(--space-internal-16, 1rem);
    gap: var(--space-internal-8, 0.5rem);
  }
  .tabs.default.horizontal .tab + .tab {
    box-shadow: inset 1px 0 0 var(--color-border, currentcolor);
  }
  .tabs.default.vertical .tab + .tab {
    box-shadow: inset 0 1px 0 var(--color-border, currentcolor);
  }
  @media (hover: hover) and (pointer: fine) {
    .tab:not(.tabActive):hover:not(:disabled) {
      color: var(--color-primary, currentcolor);
    }
  }
  .underline .tabActive,
  .pills .tabActive {
    font-weight: 600;
    color: var(--color-primary, currentcolor);
  }
  .default .tabActive {
    font-weight: 600;
    color: var(--color-white, white);
  }
  .indicator {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    opacity: 0;
    transition:
      transform var(--duration-fast, 0.15s) var(--ease-out-cubic, ease),
      inline-size var(--duration-fast, 0.15s) var(--ease-out-cubic, ease),
      block-size var(--duration-fast, 0.15s) var(--ease-out-cubic, ease);
  }
  .tabs.horizontal .indicator {
    left: 0;
    inline-size: var(--tab-ind-size, 0px);
    transform: translateX(var(--tab-ind-offset, 0px));
  }
  .tabs.vertical .indicator {
    top: 0;
    block-size: var(--tab-ind-size, 0px);
    transform: translateY(var(--tab-ind-offset, 0px));
  }
  .underline.horizontal .indicator {
    inset-block-end: -1px;
    block-size: 2px;
    border-radius: 1px;
    background: var(--color-primary, currentcolor);
  }
  .underline.vertical .indicator {
    inset-inline-start: -1px;
    inline-size: 2px;
    border-radius: 1px;
    background: var(--color-primary, currentcolor);
  }
  .pills.horizontal .indicator {
    inset-block: var(--space-internal-4, 0.25rem);
    border-radius: var(--radius-md, 0.5rem);
    background: var(--color-white, white);
    box-shadow:
      0 1px 2px rgb(0 0 0 / 8%),
      0 1px 3px rgb(0 0 0 / 6%);
  }
  .pills.vertical .indicator {
    inset-inline: var(--space-internal-4, 0.25rem);
    border-radius: var(--radius-md, 0.5rem);
    background: var(--color-white, white);
    box-shadow:
      0 1px 2px rgb(0 0 0 / 8%),
      0 1px 3px rgb(0 0 0 / 6%);
  }
  .default.horizontal .indicator {
    inset-block: 0;
    background: var(--color-primary, currentcolor);
  }
  .default.vertical .indicator {
    inset-inline: 0;
    background: var(--color-primary, currentcolor);
  }
  .tabs[data-indicator-ready="true"] .indicator { opacity: 1; }
  .count {
    display: inline-flex;
    min-inline-size: 1.5em;
    padding-inline: 0.4em;
    justify-content: center;
    align-items: center;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-muted, currentcolor) 18%, transparent);
    font-size: 0.78em;
    font-weight: 600;
    line-height: 1.4;
    color: var(--color-muted, currentcolor);
    font-variant-numeric: tabular-nums;
    transition:
      background-color var(--duration-fast, 0.15s) var(--ease-out-cubic, ease),
      color var(--duration-fast, 0.15s) var(--ease-out-cubic, ease);
  }
  .underline .tabActive .count,
  .pills .tabActive .count {
    background: var(--color-primary, currentcolor);
    color: var(--color-white, white);
  }
  .default .tabActive .count {
    background: color-mix(in srgb, var(--color-white, white) 24%, transparent);
    color: var(--color-white, white);
  }
  .tabIcon {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
  }
  .tabLabel { display: inline-flex; align-items: center; letter-spacing: 0.01em; }
  .tabDisabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
  .panels { display: grid; min-inline-size: 0; }
  .panel { min-inline-size: 0; }
  .panel[hidden] { display: none; }
  @media (forced-colors: active) {
    .indicator {
      background: Highlight;
      forced-color-adjust: none;
    }
    .tabActive { color: Highlight; }
    .default .tabActive { color: HighlightText; }
    .count { border: 1px solid CanvasText; }
  }
  @media (prefers-reduced-motion: reduce) {
    .indicator,
    .tab,
    .count { transition: none; }
  }
`;

function tabId(key: string): string {
  return `tab-${key}`;
}

function panelId(key: string): string {
  return `tabpanel-${key}`;
}

function tabSlotName(key: string): string {
  return `tab-${key}`;
}

function panelSlotName(key: string): string {
  return `panel-${key}`;
}

export class DtTabsElement extends DigitaltableteurElement {
  static observedAttributes = [
    "tabs",
    "active-tab",
    "default-active-tab",
    "size",
    "variant",
    "aria-label",
    "orientation",
    "activation",
    "lang",
  ];

  private assignedTabs: DtTabItem[] | null = null;
  private liveActiveTab: string | null = null;
  private activeDirty = false;
  private focusKey: string | null = null;
  private list: HTMLDivElement | null = null;
  private indicator: HTMLSpanElement | null = null;
  private readonly tabButtons = new Map<string, HTMLButtonElement>();
  private readonly panelWrappers = new Map<string, HTMLElement>();
  private resizeObserver?: ResizeObserver;

  connectedCallback(): void {
    if (this.liveActiveTab === null) {
      this.liveActiveTab = this.resolveInitialActiveTab();
    }
    this.observeLightDom(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    super.disconnectedCallback();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "tabs") this.assignedTabs = null;
    if (name === "active-tab") {
      this.liveActiveTab =
        value === null ? this.resolveFallbackActiveTab() : value;
      this.activeDirty = false;
      if (value !== null) this.focusKey = value;
    } else if (
      name === "default-active-tab" &&
      !this.activeDirty &&
      !this.hasAttribute("active-tab")
    ) {
      this.liveActiveTab = this.resolveFallbackActiveTab();
    }
    if (this.isConnected) this.render();
  }

  get tabs(): DtTabItem[] {
    return this.assignedTabs ?? this.parseTabsAttribute();
  }
  set tabs(value: DtTabItem[]) {
    this.assignedTabs = value.map((item) => ({ ...item }));
    if (this.isConnected) this.render();
  }

  get activeTab(): string {
    return this.liveActiveTab ?? "";
  }
  set activeTab(value: string) {
    reflectAttribute(this, "active-tab", value);
  }

  get defaultActiveTab(): string {
    return stringAttribute(this, "default-active-tab");
  }
  set defaultActiveTab(value: string) {
    reflectAttribute(this, "default-active-tab", value || null);
  }

  get size(): DtTabsSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtTabsSize) {
    reflectAttribute(this, "size", value);
  }

  get variant(): DtTabsVariant {
    return enumAttribute(this, "variant", VARIANTS, "default");
  }
  set variant(value: DtTabsVariant) {
    reflectAttribute(this, "variant", value);
  }

  get ariaLabel(): string {
    return (
      stringAttribute(this, "aria-label") ||
      localizedText(this, {
        en: "Navigate between tabs",
        fi: "Siirry valintavälilehtien välillä",
        sv: "Navigera mellan flikar",
      })
    );
  }
  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }

  get orientation(): DtTabsOrientation {
    return enumAttribute(this, "orientation", ORIENTATIONS, "horizontal");
  }
  set orientation(value: DtTabsOrientation) {
    reflectAttribute(this, "orientation", value);
  }

  get activation(): DtTabsActivation {
    return enumAttribute(this, "activation", ACTIVATIONS, "manual");
  }
  set activation(value: DtTabsActivation) {
    reflectAttribute(this, "activation", value);
  }

  private get isControlled(): boolean {
    return this.hasAttribute("active-tab");
  }

  private parseTabsAttribute(): DtTabItem[] {
    const source = this.getAttribute("tabs");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const tab = item as Record<string, unknown>;
        if (typeof tab.key !== "string" || typeof tab.label !== "string") {
          return [];
        }
        return [
          {
            key: tab.key,
            label: tab.label,
            disabled: tab.disabled === true,
            icon: typeof tab.icon === "string" ? tab.icon : undefined,
            count:
              typeof tab.count === "number" && Number.isFinite(tab.count)
                ? tab.count
                : undefined,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private resolveInitialActiveTab(): string {
    if (this.hasAttribute("active-tab")) return stringAttribute(this, "active-tab");
    return this.resolveFallbackActiveTab();
  }

  private resolveFallbackActiveTab(): string {
    if (this.hasAttribute("default-active-tab")) {
      return stringAttribute(this, "default-active-tab");
    }
    return this.firstEnabledKey() ?? this.tabs[0]?.key ?? "";
  }

  private firstEnabledKey(): string | null {
    return this.tabs.find((tab) => !tab.disabled)?.key ?? null;
  }

  private isKnownKey(key: string | null): key is string {
    return Boolean(key && this.tabs.some((tab) => tab.key === key));
  }

  private isEnabledKey(key: string | null): key is string {
    return Boolean(key && this.tabs.some((tab) => tab.key === key && !tab.disabled));
  }

  private selectedKey(): string {
    return this.liveActiveTab ?? "";
  }

  private resolvedFocusKey(): string {
    if (this.isEnabledKey(this.focusKey)) return this.focusKey;
    if (this.isEnabledKey(this.selectedKey())) return this.selectedKey();
    return this.firstEnabledKey() ?? this.tabs[0]?.key ?? "";
  }

  private moveFocus(key: string): void {
    this.focusKey = key;
    this.syncDomState();
    this.tabButtons.get(key)?.focus();
  }

  private requestActivation(key: string): void {
    const previousActiveTab = this.selectedKey();
    this.focusKey = key;
    if (!this.isControlled) {
      this.liveActiveTab = key;
      this.activeDirty = true;
    }
    this.syncDomState();
    this.tabButtons.get(key)?.focus();
    this.dispatchEvent(
      new CustomEvent("tab-change", {
        detail: { activeTab: key, previousActiveTab },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleKeyDown(event: KeyboardEvent, key: string): void {
    const tab = this.tabs.find((item) => item.key === key);
    if (!tab || tab.disabled) return;

    const enabledKeys = this.tabs.filter((item) => !item.disabled).map((item) => item.key);
    const currentKey = this.isEnabledKey(this.focusKey) ? this.focusKey : key;
    const currentIndex = enabledKeys.indexOf(currentKey);
    if (currentIndex === -1) return;

    let nextKey: string | null = null;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        nextKey =
          enabledKeys[(currentIndex - 1 + enabledKeys.length) % enabledKeys.length] ?? null;
        break;
      case "ArrowRight":
      case "ArrowDown":
        nextKey = enabledKeys[(currentIndex + 1) % enabledKeys.length] ?? null;
        break;
      case "Home":
        nextKey = enabledKeys[0] ?? null;
        break;
      case "End":
        nextKey = enabledKeys[enabledKeys.length - 1] ?? null;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.requestActivation(key);
        return;
      default:
        return;
    }

    if (!nextKey) return;
    event.preventDefault();
    if (this.activation === "automatic") {
      this.requestActivation(nextKey);
      return;
    }
    this.moveFocus(nextKey);
  }

  private renderTabButton(tab: DtTabItem, activeKey: string, focusKey: string): HTMLButtonElement {
    const button = this.ownerDocument.createElement("button");
    const selected = tab.key === activeKey;
    button.type = "button";
    button.id = tabId(tab.key);
    button.dataset.tabKey = tab.key;
    button.className = [
      "tab",
      selected ? "tabActive" : "",
      tab.disabled ? "tabDisabled" : "",
    ]
      .filter(Boolean)
      .join(" ");
    button.setAttribute("part", "tab");
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(selected));
    button.setAttribute("aria-controls", panelId(tab.key));
    button.tabIndex = !tab.disabled && tab.key === focusKey ? 0 : -1;
    button.disabled = tab.disabled === true;
    button.addEventListener("click", () => {
      if (!tab.disabled) this.requestActivation(tab.key);
    });
    button.addEventListener("keydown", (event) =>
      this.handleKeyDown(event, tab.key),
    );
    button.addEventListener("focus", () => {
      if (this.focusKey !== tab.key) {
        this.focusKey = tab.key;
        this.syncDomState();
      }
    });

    if (tab.icon) {
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.className = "tabIcon";
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("name", tab.icon);
      icon.setAttribute("size", ICON_PX[this.size]);
      button.append(icon);
    }

    const label = this.ownerDocument.createElement("span");
    label.className = "tabLabel";
    const slot = this.ownerDocument.createElement("slot");
    slot.name = tabSlotName(tab.key);
    slot.textContent = tab.label;
    label.append(slot);
    button.append(label);

    if (typeof tab.count === "number") {
      const count = this.ownerDocument.createElement("span");
      count.className = "count";
      count.textContent = String(tab.count);
      button.append(count);
    }

    return button;
  }

  private renderPanel(tab: DtTabItem, activeKey: string): HTMLElement {
    const panel = this.ownerDocument.createElement("div");
    const active = tab.key === activeKey;
    panel.className = "panel";
    panel.id = panelId(tab.key);
    panel.setAttribute("part", "panel");
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId(tab.key));
    panel.hidden = !active;
    panel.tabIndex = active ? 0 : -1;
    const slot = this.ownerDocument.createElement("slot");
    slot.name = panelSlotName(tab.key);
    panel.append(slot);
    return panel;
  }

  private render(): void {
    const hadFocusedButton =
      this.shadowRoot?.activeElement instanceof HTMLElement &&
      this.shadowRoot.activeElement.matches("[data-tab-key]");

    const previousFocusKey =
      this.shadowRoot?.activeElement instanceof HTMLElement
        ? this.shadowRoot.activeElement.dataset.tabKey
        : null;

    const tabs = this.tabs;
    if (!this.isControlled) {
      if (!this.isKnownKey(this.liveActiveTab)) {
        this.liveActiveTab = this.resolveFallbackActiveTab();
      }
    }
    if (!this.isEnabledKey(this.focusKey)) {
      this.focusKey = this.isEnabledKey(this.selectedKey())
        ? this.selectedKey()
        : this.firstEnabledKey();
    }

    const activeKey = this.selectedKey();
    const focusKey = this.resolvedFocusKey();

    const root = this.ownerDocument.createElement("div");
    root.className = "root";

    const list = this.ownerDocument.createElement("div");
    list.className = [
      "tabs",
      this.variant,
      `tabs--${this.size}`,
      this.orientation,
    ].join(" ");
    list.dataset.indicatorReady = "false";
    list.setAttribute("part", "tablist");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", this.ariaLabel);
    list.setAttribute("aria-orientation", this.orientation);

    this.tabButtons.clear();
    this.panelWrappers.clear();
    this.list = list;

    for (const tab of tabs) {
      const button = this.renderTabButton(tab, activeKey, focusKey);
      this.tabButtons.set(tab.key, button);
      list.append(button);
    }

    const indicator = this.ownerDocument.createElement("span");
    indicator.className = "indicator";
    indicator.setAttribute("part", "indicator");
    indicator.setAttribute("aria-hidden", "true");
    this.indicator = indicator;
    list.append(indicator);

    const panels = this.ownerDocument.createElement("div");
    panels.className = "panels";
    panels.setAttribute("part", "panels");
    for (const tab of tabs) {
      const panel = this.renderPanel(tab, activeKey);
      this.panelWrappers.set(tab.key, panel);
      panels.append(panel);
    }

    root.append(list, panels);
    this.replaceShadow(styles, root);
    this.list = this.shadowRoot?.querySelector<HTMLDivElement>(".tabs") ?? list;
    this.indicator = this.shadowRoot?.querySelector<HTMLSpanElement>(".indicator") ?? indicator;

    this.resizeObserver?.disconnect();
    if (typeof ResizeObserver !== "undefined" && this.list) {
      this.resizeObserver = new ResizeObserver(() => this.measureIndicator());
      this.resizeObserver.observe(this.list);
    }

    this.syncDomState();

    if (hadFocusedButton) {
      const targetKey =
        previousFocusKey && this.tabButtons.has(previousFocusKey)
          ? previousFocusKey
          : focusKey;
      this.tabButtons.get(targetKey)?.focus();
    }
  }

  private syncDomState(): void {
    const activeKey = this.selectedKey();
    const focusKey = this.resolvedFocusKey();

    for (const tab of this.tabs) {
      const button = this.tabButtons.get(tab.key);
      if (!button) continue;
      const selected = tab.key === activeKey;
      button.className = [
        "tab",
        selected ? "tabActive" : "",
        tab.disabled ? "tabDisabled" : "",
      ]
        .filter(Boolean)
        .join(" ");
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = !tab.disabled && tab.key === focusKey ? 0 : -1;
      button.disabled = tab.disabled === true;
    }

    for (const tab of this.tabs) {
      const panel = this.panelWrappers.get(tab.key);
      if (!panel) continue;
      const active = tab.key === activeKey;
      panel.hidden = !active;
      panel.tabIndex = active ? 0 : -1;
    }

    this.measureIndicator();
  }

  private measureIndicator(): void {
    if (!this.list || !this.indicator) return;
    const activeButton = this.tabButtons.get(this.selectedKey());
    if (!activeButton) {
      this.list.dataset.indicatorReady = "false";
      this.list.style.setProperty("--tab-ind-offset", "0px");
      this.list.style.setProperty("--tab-ind-size", "0px");
      return;
    }

    if (this.orientation === "vertical") {
      this.list.style.setProperty("--tab-ind-offset", `${activeButton.offsetTop}px`);
      this.list.style.setProperty("--tab-ind-size", `${activeButton.offsetHeight}px`);
    } else {
      this.list.style.setProperty("--tab-ind-offset", `${activeButton.offsetLeft}px`);
      this.list.style.setProperty("--tab-ind-size", `${activeButton.offsetWidth}px`);
    }
    this.list.dataset.indicatorReady = "true";
  }
}
