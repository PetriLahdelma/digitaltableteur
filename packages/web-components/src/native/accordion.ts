import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const ACCORDION_TYPES = ["single", "multiple"] as const;
const ACCORDION_VARIANTS = ["contained", "enclosed", "divided"] as const;

export type DtAccordionType = (typeof ACCORDION_TYPES)[number];
export type DtAccordionVariant = (typeof ACCORDION_VARIANTS)[number];

export interface DtAccordionItem {
  id: string;
  title: string;
  content?: string;
  disabled?: boolean;
}

const styles = `
  :host {
    display: block;
    color: var(--primary-text-color, currentcolor);
    font-family: var(--font-text, var(--primary-body-font, sans-serif));
  }
  :host([hidden]) { display: none; }
  .accordion {
    color: inherit;
    font: inherit;
  }
  .contained,
  .enclosed {
    border: 1px solid var(--color-border, currentcolor);
    border-radius: var(--radius-lg, 1rem);
    overflow: hidden;
  }
  .contained .item + .item,
  .divided .item + .item {
    border-block-start: 1px solid var(--color-border, currentcolor);
  }
  .item {
    color: inherit;
  }
  .heading {
    margin: 0;
    font: inherit;
  }
  .trigger {
    display: flex;
    inline-size: 100%;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-internal-12, 0.75rem);
    padding: var(--space-internal-12, 0.75rem) var(--space-internal-16, 1rem);
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-weight: 500;
    text-align: start;
    transition:
      background-color var(--duration-fast, 160ms)
        var(--ease-out-cubic, ease),
      color var(--duration-fast, 160ms) var(--ease-out-cubic, ease);
  }
  .trigger:hover:not(:disabled) {
    background: var(--color-light-bg, rgba(0, 0, 0, 0.04));
  }
  .trigger:focus-visible {
    outline: 2px solid var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: -2px;
  }
  .trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .title {
    min-inline-size: 0;
    flex: 1 1 auto;
  }
  .title::slotted(*) {
    margin: 0;
  }
  .icon {
    display: inline-flex;
    flex: 0 0 auto;
    color: var(--color-muted, currentcolor);
    transition: transform var(--duration-fast, 160ms)
      var(--ease-out-cubic, ease);
  }
  .item[data-open="true"] .icon {
    transform: rotate(90deg);
  }
  .panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--duration-normal, 280ms)
      var(--ease-out-cubic, ease);
  }
  .panel[data-open="true"] {
    grid-template-rows: 1fr;
  }
  .panelInner {
    overflow: hidden;
  }
  .content {
    padding: var(--space-internal-12, 0.75rem) var(--space-internal-16, 1rem);
    color: var(--secondary-text-color, currentcolor);
  }
  .content::slotted(*) {
    margin-block: 0 0.75rem;
  }
  .content::slotted(*:last-child) {
    margin-block-end: 0;
  }
  @media (forced-colors: active) {
    .trigger:focus-visible {
      outline: 3px solid Highlight;
      outline-offset: 2px;
      forced-color-adjust: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .trigger,
    .icon,
    .panel {
      transition: none;
    }
  }
`;

export class DtAccordionElement extends DigitaltableteurElement {
  static observedAttributes = [
    "type",
    "variant",
    "default-open-id",
    "default-open-ids",
    "open-ids",
    "items",
  ];

  private assignedItems: DtAccordionItem[] | null = null;
  private assignedOpenIds: string[] | null = null;
  private defaultOpenInitialized = false;
  private internalOpenIds: string[] = [];
  private instanceId = 0;

  connectedCallback(): void {
    if (this.instanceId === 0) {
      DtAccordionElement.sequence += 1;
      this.instanceId = DtAccordionElement.sequence;
    }
    this.observeLightDom(() => this.render());
    if (!this.defaultOpenInitialized) {
      this.defaultOpenInitialized = true;
      this.internalOpenIds = this.normalizeOpenIds(this.seedDefaultOpenIds());
    }
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (name === "items") this.assignedItems = null;
    if (name === "open-ids") this.assignedOpenIds = null;
    if (
      (name === "default-open-id" || name === "default-open-ids") &&
      !this.isControlled
    ) {
      this.internalOpenIds = this.normalizeOpenIds(this.seedDefaultOpenIds());
      this.defaultOpenInitialized = true;
    }
    if (this.isConnected) this.render();
  }

  private static sequence = 0;

  get type(): DtAccordionType {
    return enumAttribute(this, "type", ACCORDION_TYPES, "single");
  }
  set type(value: DtAccordionType) {
    reflectAttribute(this, "type", value);
  }

  get variant(): DtAccordionVariant {
    return enumAttribute(this, "variant", ACCORDION_VARIANTS, "contained");
  }
  set variant(value: DtAccordionVariant) {
    reflectAttribute(this, "variant", value);
  }

  get defaultOpenId(): string {
    return stringAttribute(this, "default-open-id");
  }
  set defaultOpenId(value: string) {
    reflectAttribute(this, "default-open-id", value || null);
  }

  get defaultOpenIds(): string[] {
    return this.parseStringArray(this.getAttribute("default-open-ids"));
  }
  set defaultOpenIds(value: string[]) {
    reflectAttribute(this, "default-open-ids", JSON.stringify(value));
  }

  get openIds(): string[] | undefined {
    if (!this.isControlled) return undefined;
    return [...(this.assignedOpenIds ?? this.parseStringArray(this.getAttribute("open-ids")))];
  }
  set openIds(value: string[] | undefined) {
    this.assignedOpenIds = value ? [...value] : null;
    if (value === undefined) {
      this.removeAttribute("open-ids");
    } else {
      reflectAttribute(this, "open-ids", JSON.stringify(value));
    }
    if (this.isConnected) this.render();
  }

  get items(): DtAccordionItem[] {
    return this.assignedItems ?? this.parseItems();
  }
  set items(value: DtAccordionItem[]) {
    this.assignedItems = value.map((item) => ({ ...item }));
    if (this.isConnected) this.render();
  }

  private get isControlled(): boolean {
    return this.assignedOpenIds !== null || this.hasAttribute("open-ids");
  }

  private get activeOpenIds(): string[] {
    return this.isControlled
      ? this.normalizeOpenIds(this.openIds ?? [])
      : this.normalizeOpenIds(this.internalOpenIds);
  }

  private parseItems(): DtAccordionItem[] {
    const source = this.getAttribute("items");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const candidate = item as Record<string, unknown>;
        return typeof candidate.id === "string" &&
          typeof candidate.title === "string"
          ? [
              {
                id: candidate.id,
                title: candidate.title,
                content:
                  typeof candidate.content === "string"
                    ? candidate.content
                    : undefined,
                disabled: candidate.disabled === true,
              },
            ]
          : [];
      });
    } catch {
      return [];
    }
  }

  private parseStringArray(source: string | null): string[] {
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return source
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  private normalizeOpenIds(ids: string[]): string[] {
    const available = new Set(this.items.map((item) => item.id));
    const filtered = [...new Set(ids.filter((id) => available.has(id)))];
    return this.type === "single" ? filtered.slice(0, 1) : filtered;
  }

  private seedDefaultOpenIds(): string[] {
    const defaults = this.defaultOpenIds;
    if (defaults.length > 0) return defaults;
    return this.defaultOpenId ? [this.defaultOpenId] : [];
  }

  private toggle(id: string, disabled: boolean): void {
    if (disabled) return;
    const current = new Set(this.activeOpenIds);
    if (current.has(id)) current.delete(id);
    else {
      if (this.type === "single") current.clear();
      current.add(id);
    }
    const next = this.normalizeOpenIds([...current]);
    if (!this.isControlled) this.internalOpenIds = next;
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { openIds: [...next] },
        bubbles: true,
        composed: true,
      }),
    );
    if (!this.isControlled) this.render();
  }

  private render(): void {
    const items = this.items;
    if (items.length === 0) {
      this.replaceShadow(styles, this.ownerDocument.createDocumentFragment());
      return;
    }

    const openIds = new Set(this.activeOpenIds);
    const wasFocusedKey = this.focusedTriggerKey();
    const root = this.ownerDocument.createElement("div");
    root.className = `accordion ${this.variant}`;
    root.setAttribute("part", "root");

    for (const item of items) {
      const open = openIds.has(item.id);
      const itemKey = this.itemKey(item.id);
      const wrapper = this.ownerDocument.createElement("div");
      wrapper.className = "item";
      wrapper.dataset.open = String(open);
      wrapper.setAttribute("part", "item");

      const heading = this.ownerDocument.createElement("h3");
      heading.className = "heading";
      heading.setAttribute("part", "heading");

      const trigger = this.ownerDocument.createElement("button");
      trigger.type = "button";
      trigger.className = "trigger";
      trigger.id = this.triggerId(item.id);
      trigger.setAttribute("part", "trigger");
      trigger.setAttribute("aria-expanded", String(open));
      trigger.setAttribute("aria-controls", this.panelId(item.id));
      trigger.disabled = item.disabled === true;
      trigger.dataset.itemKey = itemKey;
      let ignoreNextClick = false;
      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
          return;
        }
        event.preventDefault();
        ignoreNextClick = true;
        queueMicrotask(() => {
          ignoreNextClick = false;
        });
        this.toggle(item.id, item.disabled === true);
      });
      trigger.addEventListener("click", () => {
        if (ignoreNextClick) {
          ignoreNextClick = false;
          return;
        }
        this.toggle(item.id, item.disabled === true);
      });

      const title = this.ownerDocument.createElement("span");
      title.className = "title";
      title.setAttribute("part", "title");
      const titleSlot = this.ownerDocument.createElement("slot");
      titleSlot.name = `title-${item.id}`;
      titleSlot.textContent = item.title;
      title.append(titleSlot);

      const icon = this.ownerDocument.createElement("span");
      icon.className = "icon";
      icon.setAttribute("part", "icon");
      icon.setAttribute("aria-hidden", "true");
      icon.append(this.caretIcon());

      trigger.append(title, icon);
      heading.append(trigger);

      const panel = this.ownerDocument.createElement("div");
      panel.className = "panel";
      panel.dataset.open = String(open);
      panel.setAttribute("part", "panel");
      const panelInner = this.ownerDocument.createElement("div");
      panelInner.className = "panelInner";
      panelInner.setAttribute("part", "panel-inner");
      const content = this.ownerDocument.createElement("div");
      content.className = "content";
      content.id = this.panelId(item.id);
      content.setAttribute("part", "content");
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", this.triggerId(item.id));
      if (!open) {
        content.setAttribute("aria-hidden", "true");
        content.setAttribute("inert", "");
      }
      const contentSlot = this.ownerDocument.createElement("slot");
      contentSlot.name = `content-${item.id}`;
      if (item.content) contentSlot.textContent = item.content;
      content.append(contentSlot);
      panelInner.append(content);
      panel.append(panelInner);

      wrapper.append(heading, panel);
      root.append(wrapper);
    }

    this.replaceShadow(styles, root);

    if (wasFocusedKey) {
      const trigger = this.shadowRoot?.querySelector<HTMLButtonElement>(
        `button[data-item-key="${wasFocusedKey}"]`,
      );
      trigger?.focus();
    }
  }

  private focusedTriggerKey(): string | null {
    const active = this.shadowRoot?.activeElement;
    if (!(active instanceof HTMLButtonElement)) return null;
    return active.dataset.itemKey ?? null;
  }

  private itemKey(id: string): string {
    return `${this.instanceId}:${id}`;
  }

  private triggerId(id: string): string {
    return `dt-accordion-trigger-${this.instanceId}-${id}`;
  }

  private panelId(id: string): string {
    return `dt-accordion-panel-${this.instanceId}-${id}`;
  }

  private caretIcon(): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = this.ownerDocument.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    const path = this.ownerDocument.createElementNS(ns, "path");
    path.setAttribute("d", "M5.5 3.5 10 8l-4.5 4.5");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-width", "1.75");
    svg.append(path);
    return svg;
  }
}
