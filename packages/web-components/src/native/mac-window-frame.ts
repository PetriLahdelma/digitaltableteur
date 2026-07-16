import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const DENSITIES = ["comfortable", "compact"] as const;
export type DtMacWindowFrameDensity = (typeof DENSITIES)[number];

const styles = `
  :host {
    display: block;
    color: var(--color-text, currentColor);
    font-family: var(--font-text, var(--primary-body-font));
  }

  :host([hidden]) {
    display: none;
  }

  .frame {
    display: grid;
    gap: var(--space-internal-12, 0.75rem);
    border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
    border-radius: var(--radius-lg, 1rem);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--main-body-background-color, white) 90%, transparent),
        color-mix(in srgb, var(--color-primary, #0a66ff) 8%, transparent)
      ),
      var(--main-body-background-color, white);
    box-shadow: 0 20px 60px rgb(0 0 0 / 12%);
    overflow: hidden;
  }

  .comfortable {
    padding-block: var(--space-layout-16, 1rem);
    padding-inline: var(--space-layout-16, 1rem);
  }

  .compact {
    padding-block: var(--space-internal-12, 0.75rem);
    padding-inline: var(--space-internal-12, 0.75rem);
  }

  .header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-internal-12, 0.75rem);
    padding-block-end: var(--space-layout-8, 0.5rem);
    border-block-end: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
  }

  .controls {
    display: inline-flex;
    gap: var(--space-layout-8, 0.5rem);
  }

  .dot {
    display: inline-flex;
    inline-size: 12px;
    block-size: 12px;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
  }

  .close {
    background: #ff5f57;
  }

  .minimize {
    background: #febc2e;
  }

  .maximize {
    background: #28c840;
  }

  .title {
    min-inline-size: 0;
    margin: 0;
    color: var(--color-text, currentColor);
    font-family: var(--font-title, var(--font-text, var(--primary-body-font)));
    font-size: var(--font-size-title-xxs, 1.25rem);
    font-weight: 500;
    line-height: var(--line-height-snug, 1.3);
  }

  .titleSlot,
  .toolbarSlot {
    display: contents;
  }

  .toolbar,
  .toolbarPlaceholder {
    justify-self: end;
  }

  .toolbar {
    display: inline-flex;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
  }

  .toolbarPlaceholder {
    inline-size: 4rem;
    block-size: 1px;
  }

  .action {
    border: 0;
    background: transparent;
    color: var(--color-primary, currentColor);
    font: inherit;
    font-size: var(--font-size-button-m, 1rem);
    line-height: 1;
    cursor: pointer;
  }

  .action:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, currentColor));
    outline-offset: var(--focus-ring-offset, 2px);
    border-radius: var(--radius-sm, 0.375rem);
  }

  .body {
    padding-block: var(--space-layout-16, 1rem);
    padding-inline: var(--space-layout-16, 1rem);
    border-radius: var(--radius-lg, 1rem);
  }

  .content {
    color: var(--color-text, currentColor);
    font-family: var(--font-text, var(--primary-body-font));
    font-size: var(--font-size-text-m, 1rem);
    line-height: var(--line-height-normal, 1.6);
    white-space: pre-wrap;
  }

  @media (hover: hover) and (pointer: fine) {
    .action:hover {
      background: color-mix(in srgb, var(--color-primary, currentColor) 10%, transparent);
    }
  }

  @media (width >= 1024px) {
    .comfortable {
      padding-block: var(--space-layout-24, 1.5rem);
      padding-inline: var(--space-layout-24, 1.5rem);
    }

    .body {
      padding-block: var(--space-layout-24, 1.5rem);
      padding-inline: var(--space-layout-24, 1.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .frame,
    .action {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .frame {
      border-color: CanvasText;
      background: Canvas;
      box-shadow: none;
      color: CanvasText;
    }

    .header {
      border-block-end-color: CanvasText;
    }

    .title,
    .content,
    .action {
      color: CanvasText;
    }

    .action {
      border: 1px solid ButtonText;
      background: Canvas;
      forced-color-adjust: none;
    }

    .dot {
      background: Canvas;
      box-shadow: inset 0 0 0 1px ButtonText;
    }
  }
`;

function resolveKeyText(
  element: Element,
  key: string,
  fallback: string,
): string {
  switch (key) {
    case "macWindowFrame.title":
    case "storyMacWindowTitle":
      return localizedText(element, {
        en: "Using Early LLMs",
        fi: "Varhaiset LLM:t käytössä",
        sv: "Tidiga LLM:er i bruk",
      });
    case "macWindowFrame.action":
      return localizedText(element, {
        en: "Replay",
        fi: "Toista",
        sv: "Spela upp",
      });
    case "macWindowFrame.bodyLabel":
      return localizedText(element, {
        en: "Window content",
        fi: "Ikkunan sisältö",
        sv: "Fönsterinnehåll",
      });
    default:
      return key || fallback;
  }
}

export class DtMacWindowFrameElement extends DigitaltableteurElement {
  static observedAttributes = [
    "title-key",
    "action-label-key",
    "action-label",
    "body-label",
    "density",
  ];

  private actionHandler: (() => void) | null = null;

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get titleKey(): string {
    return stringAttribute(this, "title-key", "macWindowFrame.title");
  }

  set titleKey(value: string) {
    reflectAttribute(this, "title-key", value || null);
  }

  get actionLabelKey(): string {
    return stringAttribute(this, "action-label-key", "macWindowFrame.action");
  }

  set actionLabelKey(value: string) {
    reflectAttribute(this, "action-label-key", value || null);
  }

  get actionLabel(): string {
    return stringAttribute(this, "action-label");
  }

  set actionLabel(value: string) {
    reflectAttribute(this, "action-label", value || null);
  }

  get bodyLabel(): string {
    return (
      stringAttribute(this, "body-label") ||
      resolveKeyText(this, "macWindowFrame.bodyLabel", "Window content")
    );
  }

  set bodyLabel(value: string) {
    reflectAttribute(this, "body-label", value || null);
  }

  get density(): DtMacWindowFrameDensity {
    return enumAttribute(this, "density", DENSITIES, "comfortable");
  }

  set density(value: DtMacWindowFrameDensity) {
    reflectAttribute(this, "density", value);
  }

  get onAction(): (() => void) | null {
    return this.actionHandler;
  }

  set onAction(value: (() => void) | null) {
    this.actionHandler = typeof value === "function" ? value : null;
    if (this.isConnected) this.render();
  }

  private hasActionControl(): boolean {
    return Boolean(
      this.actionHandler ||
        this.hasAttribute("action-label-key") ||
        this.hasAttribute("action-label"),
    );
  }

  private resolvedTitle(): string {
    return resolveKeyText(this, this.titleKey || "macWindowFrame.title", "");
  }

  private resolvedActionLabel(): string {
    const explicit = this.actionLabel;
    if (explicit) return explicit;
    return resolveKeyText(
      this,
      this.actionLabelKey || "macWindowFrame.action",
      "Replay",
    );
  }

  private renderTitle(parent: HTMLElement): void {
    if (hasNamedSlot(this, "title")) {
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "title";
      slot.className = "titleSlot";
      slot.setAttribute("part", "title-slot");
      parent.append(slot);
      return;
    }

    const title = this.ownerDocument.createElement("h3");
    title.className = "title";
    title.setAttribute("part", "title");
    title.textContent = this.resolvedTitle();
    parent.append(title);
  }

  private renderToolbar(parent: HTMLElement): void {
    if (hasNamedSlot(this, "toolbar")) {
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "toolbar";
      slot.className = "toolbarSlot";
      slot.setAttribute("part", "toolbar");
      parent.append(slot);
      return;
    }

    if (this.hasActionControl()) {
      const toolbar = this.ownerDocument.createElement("div");
      toolbar.className = "toolbar";
      toolbar.setAttribute("part", "toolbar");

      const button = this.ownerDocument.createElement("button");
      button.type = "button";
      button.className = "action";
      button.setAttribute("part", "action");
      button.textContent = this.resolvedActionLabel();
      button.addEventListener("click", () => {
        this.actionHandler?.();
        this.dispatchEvent(
          new CustomEvent("action-click", {
            bubbles: true,
            composed: true,
          }),
        );
      });

      toolbar.append(button);
      parent.append(toolbar);
      return;
    }

    const placeholder = this.ownerDocument.createElement("span");
    placeholder.className = "toolbarPlaceholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.setAttribute("part", "toolbar-placeholder");
    parent.append(placeholder);
  }

  private renderContent(parent: HTMLElement): void {
    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    content.setAttribute("part", "content");

    const slot = this.ownerDocument.createElement("slot");
    if (hasNamedSlot(this, "content")) {
      slot.name = "content";
    }
    slot.setAttribute("part", "content-slot");
    content.append(slot);
    parent.append(content);
  }

  private render(): void {
    const frame = this.ownerDocument.createElement("div");
    frame.className = `frame ${this.density}`;
    frame.setAttribute("part", "root frame");
    frame.dataset.componentId = "mac_window_frame";

    const header = this.ownerDocument.createElement("div");
    header.className = "header";
    header.setAttribute("part", "header");

    const controls = this.ownerDocument.createElement("div");
    controls.className = "controls";
    controls.setAttribute("aria-hidden", "true");
    controls.setAttribute("part", "controls");
    for (const name of ["close", "minimize", "maximize"] as const) {
      const dot = this.ownerDocument.createElement("span");
      dot.className = `dot ${name}`;
      dot.setAttribute("part", `${name}-dot`);
      controls.append(dot);
    }
    header.append(controls);

    this.renderTitle(header);
    this.renderToolbar(header);
    frame.append(header);

    const body = this.ownerDocument.createElement("div");
    body.className = "body";
    body.setAttribute("part", "body");
    body.setAttribute("role", "group");
    body.setAttribute("aria-label", this.bodyLabel);
    this.renderContent(body);
    frame.append(body);

    this.replaceShadow(styles, frame);
  }
}
