import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText, resolveElementLocale } from "./localization";

const VARIANTS = ["image", "initials"] as const;
const LOADINGS = ["lazy", "eager"] as const;
const DECODINGS = ["auto", "sync", "async"] as const;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const URL_PARSE_BASE = "https://example.invalid";
const DEFAULT_SIZES = "(max-width: 600px) 56px, 40px";

export type DtAvatarVariant = (typeof VARIANTS)[number];
export type DtAvatarLoading = (typeof LOADINGS)[number];
export type DtAvatarDecoding = (typeof DECODINGS)[number];

export interface DtAvatarMenuItem {
  label: string;
  href?: string;
  icon?: string;
  id?: string;
  value?: string;
  disabled?: boolean;
}

const styles = `
  :host { display: inline-flex; vertical-align: middle; font-family: var(--font-body, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .menu, .trigger, .link { display: inline-flex; }
  .menu { position: relative; }
  .trigger, .link { padding: 0; border: 0; border-radius: 50%; background: transparent; color: inherit; text-decoration: none; }
  .trigger { cursor: pointer; }
  .trigger:focus-visible, .link:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; }
  .visual { display: inline-flex; inline-size: var(--avatar-size, 2.5rem); block-size: var(--avatar-size, 2.5rem); flex: none; align-items: center; justify-content: center; overflow: hidden; border-radius: 50%; }
  img.visual { display: block; object-fit: cover; }
  .initials { background-color: var(--color-primary, #0047ab); color: var(--color-white, #fff); font-size: clamp(0.875rem, 0.4vw + 0.8rem, 1.125rem); font-weight: 500; line-height: 1; text-transform: uppercase; user-select: none; }
  .panel { position: absolute; inset-block-start: calc(100% + 0.5rem); inset-inline-end: 0; z-index: 10; display: flex; min-inline-size: 12rem; padding: 0.375rem; flex-direction: column; gap: 0.125rem; border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12)); border-radius: var(--radius-lg, 0.75rem); background: var(--color-surface, #fff); box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12); }
  .panel[hidden] { display: none; }
  .item { display: flex; min-block-size: 2.5rem; padding: 0.625rem 0.75rem; align-items: center; gap: 0.5rem; border: 0; border-radius: var(--radius-md, 0.5rem); background: transparent; color: var(--color-text, currentcolor); font: inherit; text-align: start; text-decoration: none; cursor: pointer; }
  .item[aria-disabled="true"] { color: var(--color-muted-light, GrayText); cursor: not-allowed; }
  .item:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: -1px; }
  .icon { display: inline-flex; flex: none; align-items: center; justify-content: center; }
  .label { flex: 1 1 auto; }
  slot[name="menu-item"]::slotted(*) { font: inherit; }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (hover: hover) and (pointer: fine) { .item:not([aria-disabled="true"]):hover { background: color-mix(in srgb, currentcolor 8%, transparent); } }
  @media (forced-colors: active) {
    .panel { border-color: CanvasText; box-shadow: none; }
    .item[aria-disabled="true"] { color: GrayText; }
  }
`;

function cloneMenuItem(item: DtAvatarMenuItem): DtAvatarMenuItem {
  return { ...item };
}

function safeHref(value: string): string {
  const href = value.trim();
  if (!href) return "#";
  if (href.startsWith("//")) return "#";
  if (
    (href.startsWith("/") && !href.startsWith("//")) ||
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

export class DtAvatarElement extends DigitaltableteurElement {
  static observedAttributes = [
    "name",
    "image-url",
    "clickable",
    "destination-url",
    "size",
    "src-set",
    "srcset",
    "sizes",
    "loading",
    "decoding",
    "variant",
    "menu-items",
    "menu-label",
    "lang",
  ];

  private assignedMenuItems: DtAvatarMenuItem[] | null = null;
  private menuOpen = false;
  private managedSlottedItems = new Map<
    HTMLElement,
    {
      role: string | null;
      tabIndex: string | null;
      ariaDisabled: string | null;
    }
  >();

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  disconnectedCallback(): void {
    this.menuOpen = false;
    this.detachMenuListeners();
    this.restoreSlottedMenuItems();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "menu-items") this.assignedMenuItems = null;
    if (!this.hasMenu) this.menuOpen = false;
    if (this.isConnected) this.render();
  }

  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  get imageUrl(): string {
    return stringAttribute(this, "image-url");
  }
  set imageUrl(value: string) {
    reflectAttribute(this, "image-url", value || null);
  }

  get clickable(): boolean {
    return this.hasAttribute("clickable");
  }
  set clickable(value: boolean) {
    reflectBooleanAttribute(this, "clickable", value);
  }

  get destinationUrl(): string {
    return stringAttribute(this, "destination-url");
  }
  set destinationUrl(value: string) {
    reflectAttribute(this, "destination-url", value || null);
  }

  get size(): string {
    return stringAttribute(this, "size", "2.5rem");
  }
  set size(value: string) {
    reflectAttribute(this, "size", value || null);
  }

  get srcSet(): string {
    return stringAttribute(this, "src-set") || stringAttribute(this, "srcset");
  }
  set srcSet(value: string) {
    reflectAttribute(this, "src-set", value || null);
  }

  get sizes(): string {
    return stringAttribute(this, "sizes");
  }
  set sizes(value: string) {
    reflectAttribute(this, "sizes", value || null);
  }

  get loading(): DtAvatarLoading {
    return enumAttribute(this, "loading", LOADINGS, "lazy");
  }
  set loading(value: DtAvatarLoading) {
    reflectAttribute(this, "loading", value);
  }

  get decoding(): DtAvatarDecoding {
    return enumAttribute(this, "decoding", DECODINGS, "async");
  }
  set decoding(value: DtAvatarDecoding) {
    reflectAttribute(this, "decoding", value);
  }

  get variant(): DtAvatarVariant {
    return enumAttribute(this, "variant", VARIANTS, "image");
  }
  set variant(value: DtAvatarVariant) {
    reflectAttribute(this, "variant", value);
  }

  get menuItems(): DtAvatarMenuItem[] {
    return this.assignedMenuItems ?? this.parseMenuItemsAttribute();
  }
  set menuItems(value: DtAvatarMenuItem[]) {
    this.assignedMenuItems = value.map(cloneMenuItem);
    if (this.isConnected) this.render();
  }

  get menuLabel(): string {
    return stringAttribute(this, "menu-label");
  }
  set menuLabel(value: string) {
    reflectAttribute(this, "menu-label", value || null);
  }

  private get hasMenuItemsSlot(): boolean {
    return hasNamedSlot(this, "menu-item");
  }

  private get hasMenu(): boolean {
    return this.hasMenuItemsSlot || this.menuItems.length > 0;
  }

  private parseMenuItemsAttribute(): DtAvatarMenuItem[] {
    const source = this.getAttribute("menu-items");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const value = item as Record<string, unknown>;
        if (typeof value.label !== "string") return [];
        return [
          {
            label: value.label,
            href: typeof value.href === "string" ? value.href : undefined,
            icon: typeof value.icon === "string" ? value.icon : undefined,
            id: typeof value.id === "string" ? value.id : undefined,
            value: typeof value.value === "string" ? value.value : undefined,
            disabled: value.disabled === true,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private initials(): string {
    return this.name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  private triggerLabel(): string {
    if (this.menuLabel) return this.menuLabel;
    if (this.name) {
      const locale = resolveElementLocale(this);
      return locale === "en"
        ? `${this.name} menu`
        : `${this.name}, ${locale === "fi" ? "valikko" : "meny"}`;
    }
    return localizedText(this, {
      en: "Avatar menu",
      fi: "Avatar-valikko",
      sv: "Avatarmeny",
    });
  }

  private detachMenuListeners(): void {
    const view = this.ownerDocument.defaultView;
    view?.removeEventListener("keydown", this.handleDocumentKeydown);
    this.ownerDocument.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );
  }

  private attachMenuListeners(): void {
    const view = this.ownerDocument.defaultView;
    view?.addEventListener("keydown", this.handleDocumentKeydown);
    this.ownerDocument.addEventListener("pointerdown", this.handlePointerDown);
  }

  private closeMenu(returnFocus = false): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    this.detachMenuListeners();
    this.render();
    if (returnFocus) {
      const trigger =
        this.shadowRoot?.querySelector<HTMLButtonElement>(".trigger");
      trigger?.focus();
    }
  }

  private readonly handlePointerDown = (event: Event): void => {
    if (!this.menuOpen) return;
    if (event.composedPath().includes(this)) return;
    this.closeMenu();
  };

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (!this.menuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeMenu(true);
    } else if (event.key === "Tab") {
      this.closeMenu();
    }
  };

  private readonly handleTriggerClick = (): void => {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) this.attachMenuListeners();
    else this.detachMenuListeners();
    this.render();
    if (this.menuOpen) queueMicrotask(() => this.focusMenuItem(0));
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!this.menuOpen) {
      this.menuOpen = true;
      this.attachMenuListeners();
      this.render();
    }
    queueMicrotask(() => this.focusMenuItem(event.key === "ArrowUp" ? -1 : 0));
  };

  private slottedMenuItems(): HTMLElement[] {
    return [...this.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.slot === "menu-item",
    );
  }

  private restoreSlottedMenuItems(): void {
    for (const [item, original] of this.managedSlottedItems) {
      for (const [name, value] of [
        ["role", original.role],
        ["tabindex", original.tabIndex],
        ["aria-disabled", original.ariaDisabled],
      ] as const) {
        if (value === null) item.removeAttribute(name);
        else item.setAttribute(name, value);
      }
    }
    this.managedSlottedItems.clear();
  }

  private syncSlottedMenuItems(): void {
    this.restoreSlottedMenuItems();
    for (const item of this.slottedMenuItems()) {
      this.managedSlottedItems.set(item, {
        role: item.getAttribute("role"),
        tabIndex: item.getAttribute("tabindex"),
        ariaDisabled: item.getAttribute("aria-disabled"),
      });
      if (!item.hasAttribute("role")) item.setAttribute("role", "menuitem");
      item.setAttribute("tabindex", "-1");
      if (item.matches(":disabled") && !item.hasAttribute("aria-disabled")) {
        item.setAttribute("aria-disabled", "true");
      }
    }
  }

  private isDisabledMenuControl(control: HTMLElement): boolean {
    return (
      control.getAttribute("aria-disabled") === "true" ||
      control.matches(":disabled")
    );
  }

  private menuControls(): HTMLElement[] {
    const internal = [
      ...(this.shadowRoot?.querySelectorAll<HTMLElement>(".item") ?? []),
    ];
    return [...internal, ...this.slottedMenuItems()].filter(
      (control) => !this.isDisabledMenuControl(control),
    );
  }

  private focusMenuItem(index: number): void {
    const controls = this.menuControls();
    const resolvedIndex = index < 0 ? controls.length - 1 : index;
    controls[resolvedIndex]?.focus();
  }

  private readonly handleMenuKeydown = (event: KeyboardEvent): void => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const controls = this.menuControls();
    if (controls.length === 0) return;
    event.preventDefault();
    const activeElement =
      this.shadowRoot?.activeElement ?? this.ownerDocument.activeElement;
    const currentIndex = controls.indexOf(activeElement as HTMLElement);
    if (event.key === "Home") this.focusMenuItem(0);
    else if (event.key === "End") this.focusMenuItem(-1);
    else if (event.key === "ArrowDown") {
      this.focusMenuItem((currentIndex + 1) % controls.length);
    } else {
      this.focusMenuItem(
        currentIndex <= 0 ? controls.length - 1 : currentIndex - 1,
      );
    }
  };

  private readonly handleItemClick = (
    item: DtAvatarMenuItem,
    event: Event,
  ): void => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    this.dispatchEvent(
      new CustomEvent("menu-select", {
        detail: {
          item: cloneMenuItem(item),
          id: item.id ?? null,
          value: item.value ?? item.id ?? item.label,
        },
        bubbles: true,
        composed: true,
      }),
    );
    this.closeMenu();
  };

  private readonly handleSlottedItemClick = (event: Event): void => {
    const control = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement &&
          node.parentElement === this &&
          node.slot === "menu-item",
      );
    if (!control) return;

    const label =
      control.getAttribute("aria-label") || control.textContent?.trim() || "";
    const id = control.dataset.id || control.id || undefined;
    const value = control.dataset.value || id || label;
    const href =
      control instanceof HTMLAnchorElement
        ? control.getAttribute("href") || undefined
        : undefined;
    this.handleItemClick(
      {
        label,
        id,
        value,
        href,
        disabled: this.isDisabledMenuControl(control),
      },
      event,
    );
  };

  private avatarStyle(): string {
    return `--avatar-size: ${this.size};`;
  }

  private renderVisual(): HTMLElement {
    const shouldRenderImage =
      this.variant === "image" && Boolean(this.imageUrl);
    if (shouldRenderImage) {
      const image = this.ownerDocument.createElement("img");
      image.className = "visual";
      image.setAttribute("part", "image");
      image.src = this.imageUrl;
      image.alt =
        this.name ||
        localizedText(this, { en: "Avatar", fi: "Avatar", sv: "Avatar" });
      image.loading = this.loading;
      image.decoding = this.decoding;
      image.setAttribute("loading", this.loading);
      image.setAttribute("decoding", this.decoding);
      image.style.cssText = this.avatarStyle();
      image.srcset = this.srcSet || `${this.imageUrl} 1x`;
      image.sizes =
        this.sizes || (this.hasAttribute("size") ? this.size : DEFAULT_SIZES);
      return image;
    }

    const initials = this.ownerDocument.createElement("div");
    initials.className = "visual initials";
    initials.setAttribute("part", "initials");
    initials.style.cssText = this.avatarStyle();
    initials.textContent = this.initials();
    return initials;
  }

  private renderMenuPanel(): HTMLElement {
    const panel = this.ownerDocument.createElement("div");
    panel.className = "panel";
    panel.setAttribute("part", "menu");
    panel.setAttribute("role", "menu");
    panel.hidden = !this.menuOpen;
    panel.addEventListener("keydown", this.handleMenuKeydown);

    if (this.hasMenuItemsSlot) {
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "menu-item";
      slot.addEventListener("slotchange", () => this.syncSlottedMenuItems());
      slot.addEventListener("click", this.handleSlottedItemClick);
      panel.append(slot);
      this.syncSlottedMenuItems();
      return panel;
    }

    this.restoreSlottedMenuItems();

    for (const item of this.menuItems) {
      const control = item.href
        ? this.ownerDocument.createElement("a")
        : this.ownerDocument.createElement("button");
      control.className = "item";
      control.setAttribute("part", "menu-item");
      control.setAttribute("role", "menuitem");
      if (item.disabled) control.setAttribute("aria-disabled", "true");
      if (control instanceof HTMLButtonElement) {
        control.type = "button";
        control.disabled = item.disabled === true;
      } else if (item.href) {
        control.href = safeHref(item.href);
        if (item.disabled) {
          control.removeAttribute("href");
          control.tabIndex = -1;
        }
      }
      if (item.icon) {
        const icon = this.ownerDocument.createElement("span");
        icon.className = "icon";
        icon.setAttribute("part", "menu-item-icon");
        icon.textContent = item.icon;
        control.append(icon);
      }
      const label = this.ownerDocument.createElement("span");
      label.className = "label";
      label.textContent = item.label;
      control.append(label);
      control.addEventListener("click", (event) =>
        this.handleItemClick(item, event),
      );
      panel.append(control);
    }

    return panel;
  }

  private render(): void {
    if (!this.hasMenu) this.detachMenuListeners();
    if (!this.hasMenu) this.menuOpen = false;

    const visual = this.renderVisual();

    if (this.hasMenu) {
      const wrapper = this.ownerDocument.createElement("div");
      wrapper.className = "menu";
      wrapper.setAttribute("part", "menu-trigger-wrapper");

      const trigger = this.ownerDocument.createElement("button");
      trigger.type = "button";
      trigger.className = "trigger";
      trigger.setAttribute("part", "trigger");
      trigger.setAttribute("aria-label", this.triggerLabel());
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", this.menuOpen ? "true" : "false");
      trigger.append(visual);
      trigger.addEventListener("click", this.handleTriggerClick);
      trigger.addEventListener("keydown", this.handleTriggerKeydown);

      wrapper.append(trigger, this.renderMenuPanel());
      this.replaceShadow(styles, wrapper);
      return;
    }

    if (this.clickable && this.destinationUrl) {
      const link = this.ownerDocument.createElement("a");
      link.className = "link";
      link.setAttribute("part", "link");
      link.href = safeHref(this.destinationUrl);
      link.append(visual);
      this.replaceShadow(styles, link);
      return;
    }

    this.replaceShadow(styles, visual);
  }
}
