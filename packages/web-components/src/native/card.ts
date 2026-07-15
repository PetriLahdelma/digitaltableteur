import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["default", "muted", "transparent"] as const;
const PADDINGS = ["none", "sm", "md", "lg"] as const;
const ROOT_TAGS = ["div", "article", "section", "aside", "li"] as const;
const TITLE_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const DESCRIPTION_TAGS = ["p", "span", "div"] as const;
const TEXT_SIZES = ["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const;
const TITLE_LEVELS = [1, 2, 3, 4, 5, 6] as const;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const URL_PARSE_BASE = "https://example.invalid";
const HEADER_START_SLOT_NAMES = ["header-start", "headerStart"] as const;
const HEADER_END_SLOT_NAMES = ["header-end", "headerEnd", "extra"] as const;
const FOOTER_START_SLOT_NAMES = ["footer-start", "footerStart"] as const;
const FOOTER_END_SLOT_NAMES = ["footer-end", "footerEnd"] as const;

export type DtCardVariant = (typeof VARIANTS)[number];
export type DtCardPadding = (typeof PADDINGS)[number];
export type DtCardTag = (typeof ROOT_TAGS)[number];
export type DtCardTitleTag = (typeof TITLE_TAGS)[number];
export type DtCardDescriptionTag = (typeof DESCRIPTION_TAGS)[number];
export type DtCardTextSize = (typeof TEXT_SIZES)[number];
export type DtCardTitleSize = DtCardTextSize;
export type DtCardDescriptionSize = DtCardTextSize;
export type DtCardTitleLevel = (typeof TITLE_LEVELS)[number];

export interface DtCardTitleSettings {
  as?: DtCardTitleTag;
  level?: DtCardTitleLevel;
  size?: DtCardTitleSize;
}

export interface DtCardDescriptionSettings {
  as?: DtCardDescriptionTag;
  size?: DtCardDescriptionSize;
}

type LinkDecision = { href: string; external: boolean };

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  :host([as="li"]) { display: list-item; }
  .card {
    --card-radius: 12px;
    --card-padding: var(--space-internal-16);
    display: flex;
    position: relative;
    box-sizing: border-box;
    padding: var(--card-padding);
    inline-size: 100%;
    flex-direction: column;
    gap: var(--space-internal-8);
    border: 1px solid transparent;
    border-radius: var(--card-radius);
    color: var(--color-text);
  }
  .default {
    border-color: var(--color-border-light);
    background-color: var(--color-surface);
  }
  .muted {
    background-color: var(--color-light-bg);
  }
  .transparent {
    background-color: transparent;
  }
  .paddingNone { --card-padding: 0; }
  .paddingSm { --card-padding: var(--space-internal-12); }
  .paddingMd { --card-padding: var(--space-internal-16); }
  .paddingLg { --card-padding: var(--space-internal-24); }
  .linked:hover {
    border-color: var(--color-border);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-internal-8);
  }
  .headerStart {
    min-inline-size: 0;
    flex: 1 1 auto;
  }
  .headerEnd {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--space-internal-8);
  }
  .title {
    margin: 0;
    font-family: var(--font-title);
    font-size: var(--font-size-title-xxs);
    font-weight: 600;
    line-height: var(--line-height-snug);
    color: var(--color-title);
  }
  .titleXXS { font-size: var(--font-size-title-xxs); }
  .titleXS { font-size: var(--font-size-title-xs); }
  .titleS { font-size: var(--font-size-title-s); }
  .titleM { font-size: var(--font-size-title-m); }
  .titleL { font-size: var(--font-size-title-l); }
  .titleXL { font-size: var(--font-size-title-xl); }
  .titleXXL { font-size: var(--font-size-title-xxl); }
  .description {
    margin: 0;
    font-family: var(--font-text);
    font-size: var(--font-size-text-s);
    line-height: var(--line-height-normal);
    color: var(--color-text-muted, var(--color-primary));
  }
  .textXXS { font-size: var(--font-size-text-xxs); }
  .textXS { font-size: var(--font-size-text-xs); }
  .textS { font-size: var(--font-size-text-s); }
  .textM { font-size: var(--font-size-text-m); }
  .textL { font-size: var(--font-size-text-l); }
  .textXL { font-size: var(--font-size-text-xl); }
  .textXXL { font-size: var(--font-size-text-xxl); }
  .body { display: contents; }
  .footer {
    display: flex;
    margin-block-start: var(--space-internal-16);
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-internal-8);
  }
  .footerStart {
    display: flex;
    align-items: center;
    gap: var(--space-internal-8);
  }
  .footerEnd {
    display: flex;
    margin-inline-start: auto;
    align-items: center;
    gap: var(--space-internal-8);
  }
  .cardLink {
    color: inherit;
    text-decoration: none;
  }
  .cardLink::after {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    content: "";
  }
  .cardLink:focus-visible {
    outline: none;
  }
  .cardLink:focus-visible::after {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: 2px;
  }
  .skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--space-internal-8);
  }
  .skeletonLine {
    block-size: 0.875rem;
    border-radius: 999px;
    background:
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--color-surface) 70%, var(--color-border-light)) 0%,
        color-mix(in srgb, var(--color-surface) 86%, var(--color-border-light)) 50%,
        color-mix(in srgb, var(--color-surface) 70%, var(--color-border-light)) 100%
      );
    background-size: 200% 100%;
    animation: dt-card-skeleton 1.4s ease-in-out infinite;
  }
  .skeletonLineShort { inline-size: 62%; }
  .skeletonLineMedium { inline-size: 84%; }
  .skeletonLineFull { inline-size: 100%; }
  @keyframes dt-card-skeleton {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .skeletonLine { animation: none; }
  }
  @media (forced-colors: active) {
    .card {
      border-color: CanvasText;
      background-color: Canvas;
      color: CanvasText;
    }
    .cardLink:focus-visible::after {
      outline-color: Highlight;
    }
    .skeletonLine {
      background: GrayText;
    }
  }
`;

function titleLevelAttribute(element: Element): DtCardTitleLevel | null {
  const value = Number(element.getAttribute("title-level"));
  return TITLE_LEVELS.includes(value as DtCardTitleLevel)
    ? (value as DtCardTitleLevel)
    : null;
}

function titleAsAttribute(element: Element): DtCardTitleTag | null {
  const value = element.getAttribute("title-as");
  return TITLE_TAGS.includes(value as DtCardTitleTag)
    ? (value as DtCardTitleTag)
    : null;
}

function descriptionAsAttribute(element: Element): DtCardDescriptionTag | null {
  const value = element.getAttribute("description-as");
  return DESCRIPTION_TAGS.includes(value as DtCardDescriptionTag)
    ? (value as DtCardDescriptionTag)
    : null;
}

function pickSlotName(
  element: Element,
  names: readonly string[],
): string | null {
  for (const name of names) {
    if (hasNamedSlot(element, name)) return name;
  }
  return null;
}

function titleSizeClass(size: DtCardTitleSize): string {
  switch (size) {
    case "xxs":
      return "titleXXS";
    case "xs":
      return "titleXS";
    case "s":
      return "titleS";
    case "m":
      return "titleM";
    case "l":
      return "titleL";
    case "xl":
      return "titleXL";
    case "xxl":
      return "titleXXL";
  }
}

function textSizeClass(size: DtCardDescriptionSize): string {
  switch (size) {
    case "xxs":
      return "textXXS";
    case "xs":
      return "textXS";
    case "s":
      return "textS";
    case "m":
      return "textM";
    case "l":
      return "textL";
    case "xl":
      return "textXL";
    case "xxl":
      return "textXXL";
  }
}

function analyzeHref(
  value: string,
  currentOrigin: string | null,
): LinkDecision | null {
  const href = value.trim();
  if (!href) return null;

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

function secureRel(value: string, external: boolean): string {
  const tokens = new Set(value.split(/\s+/).filter(Boolean));
  if (external) {
    tokens.add("noopener");
    tokens.add("noreferrer");
  }
  return [...tokens].join(" ");
}

function copyForwardedAttributes(host: HTMLElement, target: HTMLElement): void {
  for (const attributeName of host.getAttributeNames()) {
    if (
      attributeName === "role" ||
      attributeName === "tabindex" ||
      attributeName === "lang" ||
      attributeName === "dir" ||
      attributeName.startsWith("aria-") ||
      attributeName.startsWith("data-")
    ) {
      const value = host.getAttribute(attributeName);
      if (value !== null) target.setAttribute(attributeName, value);
    }
  }
}

function createSlot(document: Document, name?: string): HTMLSlotElement {
  const slot = document.createElement("slot");
  if (name) slot.name = name;
  return slot;
}

export class DtCardElement extends DigitaltableteurElement {
  static observedAttributes = [
    "as",
    "variant",
    "padding",
    "title-text",
    "title-as",
    "title-level",
    "title-size",
    "description",
    "description-as",
    "description-size",
    "content",
    "link",
    "link-label",
    "loading",
  ];

  private hostAttributeObserver?: MutationObserver;

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
    this.observeHostAttributes();
  }

  disconnectedCallback(): void {
    this.hostAttributeObserver?.disconnect();
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get as(): DtCardTag {
    return enumAttribute(this, "as", ROOT_TAGS, "div");
  }

  set as(value: DtCardTag) {
    reflectAttribute(this, "as", value);
  }

  get variant(): DtCardVariant {
    return enumAttribute(this, "variant", VARIANTS, "default");
  }

  set variant(value: DtCardVariant) {
    reflectAttribute(this, "variant", value);
  }

  get padding(): DtCardPadding {
    return enumAttribute(this, "padding", PADDINGS, "md");
  }

  set padding(value: DtCardPadding) {
    reflectAttribute(this, "padding", value);
  }

  get titleText(): string {
    return stringAttribute(this, "title-text");
  }

  set titleText(value: string) {
    reflectAttribute(this, "title-text", value || null);
  }

  get titleAs(): DtCardTitleTag | null {
    return titleAsAttribute(this);
  }

  set titleAs(value: DtCardTitleTag | null) {
    reflectAttribute(this, "title-as", value);
  }

  get titleLevel(): DtCardTitleLevel {
    return titleLevelAttribute(this) ?? 3;
  }

  set titleLevel(value: DtCardTitleLevel) {
    reflectAttribute(this, "title-level", value);
  }

  get titleSize(): DtCardTitleSize {
    return enumAttribute(this, "title-size", TEXT_SIZES, "xxs");
  }

  set titleSize(value: DtCardTitleSize) {
    reflectAttribute(this, "title-size", value);
  }

  get description(): string {
    return stringAttribute(this, "description");
  }

  set description(value: string) {
    reflectAttribute(this, "description", value || null);
  }

  get descriptionAs(): DtCardDescriptionTag {
    return descriptionAsAttribute(this) ?? "p";
  }

  set descriptionAs(value: DtCardDescriptionTag | null) {
    reflectAttribute(this, "description-as", value);
  }

  get descriptionSize(): DtCardDescriptionSize {
    return enumAttribute(this, "description-size", TEXT_SIZES, "s");
  }

  set descriptionSize(value: DtCardDescriptionSize) {
    reflectAttribute(this, "description-size", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  get link(): string {
    return stringAttribute(this, "link");
  }

  set link(value: string) {
    reflectAttribute(this, "link", value || null);
  }

  get linkLabel(): string {
    return stringAttribute(this, "link-label");
  }

  set linkLabel(value: string) {
    reflectAttribute(this, "link-label", value || null);
  }

  get loading(): boolean {
    return this.hasAttribute("loading");
  }

  set loading(value: boolean) {
    reflectBooleanAttribute(this, "loading", value);
  }

  private observeHostAttributes(): void {
    const Observer = this.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;

    this.hostAttributeObserver?.disconnect();
    const handledAttributes = new Set<string>(
      DtCardElement.observedAttributes as string[],
    );
    this.hostAttributeObserver = new Observer((records) => {
      const shouldRender = records.some((record) => {
        const attributeName = record.attributeName;
        if (!attributeName) return false;
        if (handledAttributes.has(attributeName)) return false;
        return (
          attributeName === "role" ||
          attributeName === "tabindex" ||
          attributeName === "lang" ||
          attributeName === "dir" ||
          attributeName.startsWith("aria-") ||
          attributeName.startsWith("data-")
        );
      });
      if (shouldRender) this.render();
    });
    this.hostAttributeObserver.observe(this, { attributes: true });
  }

  private resolvedTitleTag(): DtCardTitleTag {
    return this.titleAs ?? (`h${this.titleLevel}` as DtCardTitleTag);
  }

  private createTitle(link: LinkDecision | null): HTMLElement {
    const title = this.ownerDocument.createElement(this.resolvedTitleTag());
    title.className = ["title", titleSizeClass(this.titleSize)]
      .filter(Boolean)
      .join(" ");
    title.setAttribute("part", "title");

    if (link) {
      const anchor = this.ownerDocument.createElement("a");
      anchor.className = "cardLink";
      anchor.setAttribute("part", "link title-link");
      anchor.href = link.href;
      const rel = secureRel("", link.external);
      if (rel) anchor.rel = rel;
      if (this.linkLabel && this.linkLabel !== this.titleText) {
        anchor.setAttribute("aria-label", this.linkLabel);
      }
      anchor.textContent = this.titleText;
      title.append(anchor);
      return title;
    }

    title.textContent = this.titleText;
    return title;
  }

  private createDescription(): HTMLElement {
    const description = this.ownerDocument.createElement(this.descriptionAs);
    description.className = ["description", textSizeClass(this.descriptionSize)]
      .filter(Boolean)
      .join(" ");
    description.setAttribute("part", "description");
    description.textContent = this.description;
    return description;
  }

  private createSlotRegion(
    className: string,
    part: string,
    slotName: string,
  ): HTMLElement {
    const wrapper = this.ownerDocument.createElement("div");
    wrapper.className = className;
    wrapper.setAttribute("part", part);
    const slot = createSlot(this.ownerDocument, slotName);
    slot.setAttribute("part", `${part}-slot`);
    wrapper.append(slot);
    return wrapper;
  }

  private createSkeleton(): HTMLElement {
    const skeleton = this.ownerDocument.createElement("div");
    skeleton.className = "skeleton";
    skeleton.setAttribute("part", "skeleton");

    for (const [className, part] of [
      ["skeletonLine skeletonLineMedium", "skeleton-line skeleton-line-medium"],
      ["skeletonLine skeletonLineFull", "skeleton-line skeleton-line-full"],
      ["skeletonLine skeletonLineShort", "skeleton-line skeleton-line-short"],
    ] as const) {
      const line = this.ownerDocument.createElement("span");
      line.className = className;
      line.setAttribute("part", part);
      skeleton.append(line);
    }

    return skeleton;
  }

  private render(): void {
    const root = this.ownerDocument.createElement(this.as);
    const headerStartSlotName = pickSlotName(this, HEADER_START_SLOT_NAMES);
    const headerEndSlotName = pickSlotName(this, HEADER_END_SLOT_NAMES);
    const footerStartSlotName = pickSlotName(this, FOOTER_START_SLOT_NAMES);
    const footerEndSlotName = pickSlotName(this, FOOTER_END_SLOT_NAMES);
    const hasFooter = Boolean(footerStartSlotName || footerEndSlotName);
    const linkSuppressed = Boolean(this.link) && hasFooter;
    const currentOrigin =
      this.ownerDocument.defaultView?.location.origin ?? null;
    const effectiveLink = linkSuppressed
      ? null
      : analyzeHref(this.link, currentOrigin);

    if (linkSuppressed && typeof globalThis.console?.warn === "function") {
      console.warn(
        "Card: `link` is ignored when `footerStart`/`footerEnd` are set — a stretched anchor cannot wrap interactive footer controls. Use a plain card with buttons instead.",
      );
    }

    root.className = [
      "card",
      this.variant,
      this.padding === "none"
        ? "paddingNone"
        : this.padding === "sm"
          ? "paddingSm"
          : this.padding === "lg"
            ? "paddingLg"
            : "paddingMd",
      effectiveLink ? "linked" : "",
    ]
      .filter(Boolean)
      .join(" ");
    root.setAttribute(
      "part",
      [
        "root",
        "card",
        "surface",
        effectiveLink ? "linked" : "",
        this.loading ? "loading" : "",
      ]
        .filter(Boolean)
        .join(" "),
    );

    if (this.loading) {
      root.setAttribute("role", "status");
      root.setAttribute("aria-busy", "true");
    }
    copyForwardedAttributes(this, root);

    if (this.loading) {
      root.append(this.createSkeleton());
      this.replaceShadow(styles, root);
      return;
    }

    const titleNode = this.titleText ? this.createTitle(effectiveLink) : null;
    const leadingHeader = headerStartSlotName
      ? this.createSlotRegion(
          "headerStart",
          "header-start",
          headerStartSlotName,
        )
      : titleNode;
    const trailingHeader = headerEndSlotName
      ? this.createSlotRegion("headerEnd", "header-end", headerEndSlotName)
      : null;

    if (leadingHeader || trailingHeader) {
      const header = this.ownerDocument.createElement("div");
      header.className = "header";
      header.setAttribute("part", "header");
      if (leadingHeader) {
        if (leadingHeader === titleNode) {
          const start = this.ownerDocument.createElement("div");
          start.className = "headerStart";
          start.setAttribute("part", "header-start");
          start.append(leadingHeader);
          header.append(start);
        } else {
          header.append(leadingHeader);
        }
      }
      if (trailingHeader) header.append(trailingHeader);
      root.append(header);
    }

    if (this.description) {
      root.append(this.createDescription());
    }

    const body = this.ownerDocument.createElement("div");
    body.className = "body";
    body.setAttribute("part", "body");
    const bodySlot = createSlot(this.ownerDocument);
    bodySlot.setAttribute("part", "content");
    if (!hasDefaultSlotContent(this) && this.content) {
      bodySlot.textContent = this.content;
    }
    body.append(bodySlot);
    root.append(body);

    if (hasFooter) {
      const footer = this.ownerDocument.createElement("div");
      footer.className = "footer";
      footer.setAttribute("part", "footer");
      if (footerStartSlotName) {
        footer.append(
          this.createSlotRegion(
            "footerStart",
            "footer-start",
            footerStartSlotName,
          ),
        );
      }
      if (footerEndSlotName) {
        footer.append(
          this.createSlotRegion("footerEnd", "footer-end", footerEndSlotName),
        );
      }
      root.append(footer);
    }

    if (effectiveLink && !this.titleText) {
      const anchor = this.ownerDocument.createElement("a");
      anchor.className = "cardLink";
      anchor.setAttribute("part", "link stretched-link");
      anchor.href = effectiveLink.href;
      const rel = secureRel("", effectiveLink.external);
      if (rel) anchor.rel = rel;
      anchor.setAttribute("aria-label", this.linkLabel || effectiveLink.href);
      root.append(anchor);
    }

    this.replaceShadow(styles, root);
  }
}
