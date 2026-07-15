import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  reflectAttribute,
  stringAttribute,
} from "./base";

const RATIOS = ["1:1", "4:3", "16:9", "21:9", "3:2", "2:3"] as const;

export type DtAspectRatioRatio = (typeof RATIOS)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    position: relative;
    display: block;
    inline-size: 100%;
    overflow: hidden;
  }
  .ratio-1\\:1 { aspect-ratio: 1 / 1; }
  .ratio-4\\:3 { aspect-ratio: 4 / 3; }
  .ratio-16\\:9 { aspect-ratio: 16 / 9; }
  .ratio-21\\:9 { aspect-ratio: 21 / 9; }
  .ratio-3\\:2 { aspect-ratio: 3 / 2; }
  .ratio-2\\:3 { aspect-ratio: 2 / 3; }
  .content {
    position: absolute;
    inset: 0;
  }
  .fallback { display: contents; }
`;

function ratioClass(ratio: DtAspectRatioRatio): string {
  return `ratio-${ratio}`;
}

export class DtAspectRatioElement extends DigitaltableteurElement {
  static observedAttributes = ["ratio", "content"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get ratio(): DtAspectRatioRatio {
    return enumAttribute(this, "ratio", RATIOS, "16:9");
  }

  set ratio(value: DtAspectRatioRatio) {
    reflectAttribute(this, "ratio", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = `root ${ratioClass(this.ratio)}`;
    root.setAttribute("part", "root frame");

    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    content.setAttribute("part", "content");

    if (hasDefaultSlotContent(this)) {
      const slot = this.ownerDocument.createElement("slot");
      slot.setAttribute("part", "media");
      content.append(slot);
    } else if (this.content) {
      const fallback = this.ownerDocument.createElement("span");
      fallback.className = "fallback";
      fallback.setAttribute("part", "media fallback");
      fallback.textContent = this.content;
      content.append(fallback);
    }
    root.append(content);

    this.replaceShadow(styles, root);
  }
}
