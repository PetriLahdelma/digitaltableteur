import { codeCopyButtonStyles, createCodeCopyControl } from "./code-copy-button";
import {
  darkSurfaceTokens,
  observeDocumentTheme,
  optionalBoolean,
} from "./code-shared";
import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const THEMES = ["default", "inverted"] as const;

export type DtSnippetTheme = (typeof THEMES)[number];

/* Transcribed from Snippet.module.css. */
const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .snippet {
    display: flex;
    margin: 0;
    padding-block: var(--space-internal-6);
    padding-inline: calc(var(--space-internal-12) + var(--space-internal-2))
      var(--space-internal-6);
    box-sizing: border-box;
    max-inline-size: 100%;
    align-items: center;
    gap: var(--space-internal-8);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    background-color: var(--main-body-background-color);
    color: var(--color-text);
  }
  .multi { align-items: flex-start; }
  .commands {
    display: grid;
    padding-block: var(--space-internal-2);
    min-inline-size: 0;
    flex: 1;
  }
  .line {
    display: flex;
    min-inline-size: 0;
    gap: var(--space-internal-8);
  }
  .prompt {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: var(--font-size-code-m);
    line-height: var(--line-height-code-row);
    color: var(--color-muted);
    user-select: none;
  }
  .command {
    margin: 0;
    padding: 0;
    min-inline-size: 0;
    font-family: var(--font-mono);
    font-size: var(--font-size-code-m);
    line-height: var(--line-height-code-row);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    color: var(--color-text);
  }
  @media (forced-colors: active) {
    .snippet { border-color: CanvasText; }
    .prompt, .command { color: CanvasText; }
  }
`;

/**
 * A copyable shell command. The $ prompt is aria-hidden and never copied.
 * Several commands go one per line in `command` (newline-separated) or in
 * the `commands` property.
 */
export class DtSnippetElement extends DigitaltableteurElement {
  static observedAttributes = ["command", "prompt", "theme", "copyable", "copy-label"];

  private commandsProperty: readonly string[] | null = null;
  private stopThemeObserver: (() => void) | null = null;

  connectedCallback(): void {
    this.render();
    this.stopThemeObserver = observeDocumentTheme(this.ownerDocument, () => {
      if (this.theme === "inverted") this.render();
    });
  }

  disconnectedCallback(): void {
    this.stopThemeObserver?.();
    this.stopThemeObserver = null;
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get command(): string {
    return stringAttribute(this, "command");
  }

  set command(value: string) {
    reflectAttribute(this, "command", value || null);
  }

  get commands(): readonly string[] {
    if (this.commandsProperty) return this.commandsProperty;
    return this.command ? this.command.split("\n") : [];
  }

  set commands(value: readonly string[]) {
    this.commandsProperty = [...value];
    if (this.isConnected) this.render();
  }

  /** Show the $ prompt. Absent means true; prompt="false" hides it. */
  get prompt(): boolean {
    return optionalBoolean(this, "prompt") ?? true;
  }

  set prompt(value: boolean) {
    reflectAttribute(this, "prompt", value ? null : "false");
  }

  get theme(): DtSnippetTheme {
    return enumAttribute(this, "theme", THEMES, "default");
  }

  set theme(value: DtSnippetTheme) {
    reflectAttribute(this, "theme", value);
  }

  /** Show the copy button. Absent means true; copyable="false" hides it. */
  get copyable(): boolean {
    return optionalBoolean(this, "copyable") ?? true;
  }

  set copyable(value: boolean) {
    reflectAttribute(this, "copyable", value ? null : "false");
  }

  get copyLabel(): string {
    return stringAttribute(this, "copy-label");
  }

  set copyLabel(value: string) {
    reflectAttribute(this, "copy-label", value || null);
  }

  private render(): void {
    const document = this.ownerDocument;
    const commands = this.commands;
    const root = document.createElement("div");
    root.className = ["snippet", commands.length > 1 ? "multi" : ""]
      .filter(Boolean)
      .join(" ");
    root.dataset.theme = this.theme;
    root.setAttribute("part", "root");

    if (this.theme === "inverted") {
      const tokens = darkSurfaceTokens(document);
      for (const [name, value] of Object.entries(tokens ?? {})) {
        root.style.setProperty(name, value);
      }
    }

    const list = document.createElement("div");
    list.className = "commands";
    for (const command of commands) {
      const line = document.createElement("div");
      line.className = "line";
      if (this.prompt) {
        const prompt = document.createElement("span");
        prompt.className = "prompt";
        prompt.setAttribute("aria-hidden", "true");
        prompt.textContent = "$";
        line.append(prompt);
      }
      const code = document.createElement("code");
      code.className = "command";
      code.textContent = command;
      line.append(code);
      list.append(line);
    }
    root.append(list);

    if (this.copyable) {
      const control = createCodeCopyControl(this, {
        value: commands.join("\n"),
        label: this.copyLabel,
        onCopied: (text) =>
          this.dispatchEvent(
            new CustomEvent("copy", {
              detail: { text },
              bubbles: true,
              composed: true,
            }),
          ),
      });
      root.append(control.root);
    }

    this.replaceShadow(styles + codeCopyButtonStyles, root);
  }
}
