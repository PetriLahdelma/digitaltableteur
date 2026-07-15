import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";

const STATES = ["error", "warning", "success", "info"] as const;
export type DtHelperTextState = (typeof STATES)[number];

const styles = `
  :host {
    display: block;
    margin-block-start: 0.5rem;
    font-family: var(--primary-body-font, sans-serif);
  }

  :host([hidden]) { display: none; }

  :host + :host {
    margin-block-start: 0;
  }

  .helperText {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin: 0;
    background-color: transparent;
    color: var(--color-primary, currentColor);
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: 1.45;
  }

  .error { color: var(--color-error, #b00020); }
  .warning { color: var(--color-warning-contrast, #b76f00); }
  .success { color: var(--color-success, #007f3a); }
  .info { color: var(--color-info, #0f62fe); }

  .icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    block-size: 1rem;
  }

  .icon svg {
    inline-size: 100%;
    block-size: 100%;
    fill: currentcolor;
    stroke: currentcolor;
  }
`;

const SVG_NS = "http://www.w3.org/2000/svg";

export class DtHelperTextElement extends DigitaltableteurElement {
  static observedAttributes = ["content", "state"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get state(): DtHelperTextState | null {
    const value = stringAttribute(this, "state");
    return STATES.includes(value as DtHelperTextState)
      ? (value as DtHelperTextState)
      : null;
  }

  set state(value: DtHelperTextState | null) {
    if (value) {
      reflectAttribute(this, "state", value);
    } else {
      this.removeAttribute("state");
    }
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private createIcon(state: DtHelperTextState): HTMLElement {
    const wrapper = this.ownerDocument.createElement("span");
    wrapper.className = "icon";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.setAttribute("part", "icon");

    const svg = this.ownerDocument.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("aria-hidden", "true");

    if (state === "warning") {
      const triangle = this.ownerDocument.createElementNS(SVG_NS, "path");
      triangle.setAttribute("d", "M8 1.5 15 14H1L8 1.5Z");
      svg.append(triangle);
      const line = this.ownerDocument.createElementNS(SVG_NS, "rect");
      line.setAttribute("x", "7.25");
      line.setAttribute("y", "5");
      line.setAttribute("width", "1.5");
      line.setAttribute("height", "5");
      line.setAttribute("rx", "0.75");
      line.setAttribute("fill", "white");
      line.setAttribute("stroke", "none");
      svg.append(line);
      const dot = this.ownerDocument.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", "8");
      dot.setAttribute("cy", "12");
      dot.setAttribute("r", "1");
      dot.setAttribute("fill", "white");
      dot.setAttribute("stroke", "none");
      svg.append(dot);
    } else {
      const circle = this.ownerDocument.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", "8");
      circle.setAttribute("cy", "8");
      circle.setAttribute("r", "7");
      svg.append(circle);

      if (state === "success") {
        const check = this.ownerDocument.createElementNS(SVG_NS, "path");
        check.setAttribute("d", "M4.25 8.1 6.9 10.75 11.75 5.9");
        check.setAttribute("fill", "none");
        check.setAttribute("stroke", "white");
        check.setAttribute("stroke-width", "1.75");
        check.setAttribute("stroke-linecap", "round");
        check.setAttribute("stroke-linejoin", "round");
        svg.append(check);
      } else if (state === "info") {
        const stem = this.ownerDocument.createElementNS(SVG_NS, "rect");
        stem.setAttribute("x", "7.25");
        stem.setAttribute("y", "6.25");
        stem.setAttribute("width", "1.5");
        stem.setAttribute("height", "5");
        stem.setAttribute("rx", "0.75");
        stem.setAttribute("fill", "white");
        stem.setAttribute("stroke", "none");
        svg.append(stem);
        const dot = this.ownerDocument.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", "8");
        dot.setAttribute("cy", "4.25");
        dot.setAttribute("r", "1");
        dot.setAttribute("fill", "white");
        dot.setAttribute("stroke", "none");
        svg.append(dot);
      } else {
        const line = this.ownerDocument.createElementNS(SVG_NS, "rect");
        line.setAttribute("x", "7.25");
        line.setAttribute("y", "3.75");
        line.setAttribute("width", "1.5");
        line.setAttribute("height", "6");
        line.setAttribute("rx", "0.75");
        line.setAttribute("fill", "white");
        line.setAttribute("stroke", "none");
        svg.append(line);
        const dot = this.ownerDocument.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", "8");
        dot.setAttribute("cy", "11.75");
        dot.setAttribute("r", "1");
        dot.setAttribute("fill", "white");
        dot.setAttribute("stroke", "none");
        svg.append(dot);
      }
    }

    wrapper.append(svg);
    return wrapper;
  }

  private render(): void {
    const paragraph = this.ownerDocument.createElement("p");
    const currentState = this.state;
    paragraph.className = ["helperText", currentState ?? ""]
      .filter(Boolean)
      .join(" ");
    paragraph.setAttribute("part", "helper-text");

    if (currentState) {
      paragraph.append(this.createIcon(currentState));
      if (currentState === "error") {
        paragraph.setAttribute("role", "alert");
      }
    }

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    slot.textContent = this.content;
    paragraph.append(slot);

    this.replaceShadow(styles, paragraph);
  }
}
