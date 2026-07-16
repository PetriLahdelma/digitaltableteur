import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const LOADINGS = ["lazy", "eager"] as const;
const DECODINGS = ["auto", "sync", "async"] as const;
export type DtPersonCardImageLoading = (typeof LOADINGS)[number];
export type DtPersonCardImageDecoding = (typeof DECODINGS)[number];

const socialChannels = [
  ["linkedin", "linkedin-logo", "LinkedIn"],
  ["github", "github-logo", "GitHub"],
  ["facebook", "facebook-logo", "Facebook"],
  ["twitter", "x-twitter", "Twitter"],
  ["dribbble", "dribbble-logo", "Dribbble"],
  ["medium", "medium-logo", "Medium"],
  ["instagram", "instagram-logo", "Instagram"],
  ["substack", "newspaper-clipping", "Substack"],
] as const;

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .card { display: grid; box-sizing: border-box; inline-size: fit-content; padding-block: var(--space-layout-32); padding-inline: var(--space-layout-40); grid-template-columns: minmax(96px, 96px) minmax(0, 1fr); align-items: center; gap: var(--space-layout-24, 1.5rem); border: 2px solid var(--color-primary); background-color: var(--color-light-bg); color: var(--color-primary); }
  .portrait { inline-size: 96px; block-size: 96px; margin-block: auto; border-radius: 100rem; aspect-ratio: 1; clip-path: inset(2px round 50%); object-fit: cover; }
  .details { display: grid; min-inline-size: 0; justify-items: start; text-align: start; }
  .nameTitle { display: flex; flex-direction: column; gap: 0; line-height: .8; }
  h3, p { margin: 0; color: var(--color-primary); font-family: var(--font-text); }
  h3 { font-size: var(--font-size-title-xxs, 1.25rem); font-weight: 600; line-height: 1.2; }
  p { line-height: 1.4; }
  .email { position: relative; display: inline-flex; margin-block-start: var(--space-internal-8, .5rem); padding-block-end: 6px; color: var(--color-primary); text-decoration: none; overflow-wrap: anywhere; }
  .email::after { position: absolute; inset-inline: 0; inset-block-end: 0; block-size: 6px; background-color: var(--underline-accent-color, currentcolor); opacity: .9; content: ""; mask-image: var(--wavy-underline-mask); mask-repeat: repeat-x; mask-size: 16px 6px; }
  .social { display: flex; margin-block-start: .5rem; flex-wrap: wrap; gap: .75rem; }
  .social a { display: inline-flex; align-items: center; color: var(--color-primary); text-decoration: none; }
  a:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; }
  .skeleton { position: relative; display: block; overflow: hidden; border-radius: var(--radius-md, .375rem); background: var(--color-muted); }
  .skeletonPortrait { inline-size: 6rem; block-size: 6rem; border-radius: 50%; }
  .skeletonLines { display: grid; inline-size: min(18rem, 60vw); gap: .65rem; }
  .skeletonLine { block-size: .875rem; }
  .skeletonLine:nth-child(1) { inline-size: 72%; }
  .skeletonLine:nth-child(2) { inline-size: 56%; }
  .skeletonLine:nth-child(3) { inline-size: 48%; }
  @media (width <= 768px) { .card { grid-template-columns: 1fr; justify-items: center; text-align: center; } .portrait { max-inline-size: 240px; max-block-size: 240px; } .details { justify-items: start; } }
  @media (forced-colors: active) { .social a, .email { color: LinkText; } .skeleton { border: 1px solid CanvasText; background: Canvas; } }
`;

export class DtPersonCardElement extends DigitaltableteurElement {
  static observedAttributes = [
    "image-src",
    "image-alt",
    "image-src-set",
    "image-sizes",
    "name",
    "person-title",
    "email",
    ...socialChannels.flatMap(([channel]) => [
      `${channel}-url`,
      `${channel}-label`,
    ]),
    "image-loading",
    "image-decoding",
    "loading",
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
  get imageSrc(): string {
    return this.value("image-src");
  }
  set imageSrc(value: string) {
    this.setValue("image-src", value);
  }
  get imageAlt(): string {
    return this.value("image-alt");
  }
  set imageAlt(value: string) {
    this.setValue("image-alt", value);
  }
  get imageSrcSet(): string {
    return this.value("image-src-set");
  }
  set imageSrcSet(value: string) {
    this.setValue("image-src-set", value);
  }
  get imageSizes(): string {
    return this.value("image-sizes");
  }
  set imageSizes(value: string) {
    this.setValue("image-sizes", value);
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
  get email(): string {
    return this.value("email");
  }
  set email(value: string) {
    this.setValue("email", value);
  }
  get linkedinUrl(): string {
    return this.value("linkedin-url");
  }
  set linkedinUrl(value: string) {
    this.setValue("linkedin-url", value);
  }
  get linkedinLabel(): string {
    return this.value("linkedin-label");
  }
  set linkedinLabel(value: string) {
    this.setValue("linkedin-label", value);
  }
  get githubUrl(): string {
    return this.value("github-url");
  }
  set githubUrl(value: string) {
    this.setValue("github-url", value);
  }
  get githubLabel(): string {
    return this.value("github-label");
  }
  set githubLabel(value: string) {
    this.setValue("github-label", value);
  }
  get facebookUrl(): string {
    return this.value("facebook-url");
  }
  set facebookUrl(value: string) {
    this.setValue("facebook-url", value);
  }
  get facebookLabel(): string {
    return this.value("facebook-label");
  }
  set facebookLabel(value: string) {
    this.setValue("facebook-label", value);
  }
  get twitterUrl(): string {
    return this.value("twitter-url");
  }
  set twitterUrl(value: string) {
    this.setValue("twitter-url", value);
  }
  get twitterLabel(): string {
    return this.value("twitter-label");
  }
  set twitterLabel(value: string) {
    this.setValue("twitter-label", value);
  }
  get dribbbleUrl(): string {
    return this.value("dribbble-url");
  }
  set dribbbleUrl(value: string) {
    this.setValue("dribbble-url", value);
  }
  get dribbbleLabel(): string {
    return this.value("dribbble-label");
  }
  set dribbbleLabel(value: string) {
    this.setValue("dribbble-label", value);
  }
  get mediumUrl(): string {
    return this.value("medium-url");
  }
  set mediumUrl(value: string) {
    this.setValue("medium-url", value);
  }
  get mediumLabel(): string {
    return this.value("medium-label");
  }
  set mediumLabel(value: string) {
    this.setValue("medium-label", value);
  }
  get instagramUrl(): string {
    return this.value("instagram-url");
  }
  set instagramUrl(value: string) {
    this.setValue("instagram-url", value);
  }
  get instagramLabel(): string {
    return this.value("instagram-label");
  }
  set instagramLabel(value: string) {
    this.setValue("instagram-label", value);
  }
  get substackUrl(): string {
    return this.value("substack-url");
  }
  set substackUrl(value: string) {
    this.setValue("substack-url", value);
  }
  get substackLabel(): string {
    return this.value("substack-label");
  }
  set substackLabel(value: string) {
    this.setValue("substack-label", value);
  }
  get imageLoading(): DtPersonCardImageLoading {
    return enumAttribute(this, "image-loading", LOADINGS, "lazy");
  }
  set imageLoading(value: DtPersonCardImageLoading) {
    reflectAttribute(this, "image-loading", value);
  }
  get imageDecoding(): DtPersonCardImageDecoding {
    return enumAttribute(this, "image-decoding", DECODINGS, "async");
  }
  set imageDecoding(value: DtPersonCardImageDecoding) {
    reflectAttribute(this, "image-decoding", value);
  }
  get loading(): boolean {
    return this.hasAttribute("loading");
  }
  set loading(value: boolean) {
    reflectBooleanAttribute(this, "loading", value);
  }

  private renderLoading(root: HTMLElement): void {
    root.setAttribute("aria-busy", "true");
    root.setAttribute("role", "status");
    root.setAttribute("aria-label", "Loading person");
    const portrait = this.ownerDocument.createElement("span");
    portrait.className = "skeleton skeletonPortrait";
    const lines = this.ownerDocument.createElement("span");
    lines.className = "skeletonLines";
    for (let index = 0; index < 3; index += 1) {
      const line = this.ownerDocument.createElement("span");
      line.className = "skeleton skeletonLine";
      lines.append(line);
    }
    root.append(portrait, lines);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = "card";
    root.setAttribute("part", "person-card");
    if (this.loading) {
      this.renderLoading(root);
      this.replaceShadow(styles, root);
      return;
    }
    const portrait = this.imageSrc
      ? this.ownerDocument.createElement("img")
      : this.ownerDocument.createElement("span");
    portrait.className = "portrait";
    portrait.setAttribute("part", "portrait");
    if (portrait instanceof HTMLImageElement) {
      portrait.src = this.imageSrc;
      portrait.alt = this.imageAlt;
      portrait.srcset = this.imageSrcSet || `${this.imageSrc} 1x`;
      portrait.sizes =
        this.imageSizes ||
        "(max-width: 768px) 240px, (max-width: 1024px) 180px, 96px";
      portrait.loading = this.imageLoading;
      portrait.decoding = this.imageDecoding;
    } else {
      portrait.setAttribute("aria-hidden", "true");
    }
    const details = this.ownerDocument.createElement("div");
    details.className = "details";
    const nameTitle = this.ownerDocument.createElement("div");
    nameTitle.className = "nameTitle";
    const name = this.ownerDocument.createElement("h3");
    name.textContent = this.name;
    const title = this.ownerDocument.createElement("p");
    title.className = "personTitle";
    title.textContent = this.personTitle;
    const email = this.ownerDocument.createElement("a");
    email.className = "email";
    email.href = `mailto:${this.email}`;
    email.textContent = this.email;
    const social = this.ownerDocument.createElement("div");
    social.className = "social";
    social.setAttribute("part", "social-links");
    for (const [channel, iconName, labelName] of socialChannels) {
      const href = this.value(`${channel}-url`);
      if (!href) continue;
      const label =
        this.value(`${channel}-label`) || `View ${labelName} profile`;
      const link = this.ownerDocument.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", label);
      link.title = label;
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", iconName);
      icon.setAttribute("size", "sm");
      icon.setAttribute("decorative", "");
      link.append(icon);
      social.append(link);
    }
    nameTitle.append(name, title, email);
    details.append(nameTitle, social);
    root.append(portrait, details);
    this.replaceShadow(styles, root);
  }
}
