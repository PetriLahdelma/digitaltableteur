import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SPACING = ["none", "sm", "md", "lg", "xl", "hero", "follow"] as const;
const BACKGROUNDS = ["default", "muted", "accent", "inverse"] as const;

export type DtSectionSpacing = (typeof SPACING)[number];
export type DtSectionBackground = (typeof BACKGROUNDS)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root { box-sizing: border-box; }
  .none { padding-block: 0; }
  .sm { padding-block: var(--space-layout-32, 2rem); }
  .md { padding-block: var(--space-layout-48, 3rem); }
  .lg { padding-block: var(--space-layout-64, 4rem); }
  .xl { padding-block: var(--space-layout-96, 6rem); }
  .hero { padding-block: var(--space-layout-64, 4rem) var(--space-layout-32, 2rem); }
  .follow { padding-block: 0 var(--space-layout-64, 4rem); }
  .default { background-color: var(--background, var(--main-body-background-color, #fff)); }
  .muted { background-color: var(--muted, var(--color-light-bg, #f9f9f9)); }
  .accent { background-color: color-mix(in srgb, var(--primary, var(--color-primary)) 5%, transparent); }
  .inverse { background-color: var(--foreground, var(--color-text)); color: var(--background, var(--main-body-background-color, #fff)); }
  @media (width >= 768px) {
    .sm { padding-block: var(--space-layout-48, 3rem); }
    .md { padding-block: var(--space-layout-64, 4rem); }
    .lg { padding-block: var(--space-layout-96, 6rem); }
    .xl { padding-block: 8rem; }
    .hero { padding-block: var(--space-layout-96, 6rem) 2.5rem; }
    .follow { padding-block: 0 var(--space-layout-96, 6rem); }
  }
  @media (width >= 1024px) {
    .sm { padding-block: var(--space-layout-64, 4rem); }
    .md { padding-block: var(--space-layout-96, 6rem); }
    .lg { padding-block: 8rem; }
    .xl { padding-block: 12rem; }
    .hero { padding-block: 8rem var(--space-layout-48, 3rem); }
    .follow { padding-block: 0 8rem; }
  }
  @media (forced-colors: active) {
    .default, .muted, .accent { background-color: Canvas; color: CanvasText; }
    .inverse { background-color: CanvasText; color: Canvas; }
  }
`;

export class DtSectionElement extends DigitaltableteurElement {
  static observedAttributes = [
    "spacing",
    "background",
    "content",
    "spotlight-target",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
  ];

  private managesRegionRole = false;

  connectedCallback(): void {
    this.syncSpotlightTarget();
    this.syncHostSemantics();
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (name === "spotlight-target") this.syncSpotlightTarget();
    if (name.startsWith("aria-")) this.syncHostSemantics();
    if (this.isConnected) this.render();
  }

  get spacing(): DtSectionSpacing {
    return enumAttribute(this, "spacing", SPACING, "md");
  }
  set spacing(value: DtSectionSpacing) {
    reflectAttribute(this, "spacing", value);
  }
  get background(): DtSectionBackground {
    return enumAttribute(this, "background", BACKGROUNDS, "default");
  }
  set background(value: DtSectionBackground) {
    reflectAttribute(this, "background", value);
  }
  get content(): string {
    return stringAttribute(this, "content");
  }
  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }
  get spotlightTarget(): string {
    return stringAttribute(this, "spotlight-target");
  }
  set spotlightTarget(value: string) {
    reflectAttribute(this, "spotlight-target", value || null);
  }

  private syncSpotlightTarget(): void {
    const value = stringAttribute(this, "spotlight-target");
    reflectAttribute(this, "data-spotlight-target", value || null);
  }

  private syncHostSemantics(): void {
    const hasAccessibleName = Boolean(
      this.getAttribute("aria-label")?.trim() ||
      this.getAttribute("aria-labelledby")?.trim(),
    );
    if (hasAccessibleName && !this.hasAttribute("role")) {
      this.setAttribute("role", "region");
      this.managesRegionRole = true;
    } else if (
      !hasAccessibleName &&
      this.managesRegionRole &&
      this.getAttribute("role") === "region"
    ) {
      this.removeAttribute("role");
      this.managesRegionRole = false;
    }
  }

  private render(): void {
    const section = this.ownerDocument.createElement("section");
    section.className = `root ${this.spacing} ${this.background}`;
    section.setAttribute("part", "section");
    section.setAttribute("role", "presentation");
    if (this.id) section.id = this.id;
    if (this.spotlightTarget) {
      section.dataset.spotlightTarget = this.spotlightTarget;
    }
    const slot = this.ownerDocument.createElement("slot");
    if (this.content) slot.textContent = this.content;
    section.append(slot);
    this.replaceShadow(styles, section);
  }
}
