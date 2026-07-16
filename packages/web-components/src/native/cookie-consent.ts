import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export type DtCookieConsentValue = Record<string, boolean>;
export type DtCookieConsentChangeType =
  | "accept-all"
  | "accept-required"
  | "custom"
  | "reset";

export interface DtCookieConsentCategory {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  consented?: boolean;
  toggleLabel?: string;
}

export interface DtCookieConsentChangeDetail {
  type: DtCookieConsentChangeType;
  value: DtCookieConsentValue;
  timestamp: string;
}

export interface DtCookieConsentStoredState {
  version: number;
  timestamp: string;
  language: string;
  categories: DtCookieConsentValue;
}

export interface DtCookieConsentPersistence {
  load(
    element: DtCookieConsentElement,
  ): DtCookieConsentValue | DtCookieConsentStoredState | null;
  save(
    detail: DtCookieConsentChangeDetail,
    element: DtCookieConsentElement,
  ): void;
  clear?(element: DtCookieConsentElement): void;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const URL_PARSE_BASE = "https://example.invalid";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const styles = `
  :host { font-family: var(--font-body, var(--primary-body-font, sans-serif)); color: var(--color-text, CanvasText); }
  :host([hidden]) { display: none; }
  .banner {
    display: flex;
    position: fixed;
    z-index: 900;
    inset-inline: 0;
    inset-block-end: 0;
    padding-block: var(--space-layout-16, 1rem);
    padding-block-end: max(var(--space-layout-16, 1rem), env(safe-area-inset-bottom));
    padding-inline: max(var(--page-margin-mobile, 1rem), env(safe-area-inset-left)) max(var(--page-margin-mobile, 1rem), env(safe-area-inset-right));
    align-items: center;
    border-block-start: 1px solid var(--color-border, #767676);
    background: color-mix(in srgb, var(--main-body-background-color, Canvas) 94%, transparent);
    backdrop-filter: blur(10px);
  }
  .bar { display: flex; margin-inline: auto; inline-size: 100%; max-inline-size: var(--container-lg, 72rem); align-items: center; gap: var(--space-layout-24, 1.5rem); }
  .copy { min-inline-size: 0; flex: 1 1 auto; }
  .summary { margin: 0; color: var(--color-text, CanvasText); font-size: var(--font-size-text-m, 1rem); line-height: var(--line-height-normal, 1.5); }
  .policy { color: var(--color-primary, LinkText); text-underline-offset: 0.2em; }
  .actions { display: flex; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: var(--space-layout-16, 1rem); }
  button, .button {
    display: inline-flex;
    min-block-size: 2.5rem;
    padding: var(--space-internal-8, 0.5rem) var(--space-internal-16, 1rem);
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius-lg, 0.5rem);
    font: inherit;
    font-weight: 600;
    line-height: 1.25;
    cursor: pointer;
  }
  button:focus-visible, .button:focus-visible, input:focus-visible + .switchTrack { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, Highlight)); outline-offset: var(--focus-ring-offset, 2px); }
  .primary { background: var(--color-primary, ButtonText); color: var(--color-white, ButtonFace); }
  .secondary { border-color: var(--color-primary, ButtonText); background: transparent; color: var(--color-primary, ButtonText); }
  .tertiary { background: transparent; color: var(--color-primary, ButtonText); }
  .overlay { position: fixed; z-index: 9100; inset: 0; display: grid; padding: var(--space-layout-16, 1rem); place-items: center; background: rgb(0 0 0 / 55%); }
  .dialog { box-sizing: border-box; inline-size: min(51.25rem, 100%); max-block-size: min(46rem, calc(100dvh - 2rem)); overflow: auto; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background: var(--main-body-background-color, Canvas); color: var(--color-text, CanvasText); box-shadow: 0 24px 80px rgb(0 0 0 / 30%); }
  .header { display: flex; padding: var(--space-layout-24, 1.5rem); align-items: flex-start; justify-content: space-between; gap: var(--space-internal-16, 1rem); border-block-end: 1px solid var(--color-border, #767676); }
  .title { margin: 0; font-size: var(--font-size-title-s, 1.5rem); line-height: 1.25; }
  .close { min-inline-size: 2.5rem; padding: 0; border: 0; background: transparent; color: inherit; font-size: 1.5rem; }
  .content { padding: var(--space-layout-24, 1.5rem); }
  .description { margin: 0 0 var(--space-layout-16, 1rem); line-height: var(--line-height-normal, 1.5); }
  .categories { display: flex; padding-block: var(--space-layout-16, 1rem); flex-direction: column; gap: var(--space-layout-16, 1rem); border-block: 1px solid var(--color-border, #767676); }
  .category { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-internal-16, 1rem); }
  .categoryCopy { min-inline-size: 0; flex: 1 1 auto; }
  .categoryTitle { margin: 0 0 var(--space-internal-4, 0.25rem); font-size: var(--font-size-body-l, 1.125rem); line-height: 1.3; }
  .categoryDescription { margin: 0; color: var(--secondary-text-color, var(--color-muted, GrayText)); font-size: var(--font-size-body-s, 0.875rem); line-height: 1.5; }
  .categoryControl { display: flex; flex: 0 0 auto; align-items: center; gap: var(--space-internal-12, 0.75rem); }
  .required { padding: var(--space-internal-4, 0.25rem) var(--space-internal-8, 0.5rem); border-radius: var(--radius-md, 0.375rem); background: var(--color-info-bg, #e6f4ff); color: var(--color-info-text, CanvasText); font-size: var(--font-size-text-xs, 0.75rem); font-weight: 600; }
  .switch { display: inline-block; position: relative; inline-size: 2.75rem; block-size: 1.5rem; cursor: pointer; }
  .switch input { position: absolute; inline-size: 1px; block-size: 1px; opacity: 0; }
  .switchTrack { position: absolute; inset: 0; border: 1px solid var(--color-border, #767676); border-radius: 999px; background: var(--color-switch-track-off, #767676); transition: background-color 160ms; }
  .switchTrack::before { position: absolute; inset-block-start: 0.1875rem; inset-inline-start: 0.1875rem; inline-size: 1rem; block-size: 1rem; border-radius: 50%; background: #fff; transition: translate 160ms; content: ""; }
  .switch input:checked + .switchTrack { background: var(--color-primary, #005fcc); }
  .switch input:checked + .switchTrack::before { translate: 1.25rem 0; }
  .switch input:disabled + .switchTrack { opacity: 0.65; cursor: not-allowed; }
  .footer { display: flex; padding: var(--space-layout-24, 1.5rem); justify-content: space-between; align-items: center; gap: var(--space-internal-16, 1rem); border-block-start: 1px solid var(--color-border, #767676); }
  .footerActions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-layout-16, 1rem); }
  @media (width >= 768px) { .banner { padding-inline: max(var(--page-margin-tablet, 2rem), env(safe-area-inset-left)) max(var(--page-margin-tablet, 2rem), env(safe-area-inset-right)); } }
  @media (width >= 1024px) { .banner { padding-inline: max(var(--page-margin-desktop, 3rem), env(safe-area-inset-left)) max(var(--page-margin-desktop, 3rem), env(safe-area-inset-right)); } }
  @media (width <= 767px) {
    .bar { align-items: stretch; flex-direction: column; gap: var(--space-layout-16, 1rem); }
    .actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--space-internal-8, 0.5rem); }
    .actions > * { inline-size: 100%; }
    .actions > :first-child { order: 3; grid-column: 1 / -1; }
    .category, .footer { flex-direction: column; align-items: stretch; }
    .categoryControl { justify-content: space-between; }
    .footerActions { flex-direction: column; }
    .footerActions > *, .footer > .policy { inline-size: 100%; box-sizing: border-box; }
  }
  @media (prefers-reduced-motion: no-preference) { .banner { animation: banner-in 220ms ease-out; } }
  @media (prefers-reduced-motion: reduce) { .banner { animation: none; } .switchTrack, .switchTrack::before { transition: none; } }
  @keyframes banner-in { from { translate: 0 100%; opacity: 0; } to { translate: 0 0; opacity: 1; } }
  @media (forced-colors: active) {
    .banner, .dialog { border-color: CanvasText; background: Canvas; color: CanvasText; forced-color-adjust: none; }
    .overlay { background: Canvas; }
    .primary, .secondary, .tertiary, .close { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; }
    .switchTrack { border-color: CanvasText; background: Canvas; }
    .switch input:checked + .switchTrack { background: Highlight; }
    .switchTrack::before { background: CanvasText; }
    .required { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }
  }
`;

function safeHref(value: string): string {
  const href = value.trim();
  if (!href || href.startsWith("//")) return "#";
  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  )
    return href;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(href, URL_PARSE_BASE).protocol)
      ? href
      : "#";
  } catch {
    return "#";
  }
}

function cloneValue(value: DtCookieConsentValue): DtCookieConsentValue {
  return { ...value };
}

function parseValue(value: unknown): DtCookieConsentValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: DtCookieConsentValue = {};
  for (const [key, consented] of Object.entries(value)) {
    if (typeof consented !== "boolean") return null;
    result[key] = consented;
  }
  return result;
}

function parseValueAttribute(
  source: string | null,
): DtCookieConsentValue | null {
  if (!source) return null;
  try {
    return parseValue(JSON.parse(source));
  } catch {
    return null;
  }
}

function cloneCategories(
  categories: DtCookieConsentCategory[],
): DtCookieConsentCategory[] {
  return categories.map((category) => ({ ...category }));
}

export class DtCookieConsentElement extends DigitaltableteurElement {
  static observedAttributes = [
    "categories",
    "value",
    "default-value",
    "open",
    "default-open",
    "auto-show",
    "controlled",
    "storage-key",
    "storage-version",
    "banner-label",
    "summary",
    "read-our-text",
    "policy-label",
    "policy-href",
    "customize-label",
    "accept-required-label",
    "accept-all-label",
    "title",
    "description",
    "required-label",
    "save-label",
    "close-label",
    "lang",
  ];

  private assignedCategories: DtCookieConsentCategory[] | null = null;
  private assignedPersistence: DtCookieConsentPersistence | null = null;
  private liveValue: DtCookieConsentValue = {};
  private draftValue: DtCookieConsentValue = {};
  private initialized = false;
  private valueDirty = false;
  private openState = false;
  private customizing = false;
  private syncingOpenAttribute = false;
  private resizeObserver: ResizeObserver | null = null;

  connectedCallback(): void {
    if (!this.initialized) this.initialize();
    this.render();
  }

  disconnectedCallback(): void {
    this.detachDialogListeners();
    this.clearBodySignal();
    super.disconnectedCallback();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "categories") this.assignedCategories = null;
    if (name === "value") {
      this.liveValue = this.normalizeValue(parseValueAttribute(value) ?? {});
      this.valueDirty = false;
      this.draftValue = cloneValue(this.liveValue);
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = this.normalizeValue(
        parseValueAttribute(value) ?? this.categoryDefaults(),
      );
      this.draftValue = cloneValue(this.liveValue);
    } else if (name === "open" && !this.syncingOpenAttribute) {
      this.openState = this.hasAttribute("open");
      if (!this.openState) this.customizing = false;
    } else if (
      name === "storage-key" &&
      this.initialized &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      const loaded = this.loadPersistedValue();
      if (loaded) {
        this.liveValue = this.normalizeValue(loaded);
        this.draftValue = cloneValue(this.liveValue);
      }
    }
    if (this.isConnected) this.render();
  }

  get categories(): DtCookieConsentCategory[] {
    return cloneCategories(
      this.assignedCategories ?? this.parseCategoriesAttribute(),
    );
  }
  set categories(value: DtCookieConsentCategory[]) {
    this.assignedCategories = cloneCategories(value);
    this.liveValue = this.normalizeValue(this.liveValue);
    this.draftValue = this.normalizeValue(this.draftValue);
    if (this.isConnected) this.render();
  }

  get value(): DtCookieConsentValue {
    return cloneValue(this.liveValue);
  }
  set value(value: DtCookieConsentValue) {
    const next = this.normalizeValue(value);
    this.liveValue = next;
    this.draftValue = cloneValue(next);
    this.valueDirty = false;
    const serialized = JSON.stringify(next);
    if (this.getAttribute("value") === serialized) {
      if (this.isConnected) this.render();
    } else {
      reflectAttribute(this, "value", serialized);
    }
  }

  get defaultValue(): DtCookieConsentValue {
    return this.normalizeValue(
      parseValueAttribute(this.getAttribute("default-value")) ??
        this.categoryDefaults(),
    );
  }
  set defaultValue(value: DtCookieConsentValue) {
    reflectAttribute(this, "default-value", JSON.stringify(value));
  }

  get open(): boolean {
    return this.openState;
  }
  set open(value: boolean) {
    this.setOpen(value, "api", true);
  }
  get defaultOpen(): boolean {
    return this.hasAttribute("default-open");
  }
  set defaultOpen(value: boolean) {
    reflectBooleanAttribute(this, "default-open", value);
  }
  get autoShow(): boolean {
    return this.getAttribute("auto-show") !== "false";
  }
  set autoShow(value: boolean) {
    reflectAttribute(this, "auto-show", value ? null : "false");
  }
  get controlled(): boolean {
    return this.hasAttribute("controlled");
  }
  set controlled(value: boolean) {
    reflectBooleanAttribute(this, "controlled", value);
  }
  get storageKey(): string {
    return stringAttribute(this, "storage-key");
  }
  set storageKey(value: string) {
    reflectAttribute(this, "storage-key", value || null);
  }
  get storageVersion(): number {
    const value = Number(this.getAttribute("storage-version"));
    return Number.isFinite(value) && value > 0 ? value : 1;
  }
  set storageVersion(value: number) {
    reflectAttribute(this, "storage-version", value);
  }
  get persistence(): DtCookieConsentPersistence | null {
    return this.assignedPersistence;
  }
  set persistence(value: DtCookieConsentPersistence | null) {
    this.assignedPersistence = value;
    if (this.isConnected && !this.valueDirty && !this.hasAttribute("value")) {
      const loaded = this.loadPersistedValue();
      if (loaded) {
        this.liveValue = this.normalizeValue(loaded);
        this.draftValue = cloneValue(this.liveValue);
        this.openState = false;
      }
      this.render();
    }
  }

  show(): void {
    this.setOpen(true, "api", true);
  }
  hide(): void {
    this.setOpen(false, "api", true);
  }
  acceptAll(): void {
    const value = Object.fromEntries(
      this.categories.map((category) => [category.id, true]),
    );
    this.requestConsent("accept-all", value);
  }
  acceptRequired(): void {
    const value = Object.fromEntries(
      this.categories.map((category) => [
        category.id,
        category.required === true,
      ]),
    );
    this.requestConsent("accept-required", value);
  }
  save(): void {
    this.requestConsent("custom", this.draftValue);
  }
  reset(clearPersistence = true): void {
    const next = this.normalizeValue(this.defaultValue);
    if (clearPersistence) this.clearPersistence();
    this.liveValue = next;
    this.draftValue = cloneValue(next);
    this.valueDirty = false;
    this.customizing = false;
    this.setOpen(true, "reset", true);
    this.dispatchEvent(
      new CustomEvent<DtCookieConsentChangeDetail>("consent-change", {
        detail: {
          type: "reset",
          value: cloneValue(next),
          timestamp: new Date().toISOString(),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private initialize(): void {
    const attributeValue = this.hasAttribute("value")
      ? parseValueAttribute(this.getAttribute("value"))
      : null;
    const persisted = attributeValue ? null : this.loadPersistedValue();
    const defaults =
      parseValueAttribute(this.getAttribute("default-value")) ??
      this.categoryDefaults();
    this.liveValue = this.normalizeValue(
      attributeValue ?? persisted ?? defaults,
    );
    this.draftValue = cloneValue(this.liveValue);
    const hasExistingConsent = attributeValue !== null || persisted !== null;
    this.openState =
      this.hasAttribute("open") ||
      (!hasExistingConsent &&
        (this.hasAttribute("default-open") || this.autoShow));
    this.initialized = true;
  }

  private parseCategoriesAttribute(): DtCookieConsentCategory[] {
    const source = this.getAttribute("categories");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set<string>();
      return parsed.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const category = entry as Record<string, unknown>;
        if (
          typeof category.id !== "string" ||
          !category.id ||
          seen.has(category.id) ||
          typeof category.label !== "string"
        )
          return [];
        seen.add(category.id);
        return [
          {
            id: category.id,
            label: category.label,
            description:
              typeof category.description === "string"
                ? category.description
                : undefined,
            required: category.required === true,
            consented: category.consented === true,
            toggleLabel:
              typeof category.toggleLabel === "string"
                ? category.toggleLabel
                : undefined,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private categoryDefaults(): DtCookieConsentValue {
    return Object.fromEntries(
      this.categories.map((category) => [
        category.id,
        category.required === true || category.consented === true,
      ]),
    );
  }

  private normalizeValue(value: DtCookieConsentValue): DtCookieConsentValue {
    return Object.fromEntries(
      this.categories.map((category) => [
        category.id,
        category.required === true ? true : value[category.id] === true,
      ]),
    );
  }

  private storedCategories(
    value: DtCookieConsentValue | DtCookieConsentStoredState,
  ): DtCookieConsentValue | null {
    const record = value as Partial<DtCookieConsentStoredState>;
    if (
      typeof record.version === "number" &&
      record.categories !== undefined
    ) {
      if (record.version !== this.storageVersion) return null;
      return parseValue(record.categories);
    }
    return parseValue(value);
  }

  private loadPersistedValue(): DtCookieConsentValue | null {
    try {
      if (this.assignedPersistence) {
        const value = this.assignedPersistence.load(this);
        return value ? this.storedCategories(value) : null;
      }
      if (!this.storageKey) return null;
      const storage = this.ownerDocument.defaultView?.localStorage;
      const source = storage?.getItem(this.storageKey);
      if (!source) return null;
      const parsed: unknown = JSON.parse(source);
      if (!parsed || typeof parsed !== "object") return null;
      return this.storedCategories(
        parsed as DtCookieConsentValue | DtCookieConsentStoredState,
      );
    } catch (error) {
      this.persistenceError("load", error);
      return null;
    }
  }

  private savePersistence(detail: DtCookieConsentChangeDetail): void {
    try {
      if (this.assignedPersistence) {
        this.assignedPersistence.save(detail, this);
        return;
      }
      if (!this.storageKey) return;
      const state: DtCookieConsentStoredState = {
        version: this.storageVersion,
        timestamp: detail.timestamp,
        language: this.lang || this.ownerDocument.documentElement.lang || "en",
        categories: cloneValue(detail.value),
      };
      this.ownerDocument.defaultView?.localStorage?.setItem(
        this.storageKey,
        JSON.stringify(state),
      );
    } catch (error) {
      this.persistenceError("save", error);
    }
  }

  private clearPersistence(): void {
    try {
      if (this.assignedPersistence?.clear) this.assignedPersistence.clear(this);
      else if (this.storageKey)
        this.ownerDocument.defaultView?.localStorage?.removeItem(
          this.storageKey,
        );
    } catch (error) {
      this.persistenceError("clear", error);
    }
  }

  private persistenceError(
    operation: "load" | "save" | "clear",
    error: unknown,
  ): void {
    queueMicrotask(() =>
      this.dispatchEvent(
        new CustomEvent("persistence-error", {
          detail: { operation, error },
          bubbles: true,
          composed: true,
        }),
      ),
    );
  }

  private requestConsent(
    type: Exclude<DtCookieConsentChangeType, "reset">,
    requested: DtCookieConsentValue,
  ): void {
    const detail: DtCookieConsentChangeDetail = {
      type,
      value: this.normalizeValue(requested),
      timestamp: new Date().toISOString(),
    };
    const before = new CustomEvent<DtCookieConsentChangeDetail>(
      "before-consent-change",
      {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      },
    );
    if (!this.dispatchEvent(before)) return;
    if (!this.controlled) {
      this.liveValue = cloneValue(detail.value);
      this.draftValue = cloneValue(detail.value);
      this.valueDirty = true;
      this.savePersistence(detail);
      this.customizing = false;
      this.setOpen(false, type, false);
    }
    this.dispatchEvent(
      new CustomEvent<DtCookieConsentChangeDetail>("consent-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value: cloneValue(detail.value) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private setOpen(next: boolean, reason: string, force: boolean): void {
    if (!force && this.controlled) {
      this.dispatchOpenChange(next, reason);
      return;
    }
    if (this.openState === next) return;
    this.openState = next;
    if (!next) this.customizing = false;
    this.syncingOpenAttribute = true;
    reflectBooleanAttribute(this, "open", next);
    this.syncingOpenAttribute = false;
    if (this.isConnected) this.render();
    this.dispatchOpenChange(next, reason);
  }

  private dispatchOpenChange(open: boolean, reason: string): void {
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private openCustomization(): void {
    this.draftValue = cloneValue(this.liveValue);
    this.customizing = true;
    this.attachDialogListeners();
    this.render();
    queueMicrotask(() =>
      this.shadowRoot?.querySelector<HTMLButtonElement>(".close")?.focus(),
    );
  }

  private closeCustomization(): void {
    if (!this.customizing) return;
    this.customizing = false;
    this.detachDialogListeners();
    this.render();
    queueMicrotask(() => {
      const customize =
        this.shadowRoot?.querySelector<HTMLButtonElement>(".customize");
      customize?.focus();
    });
  }

  private attachDialogListeners(): void {
    this.ownerDocument.defaultView?.addEventListener(
      "keydown",
      this.handleDialogKeydown,
    );
  }

  private detachDialogListeners(): void {
    this.ownerDocument.defaultView?.removeEventListener(
      "keydown",
      this.handleDialogKeydown,
    );
  }

  private readonly handleDialogKeydown = (event: KeyboardEvent): void => {
    if (!this.customizing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeCustomization();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = this.shadowRoot?.querySelector<HTMLElement>(".dialog");
    const controls = [
      ...(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []),
    ].filter((control) => !control.hasAttribute("disabled") && !control.hidden);
    if (controls.length === 0) return;
    const first = controls[0]!;
    const last = controls.at(-1)!;
    const active = this.shadowRoot?.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private clearBodySignal(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    const body = this.ownerDocument.body;
    if (!body) return;
    delete body.dataset.cookieBannerOpen;
    body.style.removeProperty("--cookie-banner-height");
  }

  private syncBodySignal(banner: HTMLElement | null): void {
    this.clearBodySignal();
    if (!banner || !this.openState) return;
    const body = this.ownerDocument.body;
    if (!body) return;
    body.dataset.cookieBannerOpen = "true";
    const publishHeight = () =>
      body.style.setProperty(
        "--cookie-banner-height",
        `${banner.offsetHeight}px`,
      );
    publishHeight();
    const ResizeObserverCtor = this.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserverCtor) {
      this.resizeObserver = new ResizeObserverCtor(publishHeight);
      this.resizeObserver.observe(banner);
    }
  }

  private text(
    attribute: string,
    values: { en: string; fi: string; sv: string },
  ): string {
    const override = this.getAttribute(attribute);
    return override ?? localizedText(this, values);
  }

  private button(
    label: string,
    className: string,
    action: () => void,
  ): HTMLButtonElement {
    const button = this.ownerDocument.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", action);
    return button;
  }

  private policyLink(className = "policy"): HTMLAnchorElement {
    const link = this.ownerDocument.createElement("a");
    link.className = className;
    link.href = safeHref(
      stringAttribute(this, "policy-href", "/privacy-policy"),
    );
    link.textContent = this.text("policy-label", {
      en: "cookie policy",
      fi: "evästekäytäntömme",
      sv: "cookiepolicy",
    });
    return link;
  }

  private buildBanner(): HTMLElement {
    const banner = this.ownerDocument.createElement("div");
    banner.className = "banner";
    banner.role = "region";
    banner.setAttribute(
      "aria-label",
      this.text("banner-label", {
        en: "Cookie preferences",
        fi: "Evästeasetukset",
        sv: "Cookieinställningar",
      }),
    );
    const bar = this.ownerDocument.createElement("div");
    bar.className = "bar";
    const copy = this.ownerDocument.createElement("div");
    copy.className = "copy";
    const summary = this.ownerDocument.createElement("p");
    summary.className = "summary";
    summary.append(
      this.text("summary", {
        en: "We use cookies to improve your experience.",
        fi: "Käytämme evästeitä käyttökokemuksen parantamiseen.",
        sv: "Vi använder cookies för att förbättra din upplevelse.",
      }),
      ` ${this.text("read-our-text", { en: "Read our", fi: "Lue", sv: "Läs vår" })} `,
      this.policyLink(),
      ".",
    );
    copy.append(summary);
    bar.append(copy);
    const actions = this.ownerDocument.createElement("div");
    actions.className = "actions";
    const customize = this.button(
      this.text("customize-label", {
        en: "Customize settings",
        fi: "Mukauta asetuksia",
        sv: "Anpassa inställningar",
      }),
      "tertiary customize",
      () => this.openCustomization(),
    );
    actions.append(
      customize,
      this.button(
        this.text("accept-required-label", {
          en: "Only essential",
          fi: "Vain välttämättömät",
          sv: "Endast nödvändiga",
        }),
        "secondary",
        () => this.acceptRequired(),
      ),
      this.button(
        this.text("accept-all-label", {
          en: "Accept all",
          fi: "Hyväksy kaikki",
          sv: "Godkänn alla",
        }),
        "primary",
        () => this.acceptAll(),
      ),
    );
    bar.append(actions);
    banner.append(bar);
    return banner;
  }

  private buildDialog(): HTMLElement {
    const overlay = this.ownerDocument.createElement("div");
    overlay.className = "overlay";
    overlay.addEventListener("pointerdown", (event) => {
      if (event.target === overlay) this.closeCustomization();
    });
    const dialog = this.ownerDocument.createElement("div");
    dialog.className = "dialog";
    dialog.role = "dialog";
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "consent-title");
    dialog.setAttribute("aria-describedby", "consent-description");
    const header = this.ownerDocument.createElement("header");
    header.className = "header";
    const title = this.ownerDocument.createElement("h2");
    title.id = "consent-title";
    title.className = "title";
    title.textContent = this.text("title", {
      en: "Cookie consent",
      fi: "Evästeiden suostumus",
      sv: "Cookiesamtycke",
    });
    const close = this.button(
      this.text("close-label", { en: "Close", fi: "Sulje", sv: "Stäng" }),
      "close",
      () => this.closeCustomization(),
    );
    close.setAttribute("aria-label", close.textContent ?? "Close");
    close.textContent = "×";
    header.append(title, close);
    dialog.append(header);

    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    const description = this.ownerDocument.createElement("p");
    description.id = "consent-description";
    description.className = "description";
    description.textContent = this.text("description", {
      en: "Choose which optional cookies you allow. Essential cookies are always enabled.",
      fi: "Valitse sallitut valinnaiset evästeet. Välttämättömät evästeet ovat aina käytössä.",
      sv: "Välj vilka valfria cookies du tillåter. Nödvändiga cookies är alltid aktiverade.",
    });
    content.append(description);
    const categories = this.ownerDocument.createElement("div");
    categories.className = "categories";
    this.categories.forEach((category) => {
      const row = this.ownerDocument.createElement("div");
      row.className = "category";
      const categoryCopy = this.ownerDocument.createElement("div");
      categoryCopy.className = "categoryCopy";
      const categoryTitle = this.ownerDocument.createElement("h3");
      categoryTitle.className = "categoryTitle";
      categoryTitle.textContent = category.label;
      categoryCopy.append(categoryTitle);
      if (category.description) {
        const categoryDescription = this.ownerDocument.createElement("p");
        categoryDescription.className = "categoryDescription";
        categoryDescription.textContent = category.description;
        categoryCopy.append(categoryDescription);
      }
      const control = this.ownerDocument.createElement("div");
      control.className = "categoryControl";
      if (category.required) {
        const required = this.ownerDocument.createElement("span");
        required.className = "required";
        required.textContent = this.text("required-label", {
          en: "Required",
          fi: "Pakollinen",
          sv: "Obligatorisk",
        });
        control.append(required);
      }
      const toggle = this.ownerDocument.createElement("label");
      toggle.className = "switch";
      const input = this.ownerDocument.createElement("input");
      input.type = "checkbox";
      input.checked = this.draftValue[category.id] === true;
      input.disabled = category.required === true;
      input.setAttribute("aria-label", category.toggleLabel ?? category.label);
      input.addEventListener("change", () => {
        this.draftValue = this.normalizeValue({
          ...this.draftValue,
          [category.id]: input.checked,
        });
      });
      const track = this.ownerDocument.createElement("span");
      track.className = "switchTrack";
      track.setAttribute("aria-hidden", "true");
      toggle.append(input, track);
      control.append(toggle);
      row.append(categoryCopy, control);
      categories.append(row);
    });
    content.append(categories);
    dialog.append(content);

    const footer = this.ownerDocument.createElement("footer");
    footer.className = "footer";
    footer.append(this.policyLink("button secondary policy"));
    const footerActions = this.ownerDocument.createElement("div");
    footerActions.className = "footerActions";
    footerActions.append(
      this.button(
        this.text("accept-required-label", {
          en: "Only essential",
          fi: "Vain välttämättömät",
          sv: "Endast nödvändiga",
        }),
        "secondary",
        () => this.acceptRequired(),
      ),
      this.button(
        this.text("save-label", {
          en: "Save choices",
          fi: "Tallenna valinnat",
          sv: "Spara val",
        }),
        "primary",
        () => this.save(),
      ),
      this.button(
        this.text("accept-all-label", {
          en: "Accept all",
          fi: "Hyväksy kaikki",
          sv: "Godkänn alla",
        }),
        "primary",
        () => this.acceptAll(),
      ),
    );
    footer.append(footerActions);
    dialog.append(footer);
    overlay.append(dialog);
    return overlay;
  }

  private render(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    const fragment = this.ownerDocument.createDocumentFragment();
    let banner: HTMLElement | null = null;
    if (this.openState) {
      banner = this.buildBanner();
      if (this.customizing) {
        banner.inert = true;
        banner.setAttribute("inert", "");
        banner.setAttribute("aria-hidden", "true");
      }
      fragment.append(banner);
      if (this.customizing) fragment.append(this.buildDialog());
    }
    this.replaceShadow(styles, fragment);
    this.syncBodySignal(banner);
    if (!this.customizing) this.detachDialogListeners();
  }
}
