import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export interface DtLanguageSwitcherOption {
  code: string;
  label: string;
  ariaLabel: string;
}

const styles = `
  :host {
    display: inline-flex;
    flex: 0 0 auto;
    color: var(--primary-text-color, currentcolor);
    font-family: var(--font-heading, var(--primary-heading-font, sans-serif));
  }
  :host([hidden]) { display: none; }
  .root {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
  }
  .trayAnchor {
    position: absolute;
    top: 50%;
    inset-inline-end: 100%;
    z-index: 50;
    padding-inline-end: var(--space-internal-4, 0.25rem);
    transform: translateY(-50%);
    pointer-events: none;
  }
  .trayAnchor[data-open="true"] { pointer-events: auto; }
  .trayFan {
    display: inline-flex;
    inline-size: max-content;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-internal-4, 0.25rem);
    transform-origin: 100% 50%;
    animation: dt-language-switcher-enter
      var(--duration-fast, 160ms) var(--ease-out-cubic, ease-out);
  }
  .option {
    display: inline-flex;
    flex: 0 0 auto;
    padding: var(--space-internal-6, 0.375rem)
      var(--space-internal-10, 0.625rem);
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius-sm, 0.25rem);
    background: transparent;
    color: var(--secondary-text-color, currentcolor);
    font: inherit;
    font-size: var(--font-size-text-s, 0.875rem);
    font-weight: var(--font-weight-semibold, 600);
    letter-spacing: 0;
    line-height: 1.2;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--duration-fast, 160ms)
        var(--ease-out-cubic, ease-out),
      border-color var(--duration-fast, 160ms)
        var(--ease-out-cubic, ease-out),
      color var(--duration-fast, 160ms) var(--ease-out-cubic, ease-out);
  }
  .trigger {
    position: relative;
    z-index: 1;
    color: var(--primary-text-color, currentcolor);
    font-weight: var(--font-weight-medium, 500);
  }
  .trigger[data-open="true"] {
    border-color: currentcolor;
    background: color-mix(in srgb, currentcolor 5%, transparent);
  }
  .floated { color: var(--primary-text-color, currentcolor); opacity: 0.8; }
  @media (hover: hover) and (pointer: fine) {
    .option:hover {
      background: color-mix(in srgb, currentcolor 5%, transparent);
      color: var(--primary-text-color, currentcolor);
      opacity: 1;
    }
  }
  .option:focus-visible {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--color-focus-ring, currentcolor));
    outline-offset: 2px;
  }
  .srOnly {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  @keyframes dt-language-switcher-enter {
    from { opacity: 0; transform: translateX(0.625rem); }
    to { opacity: 1; transform: translateX(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .option { transition: none; }
    .trayFan { animation: none; }
  }
  @media (forced-colors: active) {
    .trigger[data-open="true"] { border-color: ButtonText; }
    .option { color: ButtonText; forced-color-adjust: none; }
    .option:focus-visible {
      outline: 3px solid Highlight;
      outline-offset: 2px;
    }
  }
`;

function cloneOption(
  option: DtLanguageSwitcherOption,
): DtLanguageSwitcherOption {
  return { ...option };
}

function addClasses(element: Element, value: string): void {
  const classNames = value.split(/\s+/).filter(Boolean);
  if (classNames.length > 0) element.classList.add(...classNames);
}

export class DtLanguageSwitcherElement extends DigitaltableteurElement {
  static observedAttributes = [
    "languages",
    "current-lang",
    "open",
    "aria-label",
    "button-class-name",
    "active-button-class-name",
    "open-trigger-class-name",
    "floated-button-class-name",
    "lang",
  ];

  private static sequence = 0;

  private assignedLanguages: DtLanguageSwitcherOption[] | null = null;
  private openState = false;
  private syncingOpenAttribute = false;
  private readonly instanceId = `dt-language-switcher-${++DtLanguageSwitcherElement.sequence}`;
  private documentListenersAttached = false;

  connectedCallback(): void {
    this.openState = this.hasAttribute("open");
    this.render();
    if (this.openState) this.attachDocumentListeners();
  }

  disconnectedCallback(): void {
    this.detachDocumentListeners();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "languages") this.assignedLanguages = null;
    if (name === "open" && !this.syncingOpenAttribute) {
      this.openState = this.hasAttribute("open");
      if (this.openState) this.attachDocumentListeners();
      else this.detachDocumentListeners();
    }
    if (this.isConnected) this.render();
  }

  get languages(): DtLanguageSwitcherOption[] {
    return (this.assignedLanguages ?? this.parseLanguages()).map(cloneOption);
  }

  set languages(value: DtLanguageSwitcherOption[]) {
    this.assignedLanguages = value.map(cloneOption);
    if (this.isConnected) this.render();
  }

  get currentLang(): string {
    return stringAttribute(this, "current-lang");
  }

  set currentLang(value: string) {
    reflectAttribute(this, "current-lang", value || null);
  }

  get open(): boolean {
    return this.openState;
  }

  set open(value: boolean) {
    this.updateOpen(value);
  }

  get buttonClassName(): string {
    return stringAttribute(this, "button-class-name");
  }

  set buttonClassName(value: string) {
    reflectAttribute(this, "button-class-name", value || null);
  }

  get activeButtonClassName(): string {
    return stringAttribute(this, "active-button-class-name");
  }

  set activeButtonClassName(value: string) {
    reflectAttribute(this, "active-button-class-name", value || null);
  }

  get openTriggerClassName(): string {
    return stringAttribute(this, "open-trigger-class-name");
  }

  set openTriggerClassName(value: string) {
    reflectAttribute(this, "open-trigger-class-name", value || null);
  }

  get floatedButtonClassName(): string {
    return stringAttribute(this, "floated-button-class-name");
  }

  set floatedButtonClassName(value: string) {
    reflectAttribute(this, "floated-button-class-name", value || null);
  }

  private parseLanguages(): DtLanguageSwitcherOption[] {
    const source = this.getAttribute("languages");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const option = entry as Record<string, unknown>;
        return typeof option.code === "string" &&
          typeof option.label === "string" &&
          typeof option.ariaLabel === "string"
          ? [
              {
                code: option.code,
                label: option.label,
                ariaLabel: option.ariaLabel,
              },
            ]
          : [];
      });
    } catch {
      return [];
    }
  }

  private updateOpen(value: boolean, restoreFocus = false): void {
    if (this.openState === value) return;
    this.openState = value;
    this.syncingOpenAttribute = true;
    reflectBooleanAttribute(this, "open", value);
    this.syncingOpenAttribute = false;
    if (value) this.attachDocumentListeners();
    else this.detachDocumentListeners();
    if (this.isConnected) this.render(restoreFocus);
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private attachDocumentListeners(): void {
    if (this.documentListenersAttached || !this.isConnected) return;
    this.ownerDocument.addEventListener("pointerdown", this.handlePointerDown);
    this.ownerDocument.addEventListener("mousedown", this.handlePointerDown);
    this.ownerDocument.addEventListener("keydown", this.handleDocumentKeydown);
    this.documentListenersAttached = true;
  }

  private detachDocumentListeners(): void {
    if (!this.documentListenersAttached) return;
    this.ownerDocument.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );
    this.ownerDocument.removeEventListener("mousedown", this.handlePointerDown);
    this.ownerDocument.removeEventListener(
      "keydown",
      this.handleDocumentKeydown,
    );
    this.documentListenersAttached = false;
  }

  private readonly handlePointerDown = (event: Event): void => {
    const path = event.composedPath();
    if (!path.includes(this)) this.updateOpen(false);
  };

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.openState) return;
    event.preventDefault();
    this.updateOpen(false, true);
  };

  private select(option: DtLanguageSwitcherOption): void {
    this.dispatchEvent(
      new CustomEvent("language-change", {
        detail: { code: option.code, language: cloneOption(option) },
        bubbles: true,
        composed: true,
      }),
    );
    this.updateOpen(false, true);
  }

  private groupLabel(): string {
    return (
      stringAttribute(this, "aria-label") ||
      localizedText(this, { en: "Language", fi: "Kieli", sv: "Språk" })
    );
  }

  private expandLabel(): string {
    return localizedText(this, {
      en: "Show language options",
      fi: "Näytä kielivaihtoehdot",
      sv: "Visa språkalternativ",
    });
  }

  private collapseLabel(): string {
    return localizedText(this, {
      en: "Hide language options",
      fi: "Piilota kielivaihtoehdot",
      sv: "Dölj språkalternativ",
    });
  }

  private render(focusTrigger = false): void {
    const languages = this.languages;
    const current =
      languages.find((language) => language.code === this.currentLang) ??
      languages[0];
    const root = this.ownerDocument.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", this.groupLabel());

    if (!current) {
      this.replaceShadow(styles, root);
      return;
    }

    const descriptionId = `${this.instanceId}-description`;
    const trigger = this.ownerDocument.createElement("button");
    trigger.type = "button";
    trigger.className = "option trigger";
    addClasses(trigger, this.buttonClassName);
    addClasses(trigger, this.activeButtonClassName);
    if (this.openState) addClasses(trigger, this.openTriggerClassName);
    trigger.setAttribute("part", "trigger option");
    trigger.setAttribute("aria-expanded", String(this.openState));
    trigger.setAttribute("aria-controls", descriptionId);
    trigger.setAttribute("aria-current", "true");
    trigger.setAttribute("data-open", String(this.openState));
    trigger.setAttribute(
      "aria-label",
      this.openState
        ? this.collapseLabel()
        : `${current.ariaLabel}. ${this.expandLabel()}`,
    );
    trigger.textContent = current.label;
    trigger.addEventListener("click", () =>
      this.updateOpen(!this.openState, true),
    );
    root.append(trigger);

    const anchor = this.ownerDocument.createElement("div");
    anchor.className = "trayAnchor";
    anchor.setAttribute("part", "options");
    anchor.setAttribute("data-open", String(this.openState));
    anchor.setAttribute("aria-hidden", String(!this.openState));
    anchor.toggleAttribute("inert", !this.openState);

    if (this.openState) {
      const fan = this.ownerDocument.createElement("div");
      fan.className = "trayFan";
      for (const option of languages
        .filter((language) => language.code !== current.code)
        .reverse()) {
        const button = this.ownerDocument.createElement("button");
        button.type = "button";
        button.className = "option floated";
        addClasses(button, this.buttonClassName);
        addClasses(button, this.floatedButtonClassName);
        button.setAttribute("part", "option");
        button.setAttribute("aria-label", option.ariaLabel);
        button.dataset.code = option.code;
        button.textContent = option.label;
        button.addEventListener("click", () => this.select(option));
        fan.append(button);
      }
      anchor.append(fan);
    }
    root.append(anchor);

    const description = this.ownerDocument.createElement("span");
    description.id = descriptionId;
    description.className = "srOnly";
    description.textContent = this.openState
      ? this.collapseLabel()
      : this.expandLabel();
    root.append(description);

    this.replaceShadow(styles, root);
    if (focusTrigger) {
      this.shadowRoot?.querySelector<HTMLButtonElement>(".trigger")?.focus();
    }
  }
}
