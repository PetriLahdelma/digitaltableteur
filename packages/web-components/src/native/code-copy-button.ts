import { nativeCodeGlyphs } from "../generated/native-code-glyphs";
import { copyTextToClipboard } from "./code-snippet";
import {
  DigitaltableteurElement,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export type DtCodeCopyButtonStatus = "idle" | "copied" | "error";

/* Transcribed from CodeCopyButton.module.css. */
export const codeCopyButtonStyles = `
  .copyRoot {
    display: inline-flex;
    position: relative;
    flex-shrink: 0;
  }
  .copyButton {
    display: inline-flex;
    margin: 0;
    padding: 0;
    block-size: calc(var(--space-internal-24) + var(--space-internal-4));
    inline-size: calc(var(--space-internal-24) + var(--space-internal-4));
    justify-content: center;
    align-items: center;
    border: 0;
    border-radius: var(--radius-md);
    background-color: transparent;
    color: var(--color-muted);
    cursor: pointer;
    box-sizing: border-box;
    transition:
      background-color var(--duration-fast) var(--ease-out-cubic),
      color var(--duration-fast) var(--ease-out-cubic);
  }
  .copyButton:hover {
    background-color: var(--color-neutral-bg);
    color: var(--color-text);
  }
  .copyButton:focus-visible {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--color-primary));
    outline-offset: 0;
  }
  .copyButton[data-status="copied"] {
    color: var(--color-success-contrast);
  }
  .copyButton:disabled {
    color: var(--color-disabled-text);
    cursor: not-allowed;
  }
  .copyButton:disabled:hover {
    background-color: transparent;
  }
  .copyButton svg {
    flex-shrink: 0;
  }
  .copyStatus {
    position: absolute;
    padding: 0;
    block-size: 1px;
    inline-size: 1px;
    white-space: nowrap;
    clip-path: inset(50%);
    overflow: hidden;
  }
  :host-context(.themeHCB) .copyButton:hover,
  :host-context(.themeHCW) .copyButton:hover {
    outline: 1px solid var(--color-text);
    outline-offset: -1px;
  }
  @media (prefers-reduced-motion: reduce) {
    .copyButton { transition: none; }
  }
  @media (forced-colors: active) {
    .copyButton { color: ButtonText; }
    .copyButton:hover {
      outline: 1px solid ButtonText;
      outline-offset: -1px;
    }
    .copyButton:focus-visible {
      outline: 3px solid Highlight;
      forced-color-adjust: none;
    }
  }
`;

const hostStyles = `
  :host { display: inline-flex; }
  :host([hidden]) { display: none; }
`;

export interface CodeCopyControl {
  root: HTMLElement;
  setValue(value: string): void;
}

/**
 * Builds the copy control (button + live region) inside a shadow tree. Used by
 * dt-code-copy-button and composed directly by dt-code-block and dt-snippet,
 * which keeps one tab stop and one implementation.
 */
export function createCodeCopyControl(
  host: HTMLElement,
  options: {
    value: string;
    label?: string;
    disabled?: boolean;
    resetAfterMs?: number;
    onCopied?: (text: string) => void;
  },
): CodeCopyControl {
  const document = host.ownerDocument;
  let value = options.value;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const resetAfterMs = options.resetAfterMs ?? 1600;

  const root = document.createElement("span");
  root.className = "copyRoot";
  root.setAttribute("part", "copy");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "copyButton";
  button.setAttribute("part", "copy-button");
  button.setAttribute(
    "aria-label",
    options.label ||
      localizedText(host, { en: "Copy code", fi: "Kopioi koodi", sv: "Kopiera kod" }),
  );
  button.disabled = Boolean(options.disabled);

  const status = document.createElement("span");
  status.className = "copyStatus";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const show = (next: DtCodeCopyButtonStatus) => {
    button.dataset.status = next;
    button.innerHTML = next === "copied" ? nativeCodeGlyphs.Check : nativeCodeGlyphs.Copy;
    status.textContent =
      next === "copied"
        ? localizedText(host, { en: "Copied", fi: "Kopioitu", sv: "Kopierad" })
        : next === "error"
          ? localizedText(host, {
              en: "Copy failed",
              fi: "Kopiointi epäonnistui",
              sv: "Kopieringen misslyckades",
            })
          : "";
  };

  const settle = (next: DtCodeCopyButtonStatus, afterMs: number) => {
    show(next);
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => show("idle"), afterMs);
  };

  button.addEventListener("click", async () => {
    if (!value) return;
    try {
      await copyTextToClipboard(document, value);
      settle("copied", resetAfterMs);
      options.onCopied?.(value);
    } catch {
      settle("error", resetAfterMs + 600);
    }
  });

  show("idle");
  root.append(button, status);
  return {
    root,
    setValue(next: string) {
      value = next;
    },
  };
}

export class DtCodeCopyButtonElement extends DigitaltableteurElement {
  static observedAttributes = ["value", "label", "disabled", "reset-after-ms"];

  private valueProperty: string | null = null;

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get value(): string {
    return this.valueProperty ?? stringAttribute(this, "value");
  }

  set value(next: string) {
    this.valueProperty = next;
    if (this.isConnected) this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }

  set label(next: string) {
    reflectAttribute(this, "label", next || null);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(next: boolean) {
    reflectBooleanAttribute(this, "disabled", next);
  }

  get resetAfterMs(): number {
    // numberAttribute reads a missing attribute as 0 (Number(null)).
    return this.hasAttribute("reset-after-ms")
      ? numberAttribute(this, "reset-after-ms", 1600)
      : 1600;
  }

  set resetAfterMs(next: number) {
    reflectAttribute(this, "reset-after-ms", next);
  }

  private render(): void {
    const control = createCodeCopyControl(this, {
      value: this.value,
      label: this.label,
      disabled: this.disabled,
      resetAfterMs: this.resetAfterMs,
      onCopied: (text) =>
        this.dispatchEvent(
          new CustomEvent("copy", {
            detail: { text },
            bubbles: true,
            composed: true,
          }),
        ),
    });
    this.replaceShadow(hostStyles + codeCopyButtonStyles, control.root);
  }
}
