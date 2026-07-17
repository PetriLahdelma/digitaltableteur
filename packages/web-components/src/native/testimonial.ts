import {
  DigitaltableteurElement,
  reflectAttribute,
  safeHref,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  blockquote { box-sizing: border-box; margin: 0; padding: 1.5rem; border: 1px solid var(--color-gray-light); border-radius: .5rem; background: var(--color-white); color: var(--color-text); box-shadow: 0 2px 4px rgb(0 0 0 / 10%); transition: box-shadow .2s ease-in-out; }
  blockquote:hover { box-shadow: 0 4px 8px rgb(0 0 0 / 15%); }
  /* The React card composes the Text component (quote + name = Text M, title
     row = Text S) whose sizing and trailing margin live in Text.module.css;
     shadow DOM must restate them. */
  .quote { margin: 0 0 var(--space-layout-16, 1rem); font-family: var(--font-text); font-size: var(--font-size-text-m, 1rem); font-style: italic; line-height: 1.6; }
  footer { display: flex; align-items: flex-start; gap: .75rem; }
  img { inline-size: 3rem; block-size: 3rem; flex: none; border-radius: 50%; object-fit: cover; }
  .info { min-inline-size: 0; flex: 1; }
  .nameRow { display: flex; margin-block-end: .25rem; align-items: center; gap: .5rem; }
  cite { margin-block-end: var(--space-layout-16, 1rem); font-family: var(--font-text); font-size: var(--font-size-text-m, 1rem); font-weight: 600; font-style: normal; line-height: 1.6; }
  /* The React LinkedIn link is the DS Link, which carries the site's global
     wavy-underline treatment (variables.css). */
  a { display: inline-flex; position: relative; padding-block-end: 6px; align-items: center; color: var(--color-linkedin, #0077b5); text-decoration: none; transition: color .2s ease-in-out; }
  a::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 6px;
    background-color: var(--underline-accent-color, currentcolor);
    opacity: 0.9;
    content: "";
    mask-image: var(--wavy-underline-mask);
    mask-repeat: repeat-x;
    mask-size: 16px 6px;
  }
  a:hover { color: var(--color-linkedin-hover, #005885); }
  .meta { margin: 0 0 var(--space-layout-16, 1rem); color: var(--color-gray-medium); font-family: var(--font-text); font-size: var(--font-size-text-s, .875rem); font-style: italic; line-height: 1.4; }
  @media (prefers-reduced-motion: reduce) { blockquote, a { transition: none; } }
  @media (forced-colors: active) { blockquote { border-color: CanvasText; background: Canvas; color: CanvasText; box-shadow: none; } a { color: LinkText; } }
`;

export class DtTestimonialElement extends DigitaltableteurElement {
  static observedAttributes = [
    "quote",
    "name",
    "person-title",
    "company",
    "linkedin-url",
    "avatar-url",
  ];
  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  private value(name: string): string {
    return stringAttribute(this, name);
  }
  private setValue(name: string, value: string): void {
    reflectAttribute(this, name, value || null);
  }
  get quote(): string {
    return this.value("quote");
  }
  set quote(value: string) {
    this.setValue("quote", value);
  }
  get name(): string {
    return this.value("name");
  }
  set name(value: string) {
    this.setValue("name", value);
  }
  get personTitle(): string {
    return this.value("person-title");
  }
  set personTitle(value: string) {
    this.setValue("person-title", value);
  }
  get company(): string {
    return this.value("company");
  }
  set company(value: string) {
    this.setValue("company", value);
  }
  get linkedinUrl(): string {
    return this.value("linkedin-url");
  }
  set linkedinUrl(value: string) {
    this.setValue("linkedin-url", value);
  }
  get avatarUrl(): string {
    return this.value("avatar-url");
  }
  set avatarUrl(value: string) {
    this.setValue("avatar-url", value);
  }

  private render(): void {
    const blockquote = this.ownerDocument.createElement("blockquote");
    blockquote.setAttribute("part", "testimonial");
    const quote = this.ownerDocument.createElement("p");
    quote.className = "quote";
    quote.setAttribute("part", "quote");
    quote.textContent = this.quote ? `“${this.quote}”` : "";
    const footer = this.ownerDocument.createElement("footer");
    if (this.avatarUrl) {
      const avatar = this.ownerDocument.createElement("img");
      avatar.src = this.avatarUrl;
      avatar.alt = `Portrait of ${this.name}`;
      avatar.loading = "lazy";
      avatar.setAttribute("part", "avatar");
      footer.append(avatar);
    }
    const info = this.ownerDocument.createElement("div");
    info.className = "info";
    const nameRow = this.ownerDocument.createElement("div");
    nameRow.className = "nameRow";
    const cite = this.ownerDocument.createElement("cite");
    cite.textContent = this.name;
    nameRow.append(cite);
    if (this.linkedinUrl) {
      const link = this.ownerDocument.createElement("a");
      link.href = safeHref(this.linkedinUrl);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const label = `View ${this.name}'s LinkedIn profile`;
      link.setAttribute("aria-label", label);
      link.title = label;
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", "linkedin-logo");
      icon.setAttribute("size", "xs");
      icon.setAttribute("decorative", "");
      link.append(icon);
      nameRow.append(link);
    }
    const meta = this.ownerDocument.createElement("p");
    meta.className = "meta";
    meta.textContent = [this.personTitle, this.company]
      .filter(Boolean)
      .join(" • ");
    info.append(nameRow, meta);
    footer.append(info);
    blockquote.append(quote, footer);
    this.replaceShadow(styles, blockquote);
  }
}
