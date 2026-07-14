import {
  nativeIconAliases,
  nativeIconMarkup,
  type NativeIconName,
} from "../generated/native-icon-data";
import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const WEIGHTS = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
] as const;
const SIZES = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
const FLIPS = ["horizontal", "vertical", "both"] as const;
export type DtIconWeight = (typeof WEIGHTS)[number];
export type DtIconSize = (typeof SIZES)[number];
export type DtIconFlip = (typeof FLIPS)[number];

const legacyWeights: Record<string, DtIconWeight> = {
  solid: "regular",
  regular: "regular",
  light: "light",
  thin: "thin",
  duotone: "duotone",
  brands: "regular",
};
const styles = `
  :host { display: inline-flex; flex: none; line-height: 1; vertical-align: middle; }
  .root { display: inline-flex; inline-size: 1.5rem; block-size: 1.5rem; align-items: center; justify-content: center; color: var(--dt-icon-color, currentcolor); }
  .root svg { inline-size: 100%; block-size: 100%; transform-origin: center; }
  .\\32 xs { inline-size: 0.75rem; block-size: 0.75rem; } .xs { inline-size: 1rem; block-size: 1rem; } .sm { inline-size: 1.25rem; block-size: 1.25rem; } .md { inline-size: 1.5rem; block-size: 1.5rem; } .lg { inline-size: 2rem; block-size: 2rem; } .xl { inline-size: 3rem; block-size: 3rem; } .\\32 xl { inline-size: 4rem; block-size: 4rem; }
  .spin svg { animation: dt-icon-spin 1s linear infinite; } .pulse svg { animation: dt-icon-pulse 1.2s ease-in-out infinite; }
  @keyframes dt-icon-spin { to { transform: rotate(360deg); } } @keyframes dt-icon-pulse { 50% { transform: scale(1.1); } }
  @media (prefers-reduced-motion: reduce) { .spin svg, .pulse svg { animation: none; } }
`;

function toPascalCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join("");
}

function resolveName(rawName: string): NativeIconName | null {
  const cleaned = rawName.replace(/^fa-/, "");
  const candidates = [
    nativeIconAliases[cleaned],
    nativeIconAliases[rawName],
    toPascalCase(cleaned),
    cleaned,
    rawName,
  ].filter(Boolean);
  for (const candidate of candidates) {
    const resolved = nativeIconAliases[candidate] ?? candidate;
    if (resolved in nativeIconMarkup) return resolved as NativeIconName;
  }
  return null;
}

export class DtIconElement extends DigitaltableteurElement {
  static observedAttributes = [
    "name",
    "weight",
    "legacy-style",
    "size",
    "color",
    "rotate",
    "flip",
    "spin",
    "pulse",
    "mirrored",
    "aria-label",
    "decorative",
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
  get weight(): DtIconWeight {
    const legacy = legacyWeights[stringAttribute(this, "legacy-style")];
    return enumAttribute(this, "weight", WEIGHTS, legacy ?? "regular");
  }
  set weight(value: DtIconWeight) {
    reflectAttribute(this, "weight", value);
  }
  get size(): DtIconSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtIconSize) {
    reflectAttribute(this, "size", value);
  }
  get color(): string {
    return stringAttribute(this, "color");
  }
  set color(value: string) {
    reflectAttribute(this, "color", value || null);
  }
  get rotate(): number {
    const value = Number(this.getAttribute("rotate"));
    return [0, 90, 180, 270].includes(value) ? value : 0;
  }
  set rotate(value: number) {
    reflectAttribute(this, "rotate", value);
  }
  get flip(): DtIconFlip | "" {
    const value = this.getAttribute("flip");
    return FLIPS.includes(value as DtIconFlip) ? (value as DtIconFlip) : "";
  }
  set flip(value: DtIconFlip | "") {
    reflectAttribute(this, "flip", value || null);
  }
  get spin(): boolean {
    return this.hasAttribute("spin");
  }
  set spin(value: boolean) {
    reflectBooleanAttribute(this, "spin", value);
  }
  get pulse(): boolean {
    return this.hasAttribute("pulse");
  }
  set pulse(value: boolean) {
    reflectBooleanAttribute(this, "pulse", value);
  }
  get mirrored(): boolean {
    return this.hasAttribute("mirrored");
  }
  set mirrored(value: boolean) {
    reflectBooleanAttribute(this, "mirrored", value);
  }
  get ariaLabel(): string {
    return stringAttribute(this, "aria-label");
  }
  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }
  private render(): void {
    const root = this.ownerDocument.createElement("span");
    root.className = [
      "root",
      this.size,
      this.spin ? "spin" : "",
      this.pulse && !this.spin ? "pulse" : "",
    ]
      .filter(Boolean)
      .join(" ");
    root.setAttribute("part", "root");
    if (this.color) root.style.setProperty("--dt-icon-color", this.color);
    const decorative = this.hasAttribute("decorative") || !this.ariaLabel;
    if (decorative) root.setAttribute("aria-hidden", "true");
    else {
      root.setAttribute("role", "img");
      root.setAttribute("aria-label", this.ariaLabel);
    }
    const resolved = resolveName(this.name);
    if (resolved) {
      root.innerHTML = nativeIconMarkup[resolved][this.weight];
      const svg = root.querySelector("svg");
      if (svg) {
        svg.setAttribute("part", "svg");
        const transforms: string[] = [];
        if (this.rotate) transforms.push(`rotate(${this.rotate}deg)`);
        if (this.flip === "horizontal" || this.flip === "both" || this.mirrored)
          transforms.push("scaleX(-1)");
        if (this.flip === "vertical" || this.flip === "both")
          transforms.push("scaleY(-1)");
        if (transforms.length) svg.style.transform = transforms.join(" ");
      }
    } else if (this.name) {
      root.setAttribute("data-missing-icon", this.name);
    }
    this.replaceShadow(styles, root);
  }
}
