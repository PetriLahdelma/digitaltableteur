import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TONES = ["info", "success", "warning", "error"] as const;
const LIVE_VALUES = ["polite", "assertive", "off"] as const;
export type DtAlertBannerTone = (typeof TONES)[number];
export type DtAlertBannerAriaLive = (typeof LIVE_VALUES)[number];
const toneIcons: Record<DtAlertBannerTone, string> = {
  info: "info",
  success: "check-circle",
  warning: "warning-circle",
  error: "x-circle",
};
const styles = `
  :host { display: block; }
  .banner { display: flex; padding: var(--space-internal-12, 0.75rem) var(--space-internal-16, 1rem); align-items: flex-start; gap: var(--space-internal-8, 0.5rem); border-radius: var(--radius-md, 8px); font-family: var(--font-text); color: var(--color-text); }
  .content { display: flex; min-inline-size: 0; flex: 1; flex-direction: column; gap: var(--space-internal-4, 0.25rem); }
  .title { margin: 0; font-size: 1rem; font-weight: 600; line-height: 1.35; }
  .description { margin: 0; font-size: 0.875rem; line-height: 1.45; }
  .action { margin-block-start: var(--space-internal-4, 0.25rem); }
  .dismiss { margin-inline-start: auto; padding: var(--space-internal-4) var(--space-internal-8); border: 0; border-radius: var(--radius-md); background: transparent; color: inherit; font: inherit; cursor: pointer; }
  .dismiss:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentcolor); outline-offset: 2px; }
  .info { border: 1px solid color-mix(in srgb, var(--color-info) 40%, var(--color-surface)); background: color-mix(in srgb, var(--color-info) 12%, var(--color-surface)); }
  .success { border: 1px solid color-mix(in srgb, var(--color-success) 40%, var(--color-surface)); background: color-mix(in srgb, var(--color-success) 12%, var(--color-surface)); }
  .warning { border: 1px solid color-mix(in srgb, var(--color-warning) 46%, var(--color-surface)); background: color-mix(in srgb, var(--color-warning) 16%, var(--color-surface)); }
  .error { border: 1px solid color-mix(in srgb, var(--color-error) 40%, var(--color-surface)); background: color-mix(in srgb, var(--color-error) 12%, var(--color-surface)); }
`;

export class DtAlertBannerElement extends DigitaltableteurElement {
  static observedAttributes = [
    "tone",
    "title-text",
    "description",
    "show-icon",
    "dismissible",
    "aria-live",
    "dismiss-label",
  ];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get tone(): DtAlertBannerTone {
    return enumAttribute(this, "tone", TONES, "info");
  }
  set tone(value: DtAlertBannerTone) {
    reflectAttribute(this, "tone", value);
  }
  get titleText(): string {
    return stringAttribute(this, "title-text");
  }
  set titleText(value: string) {
    reflectAttribute(this, "title-text", value || null);
  }
  get description(): string {
    return stringAttribute(this, "description");
  }
  set description(value: string) {
    reflectAttribute(this, "description", value || null);
  }
  get showIcon(): boolean {
    return (
      !this.hasAttribute("show-icon") ||
      this.getAttribute("show-icon") !== "false"
    );
  }
  set showIcon(value: boolean) {
    value
      ? this.removeAttribute("show-icon")
      : this.setAttribute("show-icon", "false");
  }
  get dismissible(): boolean {
    return this.hasAttribute("dismissible");
  }
  set dismissible(value: boolean) {
    reflectBooleanAttribute(this, "dismissible", value);
  }
  get ariaLive(): DtAlertBannerAriaLive {
    return enumAttribute(
      this,
      "aria-live",
      LIVE_VALUES,
      this.tone === "error" ? "assertive" : "polite",
    );
  }
  set ariaLive(value: DtAlertBannerAriaLive) {
    reflectAttribute(this, "aria-live", value);
  }
  private textSlot(
    name: "title" | "description",
    fallback: string,
  ): HTMLElement {
    const element = this.ownerDocument.createElement(
      name === "title" ? "strong" : "span",
    );
    element.className = name;
    element.setAttribute("part", name);
    const slot = this.ownerDocument.createElement("slot");
    slot.name = name;
    if (fallback) slot.textContent = fallback;
    element.append(slot);
    return element;
  }
  private render(): void {
    const banner = this.ownerDocument.createElement("div");
    banner.className = `banner ${this.tone}`;
    banner.setAttribute("part", "banner");
    banner.setAttribute("role", this.tone === "error" ? "alert" : "status");
    banner.setAttribute("aria-live", this.ariaLive);
    if (this.showIcon) {
      const iconSlot = this.ownerDocument.createElement("slot");
      iconSlot.name = "icon";
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", toneIcons[this.tone]);
      icon.setAttribute("aria-label", this.tone);
      icon.setAttribute("part", "icon");
      iconSlot.append(icon);
      banner.append(iconSlot);
    }
    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    content.setAttribute("part", "content");
    if (this.titleText || hasNamedSlot(this, "title")) {
      content.append(this.textSlot("title", this.titleText));
    }
    if (this.description || hasNamedSlot(this, "description")) {
      content.append(this.textSlot("description", this.description));
    }
    if (hasNamedSlot(this, "action")) {
      const action = this.ownerDocument.createElement("div");
      action.className = "action";
      action.setAttribute("part", "action");
      const actionSlot = this.ownerDocument.createElement("slot");
      actionSlot.name = "action";
      action.append(actionSlot);
      content.append(action);
    }
    banner.append(content);
    if (this.dismissible) {
      const dismiss = this.ownerDocument.createElement("button");
      dismiss.type = "button";
      dismiss.className = "dismiss";
      dismiss.setAttribute("part", "dismiss-button");
      dismiss.setAttribute(
        "aria-label",
        stringAttribute(this, "dismiss-label", "Dismiss alert"),
      );
      dismiss.textContent = "Close";
      dismiss.addEventListener("click", () =>
        this.dispatchEvent(
          new CustomEvent("dismiss", { bubbles: true, composed: true }),
        ),
      );
      banner.append(dismiss);
    }
    this.replaceShadow(styles, banner);
  }
}
