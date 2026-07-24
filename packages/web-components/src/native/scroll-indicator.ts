import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["arrow", "mouse", "chevron"] as const;
const POSITIONS = ["center", "left", "right"] as const;
const MOTIONS = ["bounce", "pulse", "fade", "none"] as const;
export type DtScrollIndicatorVariant = (typeof VARIANTS)[number];
export type DtScrollIndicatorPosition = (typeof POSITIONS)[number];
export type DtScrollIndicatorMotion = (typeof MOTIONS)[number];

// Inline SVGs matching the React ScrollIndicator exactly (chevron = lucide
// ChevronDown; arrow + mouse = its bespoke inline paths), so the native twin
// needs no phosphor icon-registry entries and renders identical geometry.
const iconMarkup: Record<DtScrollIndicatorVariant, string> = {
  chevron:
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  mouse:
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="6"/><line x1="12" y1="7" x2="12" y2="11"/></svg>',
};

// Mirrors nextjs-app/shared/components/ScrollIndicator: a hero-footer button
// that scrolls a target into view, with a looping motion hint on the icon.
// The React twin drives motion with GSAP; the native twin uses CSS keyframes.
// Both suppress motion under prefers-reduced-motion.
const styles = `
  :host { display: contents; }
  :host([hidden]) { display: none; }
  .root {
    position: absolute;
    inset-block-end: 2rem;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    border: 0;
    background: transparent;
    color: color-mix(in srgb, var(--color-foreground) 70%, transparent);
    cursor: pointer;
    transition: color 200ms ease;
  }
  .center { inset-inline: 0; margin-inline: auto; inline-size: fit-content; }
  .left { inset-inline-start: 2rem; }
  .right { inset-inline-end: 2rem; }
  .root:hover { color: var(--color-foreground); }
  .root:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--color-background, #fff), 0 0 0 4px var(--color-primary); border-radius: 0.25rem; }
  .label { font-family: var(--primary-body-font); font-size: 0.75rem; letter-spacing: 0.02em; }
  .icon { display: block; }
  .icon svg { inline-size: 1.5rem; block-size: 1.5rem; }
  .bounce .icon { animation: dt-si-bounce var(--dt-si-speed, 0.6s) ease-in-out infinite alternate; }
  .pulse .icon { animation: dt-si-pulse var(--dt-si-speed, 0.6s) ease-in-out infinite alternate; }
  .fade .icon { animation: dt-si-fade var(--dt-si-speed, 0.6s) ease-in-out infinite alternate; }
  .root:hover .icon { animation-play-state: paused; }
  @keyframes dt-si-bounce { from { transform: translateY(0); } to { transform: translateY(var(--dt-si-distance, 8px)); } }
  @keyframes dt-si-pulse { from { transform: scale(1); } to { transform: scale(1.12); } }
  @keyframes dt-si-fade { from { opacity: 1; } to { opacity: 0.35; } }
  @media (prefers-reduced-motion: reduce) {
    .bounce .icon, .pulse .icon, .fade .icon { animation: none; }
  }
`;

export class DtScrollIndicatorElement extends DigitaltableteurElement {
  static observedAttributes = [
    "label",
    "target-id",
    "variant",
    "position",
    "motion",
    "speed",
    "distance",
  ];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get targetId(): string {
    return stringAttribute(this, "target-id");
  }
  set targetId(value: string) {
    reflectAttribute(this, "target-id", value || null);
  }
  get variant(): DtScrollIndicatorVariant {
    return enumAttribute(this, "variant", VARIANTS, "chevron");
  }
  set variant(value: DtScrollIndicatorVariant) {
    reflectAttribute(this, "variant", value);
  }
  get position(): DtScrollIndicatorPosition {
    return enumAttribute(this, "position", POSITIONS, "center");
  }
  set position(value: DtScrollIndicatorPosition) {
    reflectAttribute(this, "position", value);
  }
  get motion(): DtScrollIndicatorMotion {
    return enumAttribute(this, "motion", MOTIONS, "bounce");
  }
  set motion(value: DtScrollIndicatorMotion) {
    reflectAttribute(this, "motion", value);
  }

  private handleClick = (): void => {
    const id = this.targetId;
    if (!id) return;
    const target = this.ownerDocument.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  private render(): void {
    const doc = this.ownerDocument;
    const speed = stringAttribute(this, "speed");
    const distance = stringAttribute(this, "distance");
    if (speed) this.style.setProperty("--dt-si-speed", `${speed}s`);
    if (distance) this.style.setProperty("--dt-si-distance", `${distance}px`);

    const button = doc.createElement("button");
    button.type = "button";
    button.className = `root ${this.position} ${this.motion}`;
    button.setAttribute("aria-label", this.label || "Scroll to content");
    button.addEventListener("click", this.handleClick);

    if (this.label) {
      const label = doc.createElement("span");
      label.className = "label";
      label.textContent = this.label;
      button.appendChild(label);
    }

    const iconWrap = doc.createElement("span");
    iconWrap.className = "icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.innerHTML = iconMarkup[this.variant];
    button.appendChild(iconWrap);

    this.replaceShadow(styles, button);
  }
}
