import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  numberAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const SIZES = ["sm", "md", "lg"] as const;
export type DtAvatarGroupSize = (typeof SIZES)[number];

type OriginalMargin = { value: string; priority: string };

const styles = `
  :host { display: inline-block; vertical-align: middle; }
  :host([hidden]) { display: none; }
  .group { display: inline-flex; align-items: center; }
  .hasVisibleOverflow .overflow { margin-inline-start: calc(-1 * var(--space-internal-8, 0.5rem)); }
  ::slotted([data-dt-avatar-group-hidden="true"]) { display: none !important; }
  ::slotted(*) { display: inline-flex; flex: none; border-radius: 50%; box-shadow: 0 0 0 2px var(--color-surface, #fff); }
  ::slotted([data-dt-avatar-group-position="middle"]), ::slotted([data-dt-avatar-group-position="last"]) { margin-inline-start: calc(-1 * var(--space-internal-8, 0.5rem)); }
  .overflow { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background-color: var(--color-neutral-bg, #f2f4f7); box-shadow: 0 0 0 2px var(--color-surface, #fff); color: var(--color-neutral-text, #344054); font-family: var(--font-body, var(--primary-body-font, sans-serif)); font-size: var(--font-size-text-xxs, 0.75rem); font-weight: 500; line-height: 1; }
  .sm .overflow { inline-size: 2rem; block-size: 2rem; }
  .md .overflow { inline-size: 2.5rem; block-size: 2.5rem; }
  .lg .overflow { inline-size: 3rem; block-size: 3rem; }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (forced-colors: active) {
    ::slotted(*) { box-shadow: 0 0 0 2px Canvas; }
    .overflow { border: 1px solid CanvasText; box-shadow: 0 0 0 2px Canvas; }
  }
`;

export class DtAvatarGroupElement extends DigitaltableteurElement {
  static observedAttributes = ["aria-label", "lang", "max", "size"];

  private managedChildren = new Set<HTMLElement>();
  private originalMargins = new Map<HTMLElement, OriginalMargin>();

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  disconnectedCallback(): void {
    this.clearManagedChildren();
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get ariaLabel(): string {
    return stringAttribute(this, "aria-label");
  }
  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }

  get max(): number {
    return Math.max(0, Math.floor(numberAttribute(this, "max", 4)));
  }
  set max(value: number) {
    reflectAttribute(
      this,
      "max",
      Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null,
    );
  }

  get size(): DtAvatarGroupSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtAvatarGroupSize) {
    reflectAttribute(this, "size", value);
  }

  private get items(): HTMLElement[] {
    return [...this.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && !child.hasAttribute("slot"),
    );
  }

  private clearManagedChildren(): void {
    for (const child of this.managedChildren) {
      child.removeAttribute("data-dt-avatar-group-position");
      child.removeAttribute("data-dt-avatar-group-hidden");
      const originalMargin = this.originalMargins.get(child);
      if (originalMargin?.value) {
        child.style.setProperty(
          "margin-inline-start",
          originalMargin.value,
          originalMargin.priority,
        );
      } else {
        child.style.removeProperty("margin-inline-start");
      }
    }
    this.managedChildren.clear();
    this.originalMargins.clear();
  }

  private syncChildren(): void {
    this.clearManagedChildren();
    const visibleCount = Math.min(this.max, this.items.length);
    this.items.forEach((child, index) => {
      if (index >= visibleCount) {
        child.setAttribute("data-dt-avatar-group-hidden", "true");
        this.managedChildren.add(child);
        return;
      }
      const position =
        visibleCount === 1
          ? "only"
          : index === 0
            ? "first"
            : index === visibleCount - 1
              ? "last"
              : "middle";
      child.setAttribute("data-dt-avatar-group-position", position);
      if (index > 0) {
        this.originalMargins.set(child, {
          value: child.style.getPropertyValue("margin-inline-start"),
          priority: child.style.getPropertyPriority("margin-inline-start"),
        });
        child.style.setProperty(
          "margin-inline-start",
          "calc(-1 * var(--space-internal-8, 0.5rem))",
        );
      }
      this.managedChildren.add(child);
    });
  }

  private overflowCount(): number {
    return Math.max(0, this.items.length - this.max);
  }

  private render(): void {
    const overflow = this.overflowCount();
    const visibleCount = Math.min(this.max, this.items.length);
    const group = this.ownerDocument.createElement("div");
    group.className = [
      "group",
      this.size,
      overflow > 0 && visibleCount > 0 ? "hasVisibleOverflow" : "",
    ]
      .filter(Boolean)
      .join(" ");
    group.setAttribute("part", "group");
    group.setAttribute("role", "group");
    if (this.ariaLabel) group.setAttribute("aria-label", this.ariaLabel);
    if (!hasDefaultSlotContent(this) && this.items.length === 0) {
      group.setAttribute("aria-hidden", "true");
    }

    const slot = this.ownerDocument.createElement("slot");
    slot.addEventListener("slotchange", () => this.syncChildren());
    group.append(slot);

    if (overflow > 0) {
      const bubble = this.ownerDocument.createElement("span");
      bubble.className = "overflow";
      bubble.setAttribute("part", "overflow");

      const visible = this.ownerDocument.createElement("span");
      visible.setAttribute("aria-hidden", "true");
      visible.textContent = `+${overflow}`;

      const srOnly = this.ownerDocument.createElement("span");
      srOnly.className = "srOnly";
      srOnly.textContent = localizedText(this, {
        en: `${overflow} more`,
        fi: `${overflow} lisää`,
        sv: `${overflow} till`,
      });

      bubble.append(visible, srOnly);
      group.append(bubble);
    }

    this.replaceShadow(styles, group);
    this.syncChildren();
  }
}
