import {
  DigitaltableteurElement,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: inline-flex; flex: none; color: inherit; vertical-align: middle; }
  :host([hidden]) { display: none; }
  svg { display: block; inline-size: var(--dt-logo-size); block-size: var(--dt-logo-size); color: inherit; }
  .badged { color: var(--logo-color); }
  .badge { fill: var(--logo-background); }
  .bar { transition: opacity .3s ease; }
  .animated .bar1 { animation: dt-logo-pulse-1 .9s ease-in-out infinite; }
  .animated .bar2 { animation: dt-logo-pulse-2 .9s ease-in-out infinite; }
  .animated .bar3 { animation: dt-logo-pulse-3 .9s ease-in-out infinite; }
  @keyframes dt-logo-pulse-1 { 0%, 33%, 100% { opacity: 1; } 5%, 28% { opacity: .5; } }
  @keyframes dt-logo-pulse-2 { 0%, 5%, 66%, 100% { opacity: 1; } 33%, 61% { opacity: .5; } }
  @keyframes dt-logo-pulse-3 { 0%, 61%, 100% { opacity: 1; } 66%, 95% { opacity: .5; } }
  @media (prefers-reduced-motion: reduce) { .animated .bar { animation: none; transition: none; } }
  @media (forced-colors: active) { svg { color: CanvasText; } .badge { fill: Canvas; stroke: CanvasText; } }
`;

export class DtLogoElement extends DigitaltableteurElement {
  static observedAttributes = [
    "size",
    "animated",
    "badge",
    "accessible-title",
    "decorative",
  ];

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get size(): number {
    return this.hasAttribute("size")
      ? Math.max(1, numberAttribute(this, "size", 24))
      : 24;
  }
  set size(value: number) {
    reflectAttribute(this, "size", value);
  }
  get animated(): boolean {
    return this.hasAttribute("animated");
  }
  set animated(value: boolean) {
    reflectBooleanAttribute(this, "animated", value);
  }
  get badge(): boolean {
    return this.hasAttribute("badge");
  }
  set badge(value: boolean) {
    reflectBooleanAttribute(this, "badge", value);
  }
  get decorative(): boolean {
    return this.hasAttribute("decorative");
  }
  set decorative(value: boolean) {
    reflectBooleanAttribute(this, "decorative", value);
  }
  get accessibleTitle(): string {
    return stringAttribute(this, "accessible-title", "Digitaltableteur");
  }
  set accessibleTitle(value: string) {
    reflectAttribute(this, "accessible-title", value || null);
  }

  private render(): void {
    const svg = this.ownerDocument.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svg.setAttribute("part", "logo");
    svg.setAttribute(
      "viewBox",
      this.badge ? "-121 -157 637 637" : "0 0 395 323",
    );
    svg.setAttribute("fill", "none");
    svg.setAttribute("focusable", "false");
    svg.setAttribute(
      "class",
      [this.badge ? "badged" : "", this.animated ? "animated" : ""]
        .filter(Boolean)
        .join(" "),
    );
    svg.setAttribute("width", String(this.size));
    svg.setAttribute("height", String(this.size));
    svg.style.setProperty("--dt-logo-size", `${this.size}px`);
    if (this.decorative) {
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("role", "presentation");
    } else {
      const label = this.accessibleTitle || "Digitaltableteur";
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", label);
      const title = this.ownerDocument.createElementNS(
        svg.namespaceURI,
        "title",
      );
      title.textContent = label;
      svg.append(title);
    }
    const markup = `${
      this.badge
        ? '<circle part="badge" class="badge" cx="197.5" cy="161.5" r="318.5" />'
        : ""
    }<rect part="bar" class="bar bar1" x="190.742" width="39.0494" height="142.681" fill="currentColor"/><rect part="bar" class="bar bar2" x="190.742" y="180.228" width="39.0494" height="142.681" fill="currentColor"/><rect part="bar" class="bar bar3" x="267.338" y="181.73" width="39.0494" height="127.662" transform="rotate(-90 267.338 181.73)" fill="currentColor"/><rect y="37.5475" width="39.0494" height="246.312" fill="currentColor"/><rect x="115.646" y="76.597" width="39.0494" height="168.213" fill="currentColor"/><path d="M39.0493 76.597L39.0493 37.5475L118.65 37.5475L154.696 76.5969L39.0493 76.597Z" fill="currentColor"/><path d="M39.0493 244.81L39.0493 283.859L118.65 283.859L154.696 244.81L39.0493 244.81Z" fill="currentColor"/>`;
    svg.insertAdjacentHTML("beforeend", markup);
    this.replaceShadow(styles, svg);
  }
}
