import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText, resolveElementLocale } from "./localization";

const SIZES = ["sm", "md", "lg", "inherit"] as const;
const UNDERLINES = ["always", "hover", "none"] as const;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const URL_PARSE_BASE = "https://example.invalid";

export type DtLinkSize = (typeof SIZES)[number];
export type DtLinkUnderline = (typeof UNDERLINES)[number];

type LinkDecision = { href: string; external: boolean };

const styles = `
  :host { display: inline; }
  :host([hidden]) { display: none; }
  .link { display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 2px; font-family: var(--font-text); text-decoration: none; color: var(--link-color); transition: color var(--duration-fast) var(--ease-out-cubic); }
  .sm { gap: 0.3rem; font-size: 1rem; }
  .md { font-size: 1.125rem; }
  .lg { font-size: 1.5rem; }
  .inherit { gap: 0.3rem; font-size: inherit; }
  .always, .hover { position: relative; padding-bottom: 6px; }
  .always::after, .hover::after { position: absolute; right: 0; bottom: 0; left: 0; height: 6px; background-color: var(--underline-accent-color, currentcolor); opacity: 0.9; content: ""; mask-image: var(--wavy-underline-mask); mask-repeat: repeat-x; mask-size: 16px 6px; }
  .none { text-decoration: none; }
  .hover::after { opacity: 0; transition: opacity var(--duration-fast) var(--ease-out-cubic); }
  .external { display: inline-flex; flex: none; align-items: center; translate: 0 -2px; }
  .sm .external, .inherit .external { translate: 0 -1px; }
  .external dt-icon { inline-size: var(--dt-link-icon-size); block-size: var(--dt-link-icon-size); }
  .sm, .inherit { --dt-link-icon-size: 1.25rem; }
  .md { --dt-link-icon-size: 1.5rem; }
  .lg { --dt-link-icon-size: 2rem; }
  .link:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; }
  .link:focus-visible.hover::after { opacity: 0.9; }
  @media (hover: hover) and (pointer: fine) { .link:hover.hover::after { opacity: 0.9; } }
  @media (prefers-reduced-motion: reduce) { .link, .hover::after { transition: none; } }
`;

function analyzeHref(
  value: string,
  currentOrigin: string | null,
): LinkDecision {
  const href = value.trim();
  if (!href) return { href: "#", external: false };

  if (
    (href.startsWith("/") && !href.startsWith("//")) ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  ) {
    return { href, external: false };
  }

  try {
    const base = currentOrigin ?? URL_PARSE_BASE;
    const parsed = new URL(href, base);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return { href: "#", external: false };
    }
    const http = parsed.protocol === "http:" || parsed.protocol === "https:";
    return {
      href,
      external:
        http && (!currentOrigin || parsed.origin !== new URL(base).origin),
    };
  } catch {
    return { href: "#", external: false };
  }
}

function secureRel(value: string, external: boolean, target: string): string {
  const tokens = new Set(value.split(/\s+/).filter(Boolean));
  if (external || target === "_blank") {
    tokens.add("noopener");
    tokens.add("noreferrer");
  }
  return [...tokens].join(" ");
}

export class DtLinkElement extends DigitaltableteurElement {
  static observedAttributes = [
    "href",
    "label",
    "size",
    "underline",
    "target",
    "rel",
    "download",
    "hreflang",
    "referrerpolicy",
    "aria-current",
    "aria-label",
    "external-label",
    "external-label-en",
    "external-label-fi",
    "external-label-sv",
    "lang",
  ];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get href(): string {
    return stringAttribute(this, "href", "#");
  }
  set href(value: string) {
    reflectAttribute(this, "href", value || null);
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get size(): DtLinkSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtLinkSize) {
    reflectAttribute(this, "size", value);
  }
  get underline(): DtLinkUnderline {
    return enumAttribute(this, "underline", UNDERLINES, "always");
  }
  set underline(value: DtLinkUnderline) {
    reflectAttribute(this, "underline", value);
  }
  get target(): string {
    return stringAttribute(this, "target");
  }
  set target(value: string) {
    reflectAttribute(this, "target", value || null);
  }
  get rel(): string {
    return stringAttribute(this, "rel");
  }
  set rel(value: string) {
    reflectAttribute(this, "rel", value || null);
  }
  get download(): string {
    return stringAttribute(this, "download");
  }
  set download(value: string) {
    reflectAttribute(this, "download", value || null);
  }
  get hrefLang(): string {
    return stringAttribute(this, "hreflang");
  }
  set hrefLang(value: string) {
    reflectAttribute(this, "hreflang", value || null);
  }
  get referrerPolicy(): string {
    return stringAttribute(this, "referrerpolicy");
  }
  set referrerPolicy(value: string) {
    reflectAttribute(this, "referrerpolicy", value || null);
  }
  get externalLabel(): string {
    return stringAttribute(this, "external-label");
  }
  set externalLabel(value: string) {
    reflectAttribute(this, "external-label", value || null);
  }
  get externalLabelEn(): string {
    return stringAttribute(this, "external-label-en");
  }
  set externalLabelEn(value: string) {
    reflectAttribute(this, "external-label-en", value || null);
  }
  get externalLabelFi(): string {
    return stringAttribute(this, "external-label-fi");
  }
  set externalLabelFi(value: string) {
    reflectAttribute(this, "external-label-fi", value || null);
  }
  get externalLabelSv(): string {
    return stringAttribute(this, "external-label-sv");
  }
  set externalLabelSv(value: string) {
    reflectAttribute(this, "external-label-sv", value || null);
  }

  private externalAnnouncement(): string {
    if (this.externalLabel) return this.externalLabel;

    const locale = resolveElementLocale(this);
    const localizedOverride = this.getAttribute(`external-label-${locale}`);
    if (localizedOverride) return localizedOverride;

    return localizedText(this, {
      en: "External link",
      fi: "Ulkoinen linkki",
      sv: "Extern länk",
    });
  }

  private render(): void {
    const origin = this.ownerDocument.defaultView?.location.origin ?? null;
    const decision = analyzeHref(this.href, origin);
    const anchor = this.ownerDocument.createElement("a");
    anchor.className = `link ${this.size} ${this.underline}`;
    anchor.setAttribute("part", "link");
    anchor.href = decision.href;
    if (this.target) anchor.target = this.target;
    const rel = secureRel(this.rel, decision.external, this.target);
    if (rel) anchor.rel = rel;
    for (const attribute of [
      "download",
      "hreflang",
      "referrerpolicy",
      "aria-current",
      "aria-label",
    ]) {
      const value = this.getAttribute(attribute);
      if (value !== null) anchor.setAttribute(attribute, value);
    }

    const slot = this.ownerDocument.createElement("slot");
    if (this.label) slot.textContent = this.label;
    anchor.append(slot);

    if (
      decision.external &&
      (Boolean(this.label) || hasDefaultSlotContent(this))
    ) {
      const wrapper = this.ownerDocument.createElement("span");
      wrapper.className = "external";
      wrapper.setAttribute("part", "external-icon");
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", "arrow-square-out");
      icon.setAttribute("aria-label", this.externalAnnouncement());
      wrapper.append(icon);
      anchor.append(wrapper);
    }

    this.replaceShadow(styles, anchor);
  }
}
