import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

export interface DtCommandPaletteItem {
  id: string;
  label: string;
  keywords?: string[];
  icon?: string;
  onSelect?: () => void;
}

export type DtCommandPaletteDismissReason =
  | "api"
  | "backdrop"
  | "escape"
  | "selection";

const styles = `
  :host {
    position: fixed;
    inset: 0;
    z-index: 5000;
    display: none;
    font-family: var(--font-body, var(--font-text, sans-serif));
  }
  :host([open]) { display: block; }
  :host([hidden]) { display: none; }
  .overlay {
    box-sizing: border-box;
    display: flex;
    inline-size: 100%;
    block-size: 100%;
    padding-block-start: 12vb;
    padding-inline: var(--space-internal-16, 1rem);
    justify-content: center;
    align-items: flex-start;
    background-color: color-mix(in srgb, var(--color-black, #000) 45%, transparent);
  }
  .dialog {
    box-sizing: border-box;
    display: flex;
    inline-size: min(92vi, 34rem);
    max-block-size: 70vb;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--color-border, #d5d5d5);
    border-radius: var(--radius-lg, 8px);
    background-color: var(--color-surface, var(--color-white, #fff));
    color: var(--color-text, #111);
    box-shadow: 0 12px 32px color-mix(in srgb, var(--color-black, #000) 24%, transparent);
  }
  .input {
    box-sizing: border-box;
    inline-size: 100%;
    padding: var(--space-internal-16, 1rem);
    border: 0;
    border-block-end: 1px solid var(--color-border, #d5d5d5);
    background-color: transparent;
    font: inherit;
    font-size: var(--font-size-text-m, 1rem);
    color: inherit;
  }
  .input::placeholder { color: var(--color-muted, #666); }
  .input:focus-visible { outline: none; }
  .list {
    margin: 0;
    padding: var(--space-internal-2, 0.125rem);
    overflow-y: auto;
    overflow-block: auto;
    list-style: none;
  }
  .option {
    display: flex;
    padding: var(--space-internal-12, 0.75rem);
    align-items: center;
    gap: var(--space-internal-12, 0.75rem);
    border-radius: var(--radius-md, 6px);
    outline: none;
    font-size: var(--font-size-text-s, 0.875rem);
    color: inherit;
    cursor: pointer;
  }
  .option[aria-selected="true"] {
    background-color: color-mix(in srgb, var(--color-muted, #666) 18%, transparent);
  }
  .icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
  }
  .icon dt-icon { inline-size: 1rem; block-size: 1rem; }
  .optionLabel { min-inline-size: 0; flex: 1; }
  .empty {
    padding: var(--space-internal-24, 1.5rem);
    font-size: var(--font-size-text-s, 0.875rem);
    text-align: center;
    color: var(--color-muted, #666);
  }
  @media (prefers-reduced-motion: reduce) {
    .list { scroll-behavior: auto; }
  }
  @media (forced-colors: active) {
    .overlay { background: Canvas; }
    .dialog {
      border: 2px solid CanvasText;
      background: Canvas;
      color: CanvasText;
      box-shadow: none;
      forced-color-adjust: none;
    }
    .option[aria-selected="true"] {
      outline: 2px solid Highlight;
      outline-offset: -2px;
      background: Highlight;
      color: HighlightText;
    }
  }
`;

let commandPaletteSequence = 0;
const activePalettes: DtCommandPaletteElement[] = [];
const scrollLocks = new Map<
  Document,
  { owners: Set<DtCommandPaletteElement>; previousOverflow: string }
>();
const inertLocks = new Map<
  HTMLElement,
  { owners: Set<DtCommandPaletteElement>; wasInert: boolean }
>();

function cloneItem(item: DtCommandPaletteItem): DtCommandPaletteItem {
  return {
    id: item.id,
    label: item.label,
    keywords: item.keywords ? [...item.keywords] : undefined,
    icon: item.icon,
    onSelect: item.onSelect,
  };
}

function eventItem(
  item: DtCommandPaletteItem,
): Omit<DtCommandPaletteItem, "onSelect"> {
  return {
    id: item.id,
    label: item.label,
    keywords: item.keywords ? [...item.keywords] : undefined,
    icon: item.icon,
  };
}

export class DtCommandPaletteElement extends DigitaltableteurElement {
  static observedAttributes = [
    "open",
    "default-open",
    "controlled",
    "items",
    "label",
    "placeholder",
    "empty-text",
  ];

  private assignedItems: DtCommandPaletteItem[] | null = null;
  private initialized = false;
  private openState = false;
  private query = "";
  private activeIndex = 0;
  private input: HTMLInputElement | null = null;
  private list: HTMLUListElement | null = null;
  private previousFocus: HTMLElement | null = null;
  private inertedElements = new Set<HTMLElement>();
  private syncingOpenAttribute = false;
  private readonly instanceId = ++commandPaletteSequence;

  connectedCallback(): void {
    if (!this.initialized) {
      this.openState =
        this.hasAttribute("open") ||
        (!this.hasAttribute("open") && this.hasAttribute("default-open"));
      this.initialized = true;
    }
    if (this.openState && !this.hasAttribute("open")) {
      this.syncOpenAttribute(true);
    }
    this.render();
    if (this.openState) this.activate();
  }

  disconnectedCallback(): void {
    this.deactivate(false);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "items") this.assignedItems = null;

    if (name === "open" && !this.syncingOpenAttribute) {
      const wasOpen = this.openState;
      this.openState = this.hasAttribute("open");
      if (this.isConnected && wasOpen !== this.openState) {
        if (this.openState) this.activate();
        else this.deactivate(true);
      }
      return;
    }

    if (
      name === "default-open" &&
      !this.hasAttribute("open") &&
      !this.syncingOpenAttribute
    ) {
      const wasOpen = this.openState;
      this.openState = this.hasAttribute("default-open");
      if (this.isConnected && wasOpen !== this.openState) {
        this.syncOpenAttribute(this.openState);
        if (this.openState) this.activate();
        else this.deactivate(true);
      }
      return;
    }

    if (this.isConnected) {
      const restoreInputFocus =
        this.openState && this.shadowRoot?.activeElement === this.input;
      this.render();
      if (restoreInputFocus) queueMicrotask(() => this.input?.focus());
    }
  }

  get open(): boolean {
    return this.openState;
  }

  set open(value: boolean) {
    this.updateOpen(value, "api", true);
  }

  get defaultOpen(): boolean {
    return this.hasAttribute("default-open");
  }

  set defaultOpen(value: boolean) {
    reflectBooleanAttribute(this, "default-open", value);
  }

  get controlled(): boolean {
    return this.hasAttribute("controlled");
  }

  set controlled(value: boolean) {
    reflectBooleanAttribute(this, "controlled", value);
  }

  get items(): DtCommandPaletteItem[] {
    return (this.assignedItems ?? this.parseItemsAttribute()).map(cloneItem);
  }

  set items(value: DtCommandPaletteItem[]) {
    this.assignedItems = value
      .filter(
        (item) =>
          item && typeof item.id === "string" && typeof item.label === "string",
      )
      .map(cloneItem);
    this.clampActiveIndex();
    if (this.isConnected) this.renderOptions();
  }

  get label(): string {
    return stringAttribute(this, "label", "Command palette");
  }

  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get placeholder(): string {
    return stringAttribute(this, "placeholder", "Search commands…");
  }

  set placeholder(value: string) {
    reflectAttribute(this, "placeholder", value || null);
  }

  get emptyText(): string {
    return stringAttribute(this, "empty-text", "No results");
  }

  set emptyText(value: string) {
    reflectAttribute(this, "empty-text", value || null);
  }

  show(): void {
    this.updateOpen(true, "api", true);
  }

  close(reason: DtCommandPaletteDismissReason = "api"): void {
    this.updateOpen(false, reason, true);
  }

  private get listId(): string {
    return `dt-command-palette-list-${this.instanceId}`;
  }

  private optionId(sourceIndex: number): string {
    return `${this.listId}-option-${sourceIndex}`;
  }

  private parseItemsAttribute(): DtCommandPaletteItem[] {
    const source = this.getAttribute("items");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const item = entry as Record<string, unknown>;
        if (typeof item.id !== "string" || typeof item.label !== "string") {
          return [];
        }
        return [
          {
            id: item.id,
            label: item.label,
            keywords: Array.isArray(item.keywords)
              ? item.keywords.filter(
                  (keyword): keyword is string => typeof keyword === "string",
                )
              : undefined,
            icon: typeof item.icon === "string" ? item.icon : undefined,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private filteredItems(): Array<{
    item: DtCommandPaletteItem;
    sourceIndex: number;
  }> {
    const normalizedQuery = this.query.trim().toLocaleLowerCase();
    return this.items.flatMap((item, sourceIndex) => {
      const matches =
        !normalizedQuery ||
        item.label.toLocaleLowerCase().includes(normalizedQuery) ||
        (item.keywords ?? []).some((keyword) =>
          keyword.toLocaleLowerCase().includes(normalizedQuery),
        );
      return matches ? [{ item, sourceIndex }] : [];
    });
  }

  private clampActiveIndex(): void {
    const lastIndex = Math.max(0, this.filteredItems().length - 1);
    this.activeIndex = Math.min(this.activeIndex, lastIndex);
  }

  private syncOpenAttribute(value: boolean): void {
    this.syncingOpenAttribute = true;
    reflectBooleanAttribute(this, "open", value);
    this.syncingOpenAttribute = false;
  }

  private updateOpen(
    value: boolean,
    reason: DtCommandPaletteDismissReason,
    emit: boolean,
  ): void {
    if (this.openState === value) return;
    this.openState = value;
    this.syncOpenAttribute(value);
    if (this.isConnected) {
      if (value) this.activate();
      else this.deactivate(true);
    }
    if (emit) {
      this.dispatchEvent(
        new CustomEvent("open-change", {
          detail: { open: value, reason },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private requestDismiss(
    reason: Exclude<DtCommandPaletteDismissReason, "api">,
  ): void {
    const approved = this.dispatchEvent(
      new CustomEvent("dismiss-request", {
        detail: { reason },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!approved || this.controlled) return;
    this.updateOpen(false, reason, true);
  }

  private activate(): void {
    const active = this.ownerDocument.activeElement;
    this.previousFocus =
      active instanceof HTMLElement && active !== this ? active : null;
    this.query = "";
    this.activeIndex = 0;
    if (this.input) this.input.value = "";
    this.renderOptions();
    const existingIndex = activePalettes.indexOf(this);
    if (existingIndex >= 0) {
      this.restoreBackground();
      activePalettes.splice(existingIndex, 1);
    }
    activePalettes.at(-1)?.restoreBackground();
    activePalettes.push(this);
    this.lockScroll();
    this.inertBackground();
    this.ownerDocument.addEventListener(
      "keydown",
      this.handleDocumentKeydown,
      true,
    );
    this.ownerDocument.addEventListener(
      "focusin",
      this.handleDocumentFocus,
      true,
    );
    queueMicrotask(() => this.input?.focus());
  }

  private deactivate(restoreFocus: boolean): void {
    const wasTopmost = activePalettes.at(-1) === this;
    const activeIndex = activePalettes.indexOf(this);
    if (activeIndex >= 0) activePalettes.splice(activeIndex, 1);
    this.ownerDocument.removeEventListener(
      "keydown",
      this.handleDocumentKeydown,
      true,
    );
    this.ownerDocument.removeEventListener(
      "focusin",
      this.handleDocumentFocus,
      true,
    );
    this.unlockScroll();
    this.restoreBackground();
    if (wasTopmost) activePalettes.at(-1)?.inertBackground();
    if (restoreFocus && wasTopmost) {
      const previous = this.previousFocus;
      queueMicrotask(() => {
        const nextPalette = activePalettes.at(-1);
        if (nextPalette?.isConnected) nextPalette.input?.focus();
        else if (previous?.isConnected) previous.focus();
      });
    }
    this.previousFocus = null;
  }

  private lockScroll(): void {
    const existing = scrollLocks.get(this.ownerDocument);
    if (existing) {
      existing.owners.add(this);
      return;
    }
    const body = this.ownerDocument.body;
    scrollLocks.set(this.ownerDocument, {
      owners: new Set([this]),
      previousOverflow: body.style.overflow,
    });
    body.style.overflow = "hidden";
  }

  private unlockScroll(): void {
    const lock = scrollLocks.get(this.ownerDocument);
    if (!lock) return;
    lock.owners.delete(this);
    if (lock.owners.size) return;
    this.ownerDocument.body.style.overflow = lock.previousOverflow;
    scrollLocks.delete(this.ownerDocument);
  }

  private inertBackground(): void {
    this.restoreBackground();
    let current: Node = this;
    while (current.parentNode && current.parentNode !== this.ownerDocument) {
      const parent = current.parentNode;
      for (const sibling of parent.childNodes) {
        if (sibling === current || !(sibling instanceof HTMLElement)) continue;
        const lock = inertLocks.get(sibling);
        if (lock) lock.owners.add(this);
        else {
          inertLocks.set(sibling, {
            owners: new Set([this]),
            wasInert: sibling.hasAttribute("inert"),
          });
        }
        this.inertedElements.add(sibling);
        sibling.setAttribute("inert", "");
      }
      current = parent;
    }
  }

  private restoreBackground(): void {
    for (const element of this.inertedElements) {
      const lock = inertLocks.get(element);
      if (!lock) continue;
      lock.owners.delete(this);
      if (lock.owners.size) continue;
      if (!lock.wasInert) element.removeAttribute("inert");
      inertLocks.delete(element);
    }
    this.inertedElements.clear();
  }

  private isEventInside(event: Event): boolean {
    return event.composedPath().includes(this);
  }

  private readonly handleDocumentFocus = (event: FocusEvent): void => {
    if (
      !this.openState ||
      activePalettes.at(-1) !== this ||
      this.isEventInside(event)
    ) {
      return;
    }
    this.input?.focus();
  };

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (!this.openState || activePalettes.at(-1) !== this) return;
    if (event.key === "Tab") {
      event.preventDefault();
      this.input?.focus();
      return;
    }
    if (
      event.key === "Escape" &&
      !event.composedPath().includes(this.input as EventTarget)
    ) {
      event.preventDefault();
      this.requestDismiss("escape");
    }
  };

  private readonly handleInput = (event: Event): void => {
    this.query = (event.currentTarget as HTMLInputElement).value;
    this.clampActiveIndex();
    this.renderOptions();
  };

  private readonly handleInputKeydown = (event: KeyboardEvent): void => {
    const filtered = this.filteredItems();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.activeIndex = filtered.length
          ? (this.activeIndex + 1) % filtered.length
          : 0;
        this.syncActiveSelection(filtered);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.activeIndex = filtered.length
          ? (this.activeIndex - 1 + filtered.length) % filtered.length
          : 0;
        this.syncActiveSelection(filtered);
        break;
      case "Enter":
        event.preventDefault();
        if (filtered[this.activeIndex]) {
          this.selectItem(filtered[this.activeIndex].item);
        }
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        this.requestDismiss("escape");
        break;
      default:
        break;
    }
  };

  private selectItem(item: DtCommandPaletteItem): void {
    const approved = this.dispatchEvent(
      new CustomEvent("item-select", {
        detail: { item: eventItem(item), id: item.id, value: item.id },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!approved) return;
    item.onSelect?.();
    this.requestDismiss("selection");
  }

  private renderOptions(): void {
    if (!this.list || !this.input) return;
    const filtered = this.filteredItems();
    this.clampActiveIndex();
    this.list.replaceChildren();

    if (!filtered.length) {
      const empty = this.ownerDocument.createElement("li");
      empty.className = "empty";
      empty.setAttribute("part", "empty");
      empty.setAttribute("role", "presentation");
      empty.textContent = this.emptyText;
      this.list.append(empty);
      this.input.removeAttribute("aria-activedescendant");
      return;
    }

    filtered.forEach(({ item, sourceIndex }, index) => {
      const option = this.ownerDocument.createElement("li");
      option.id = this.optionId(sourceIndex);
      option.className = "option";
      option.setAttribute("part", "option");
      option.setAttribute("role", "option");
      option.setAttribute(
        "aria-selected",
        index === this.activeIndex ? "true" : "false",
      );

      if (item.icon) {
        const iconWrapper = this.ownerDocument.createElement("span");
        iconWrapper.className = "icon";
        iconWrapper.setAttribute("part", "icon");
        iconWrapper.setAttribute("aria-hidden", "true");
        const icon = this.ownerDocument.createElement("dt-icon");
        icon.setAttribute("name", item.icon);
        icon.setAttribute("size", "sm");
        iconWrapper.append(icon);
        option.append(iconWrapper);
      }

      const label = this.ownerDocument.createElement("span");
      label.className = "optionLabel";
      label.setAttribute("part", "option-label");
      label.textContent = item.label;
      option.append(label);

      option.addEventListener("pointerenter", () => {
        this.activeIndex = index;
        this.syncActiveSelection(filtered);
      });
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => this.selectItem(item));
      this.list?.append(option);
    });

    this.syncActiveSelection(filtered);
  }

  private syncActiveSelection(filtered = this.filteredItems()): void {
    if (!this.input || !this.list) return;
    const options = this.list.querySelectorAll<HTMLElement>("[role=option]");
    options.forEach((option, index) => {
      option.setAttribute(
        "aria-selected",
        index === this.activeIndex ? "true" : "false",
      );
    });

    const active = filtered[this.activeIndex];
    if (active) {
      this.input.setAttribute(
        "aria-activedescendant",
        this.optionId(active.sourceIndex),
      );
      this.list
        .querySelector<HTMLElement>(`#${this.optionId(active.sourceIndex)}`)
        ?.scrollIntoView?.({ block: "nearest" });
    } else {
      this.input.removeAttribute("aria-activedescendant");
    }
  }

  private render(): void {
    const overlay = this.ownerDocument.createElement("div");
    overlay.className = "overlay";
    overlay.setAttribute("part", "overlay");
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) this.requestDismiss("backdrop");
    });

    const dialog = this.ownerDocument.createElement("div");
    dialog.className = "dialog";
    dialog.setAttribute("part", "dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", this.label);

    const input = this.ownerDocument.createElement("input");
    input.className = "input";
    input.setAttribute("part", "input");
    input.type = "text";
    input.value = this.query;
    input.placeholder = this.placeholder;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-controls", this.listId);
    input.setAttribute("aria-autocomplete", "list");
    input.addEventListener("input", this.handleInput);
    input.addEventListener("keydown", this.handleInputKeydown);

    const list = this.ownerDocument.createElement("ul");
    list.id = this.listId;
    list.className = "list";
    list.setAttribute("part", "list");
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", this.label);

    dialog.append(input, list);
    overlay.append(dialog);
    this.input = input;
    this.list = list;
    this.replaceShadow(styles, overlay);
    this.renderOptions();
  }
}
