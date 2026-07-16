import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const styles = `
  :host { display: inline-block; }
  :host([hidden]) { display: none; }
  .author { display: flex; align-items: center; gap: .5rem; }
  p { margin: 0; font-family: var(--primary-body-font, sans-serif); font-size: 1rem; font-weight: 600; line-height: 1.2; white-space: nowrap; color: var(--color-primary); }
  a { color: inherit; text-decoration: none; transition: color .2s ease; }
  a:hover, a:focus { color: var(--color-primary); text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) { a { transition: none; } }
`;

export class DtAuthorElement extends DigitaltableteurElement {
  static observedAttributes = [
    "name",
    "image-url",
    "size",
    "profile-url",
    "byline-prefix",
    "lang",
  ];

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
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
  get size(): string {
    return stringAttribute(this, "size", "2.5rem");
  }
  set size(value: string) {
    reflectAttribute(this, "size", value || null);
  }
  get profileUrl(): string {
    return stringAttribute(this, "profile-url");
  }
  set profileUrl(value: string) {
    reflectAttribute(this, "profile-url", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = "author";
    root.setAttribute("part", "author");
    const avatar = this.ownerDocument.createElement("dt-avatar");
    avatar.setAttribute("part", "avatar");
    avatar.setAttribute("name", this.name);
    avatar.setAttribute("image-url", this.imageUrl);
    avatar.setAttribute("size", this.size);
    const prefix =
      stringAttribute(this, "byline-prefix") ||
      localizedText(this, { en: "By", fi: "Kirjoittanut", sv: "Av" });
    const paragraph = this.ownerDocument.createElement("p");
    paragraph.setAttribute("part", "byline");
    if (this.profileUrl) {
      const link = this.ownerDocument.createElement("a");
      link.href = this.profileUrl;
      link.textContent = `${prefix} ${this.name}`;
      paragraph.append(link);
    } else {
      paragraph.textContent = `${prefix} ${this.name}`;
    }
    root.append(avatar, paragraph);
    this.replaceShadow(styles, root);
  }
}
