import {
  DigitaltableteurElement,
  attachFormInternals,
  enumAttribute,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const APPEARANCES = ["default", "editorial"] as const;

export type DtFileUploadAppearance = (typeof APPEARANCES)[number];
export type DtFileUploadChangeSource = "picker" | "drop" | "clear";

export type DtFileUploadChangeDetail = {
  file: File | null;
  source: DtFileUploadChangeSource;
  rejectedFile?: File;
  error?: string;
};

const styles = `
  :host {
    display: block;
    font-family: var(--font-body, var(--primary-body-font, sans-serif));
  }

  :host([hidden]) {
    display: none;
  }

  .field {
    display: grid;
    gap: var(--space-internal-8, 0.5rem);
  }

  .field.defaultAppearance {
    margin-block: 0.5rem 1.25rem;
  }

  label,
  .editorialLabel {
    color: var(--color-primary, currentcolor);
    font: inherit;
  }

  .labelDisabled {
    color: var(--color-muted-light, GrayText);
    cursor: not-allowed;
  }

  .required {
    color: var(--color-error, #b00020);
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

  .nativeInput {
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

  .dropzone {
    display: grid;
    gap: var(--space-internal-8, 0.5rem);
  }

  .dropzone.dragging .summaryField,
  .dropzone.dragging .editorialTrigger {
    border-color: var(--color-primary, Highlight);
    background: color-mix(
      in srgb,
      var(--color-primary, Highlight) 8%,
      var(--color-white, Canvas)
    );
  }

  .summaryField,
  .editorialTrigger {
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: var(--input-height-md, 2.75rem);
    border: 1px solid var(--color-border, #767676);
    border-radius: var(--radius-lg, 0.5rem);
    background: var(--color-white, Canvas);
    color: var(--color-primary, CanvasText);
    font: inherit;
  }

  .summaryField {
    padding: 0.5rem 0.75rem;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .summaryField::placeholder {
    color: var(--color-muted-light, GrayText);
    opacity: 1;
  }

  .summaryField:focus-visible,
  .editorialTrigger:focus-visible,
  .actionButton:focus-visible,
  .clearButton:focus-visible {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--color-primary));
    outline-offset: var(--focus-ring-offset, 2px);
  }

  .summaryField[aria-invalid="true"],
  .editorialTrigger[aria-invalid="true"] {
    border-color: var(--color-error, #b00020);
  }

  .summaryField:disabled,
  .editorialTrigger:disabled,
  .actionButton:disabled,
  .clearButton:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .summaryField:disabled,
  .editorialTrigger:disabled {
    background: var(--color-disabled-bg-light, #eee);
    color: var(--color-muted-light, GrayText);
  }

  .editorialTrigger {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0.5rem 0.75rem;
    text-align: start;
    cursor: pointer;
  }

  .editorialPlaceholder {
    color: var(--color-muted-light, GrayText);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
  }

  .actionButton {
    min-block-size: 2.5rem;
    padding: var(--space-internal-8, 0.5rem) var(--space-internal-16, 1rem);
    border: 1px solid var(--color-border, #767676);
    border-radius: var(--radius-lg, 0.5rem);
    background: transparent;
    color: var(--color-primary, currentcolor);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .actionButton:hover:not(:disabled) {
    border-color: var(--color-primary, currentcolor);
    background: color-mix(
      in srgb,
      var(--color-border, #767676) 18%,
      transparent
    );
  }

  .clearButton {
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm, 0.25rem);
    background: transparent;
    color: var(--color-primary, currentcolor);
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .clearButton:hover:not(:disabled) {
    opacity: 0.7;
  }

  .message {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-primary, currentcolor);
  }

  .errorMessage {
    color: var(--color-error-text, var(--color-error, #b00020));
  }

  @media (forced-colors: active) {
    .summaryField,
    .editorialTrigger,
    .actionButton {
      border-color: CanvasText;
    }

    .summaryField[aria-invalid="true"],
    .editorialTrigger[aria-invalid="true"] {
      border-color: Mark;
    }
  }

  @media (width <= 480px) {
    .actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

function formatFileSummary(file: File | null): string {
  if (!file) return "";
  if (file.size === 0) return `${file.name} (0 KB)`;
  const sizeInKb = file.size / 1024;
  if (sizeInKb >= 1024) {
    return `${file.name} (${(sizeInKb / 1024).toFixed(1)} MB)`;
  }
  return `${file.name} (${Math.max(1, Math.round(sizeInKb))} KB)`;
}

/** Native single-file picker with drag/drop, clear action, and form participation. */
export class DtFileUploadElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "placeholder",
    "helper-text",
    "upload-button-label",
    "clear-button-label",
    "accept",
    "max-size-in-bytes",
    "size-error-message",
    "error",
    "disabled",
    "required",
    "appearance",
    "name",
    "lang",
  ];

  private hiddenInput: HTMLInputElement | null = null;
  private summaryControl: HTMLInputElement | HTMLButtonElement | null = null;
  private browseButton: HTMLButtonElement | null = null;
  private formDisabled = false;
  private inheritedDisabledState = false;
  private liveValue: File | null = null;
  private internalError = "";
  private dragDepth = 0;
  private dragging = false;
  private readonly internals = attachFormInternals(this);

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (name === "disabled" && this.effectiveDisabled) {
      this.dragDepth = 0;
      this.dragging = false;
    }
    if (!this.isConnected) return;
    this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (disabled) {
      this.dragDepth = 0;
      this.dragging = false;
    }
    if (this.isConnected) this.render();
  }

  formResetCallback(): void {
    this.hiddenInput?.setAttribute("value", "");
    if (this.hiddenInput) this.hiddenInput.value = "";
    this.liveValue = null;
    this.internalError = "";
    if (this.isConnected) this.render();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.liveValue = state instanceof File ? state : null;
    this.internalError = "";
    if (this.isConnected) this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }

  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get placeholder(): string {
    return stringAttribute(this, "placeholder");
  }

  set placeholder(value: string) {
    reflectAttribute(this, "placeholder", value || null);
  }

  get helperText(): string {
    return stringAttribute(this, "helper-text");
  }

  set helperText(value: string) {
    reflectAttribute(this, "helper-text", value || null);
  }

  get uploadButtonLabel(): string {
    return stringAttribute(this, "upload-button-label");
  }

  set uploadButtonLabel(value: string) {
    reflectAttribute(this, "upload-button-label", value || null);
  }

  get clearButtonLabel(): string {
    return stringAttribute(this, "clear-button-label");
  }

  set clearButtonLabel(value: string) {
    reflectAttribute(this, "clear-button-label", value || null);
  }

  get accept(): string {
    return stringAttribute(this, "accept");
  }

  set accept(value: string) {
    reflectAttribute(this, "accept", value || null);
  }

  get maxSizeInBytes(): number | undefined {
    if (!this.hasAttribute("max-size-in-bytes")) return undefined;
    const value = numberAttribute(this, "max-size-in-bytes", 0);
    return value > 0 ? value : undefined;
  }

  set maxSizeInBytes(value: number | undefined) {
    reflectAttribute(this, "max-size-in-bytes", value ?? null);
  }

  get sizeErrorMessage(): string {
    return stringAttribute(this, "size-error-message");
  }

  set sizeErrorMessage(value: string) {
    reflectAttribute(this, "size-error-message", value || null);
  }

  get error(): string {
    return stringAttribute(this, "error");
  }

  set error(value: string) {
    reflectAttribute(this, "error", value || null);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  get required(): boolean {
    return this.hasAttribute("required");
  }

  set required(value: boolean) {
    reflectBooleanAttribute(this, "required", value);
  }

  get appearance(): DtFileUploadAppearance {
    return enumAttribute(this, "appearance", APPEARANCES, "default");
  }

  set appearance(value: DtFileUploadAppearance) {
    reflectAttribute(this, "appearance", value);
  }

  get name(): string {
    return stringAttribute(this, "name");
  }

  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  get value(): File | null {
    return this.liveValue;
  }

  set value(value: File | null) {
    this.liveValue = value ?? null;
    this.internalError = "";
    if (this.hiddenInput) this.hiddenInput.value = "";
    if (this.isConnected) this.render();
  }

  get inheritedDisabled(): boolean {
    return this.inheritedDisabledState;
  }

  set inheritedDisabled(value: boolean) {
    this.inheritedDisabledState = value;
    if (value) {
      this.dragDepth = 0;
      this.dragging = false;
    }
    if (this.isConnected) this.render();
  }

  private get effectiveDisabled(): boolean {
    return this.disabled || this.formDisabled || this.inheritedDisabledState;
  }

  private displayError(): string {
    return this.error || this.internalError;
  }

  private requiredText(): string {
    return localizedText(this, {
      en: " (required)",
      fi: " (pakollinen)",
      sv: " (obligatorisk)",
    });
  }

  private requiredMessage(): string {
    return localizedText(this, {
      en: "Please select a file.",
      fi: "Valitse tiedosto.",
      sv: "Välj en fil.",
    });
  }

  private maxSizeError(): string {
    if (this.sizeErrorMessage) return this.sizeErrorMessage;
    const limit = this.maxSizeInBytes;
    const maxSize = limit ? (limit / (1024 * 1024)).toFixed(1) : "0.0";
    return localizedText(this, {
      en: `File is too large. Max ${maxSize} MB. File removed.`,
      fi: `Tiedosto on liian suuri. Enintään ${maxSize} Mt. Tiedosto poistettu.`,
      sv: `Filen är för stor. Max ${maxSize} MB. Filen togs bort.`,
    });
  }

  private message(id: string, text: string, error = false): HTMLElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message${error ? " errorMessage" : ""}`;
    message.textContent = text;
    if (error) message.setAttribute("role", "alert");
    return message;
  }

  private emitFileChange(detail: DtFileUploadChangeDetail): void {
    this.dispatchEvent(
      new CustomEvent<DtFileUploadChangeDetail>("file-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private requestPicker(source: "summary" | "button"): void {
    if (this.effectiveDisabled) return;
    const request = new CustomEvent("picker-request", {
      detail: { source },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(request)) return;
    this.hiddenInput?.click();
  }

  private hasFilePayload(
    event: Event & {
      dataTransfer?: DataTransfer | { types?: unknown } | null;
    },
  ): boolean {
    const types = event.dataTransfer?.types;
    if (Array.isArray(types)) return types.includes("Files");
    if (
      typeof types === "object" &&
      types !== null &&
      "contains" in types &&
      typeof (types as { contains?: unknown }).contains === "function"
    ) {
      return Boolean(
        (types as { contains(value: string): boolean }).contains("Files"),
      );
    }
    return false;
  }

  private syncForm(): void {
    const anchor = this.summaryControl ?? this.browseButton ?? undefined;
    const missing = this.required && !this.liveValue;
    const error = this.displayError();
    this.internals?.setFormValue(this.liveValue);
    this.internals?.setValidity(
      missing ? { valueMissing: true } : error ? { customError: true } : {},
      error || (missing ? this.requiredMessage() : ""),
      anchor,
    );
  }

  private focusSummaryControl(): void {
    queueMicrotask(() => this.summaryControl?.focus());
  }

  private setValue(
    file: File | null,
    source: DtFileUploadChangeSource,
    rejectedFile?: File,
  ): void {
    this.liveValue = file;
    this.render();
    this.emitFileChange({
      file,
      source,
      rejectedFile,
      error: rejectedFile ? this.displayError() : undefined,
    });
  }

  private clearSelection(source: DtFileUploadChangeSource): void {
    if (this.hiddenInput) this.hiddenInput.value = "";
    this.internalError = "";
    this.setValue(null, source);
    this.focusSummaryControl();
  }

  private acceptFile(file: File, source: DtFileUploadChangeSource): void {
    const limit = this.maxSizeInBytes;
    if (limit && file.size > limit) {
      if (this.hiddenInput) this.hiddenInput.value = "";
      this.internalError = this.maxSizeError();
      this.setValue(null, source, file);
      this.focusSummaryControl();
      return;
    }

    this.internalError = "";
    this.setValue(file, source);
  }

  private handleHiddenInputChange(): void {
    const file = this.hiddenInput?.files?.[0] ?? null;
    if (!file) {
      this.clearSelection("clear");
      return;
    }
    this.acceptFile(file, "picker");
  }

  private bindDropzone(dropzone: HTMLElement): void {
    dropzone.addEventListener("dragenter", (event) => {
      if (this.effectiveDisabled) return;
      if (!this.hasFilePayload(event)) return;
      event.preventDefault();
      this.dragDepth += 1;
      if (!this.dragging) {
        this.dragging = true;
        this.render();
      }
    });

    dropzone.addEventListener("dragover", (event) => {
      if (this.effectiveDisabled) return;
      if (!this.hasFilePayload(event)) return;
      event.preventDefault();
      if ("dataTransfer" in event && event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
      if (!this.dragging) {
        this.dragging = true;
        this.render();
      }
    });

    dropzone.addEventListener("dragleave", (event) => {
      if (!this.dragging) return;
      event.preventDefault();
      this.dragDepth = Math.max(0, this.dragDepth - 1);
      if (this.dragDepth === 0) {
        this.dragging = false;
        this.render();
      }
    });

    dropzone.addEventListener("drop", (event) => {
      if (this.effectiveDisabled) return;
      event.preventDefault();
      this.dragDepth = 0;
      this.dragging = false;
      const file =
        "dataTransfer" in event ? event.dataTransfer?.files?.[0] ?? null : null;
      if (!file) {
        this.render();
        return;
      }
      this.acceptFile(file, "drop");
      this.focusSummaryControl();
    });
  }

  private render(): void {
    const field = this.ownerDocument.createElement("div");
    field.className = `field${this.appearance === "default" ? " defaultAppearance" : ""}`;

    const controlId = this.id || "control";
    const labelId = `${controlId}-label`;
    const helperId = "helper";
    const errorId = "error";
    const error = this.displayError();
    const helper = this.helperText;
    const fileSummary = formatFileSummary(this.liveValue);
    const disabled = this.effectiveDisabled;
    const describedBy = [error ? errorId : "", helper ? helperId : ""]
      .filter(Boolean)
      .join(" ");

    const hiddenInput = this.ownerDocument.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.className = "nativeInput";
    hiddenInput.tabIndex = -1;
    hiddenInput.setAttribute("aria-hidden", "true");
    hiddenInput.disabled = disabled;
    if (this.accept) hiddenInput.accept = this.accept;
    hiddenInput.addEventListener("change", () => this.handleHiddenInputChange());
    this.hiddenInput = hiddenInput;
    field.append(hiddenInput);

    if (this.appearance === "editorial") {
      const label = this.ownerDocument.createElement("div");
      label.id = labelId;
      label.className = `editorialLabel${disabled ? " labelDisabled" : ""}`;
      label.append(this.label);
      if (this.required) {
        const marker = this.ownerDocument.createElement("span");
        marker.className = "required";
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = " *";
        label.append(marker);

        const srOnly = this.ownerDocument.createElement("span");
        srOnly.className = "srOnly";
        srOnly.textContent = this.requiredText();
        label.append(srOnly);
      }
      field.append(label);
    } else {
      const label = this.ownerDocument.createElement("label");
      label.id = labelId;
      label.htmlFor = controlId;
      label.className = disabled ? "labelDisabled" : "";
      label.append(this.label);
      if (this.required) {
        const marker = this.ownerDocument.createElement("span");
        marker.className = "required";
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = " *";
        label.append(marker);

        const srOnly = this.ownerDocument.createElement("span");
        srOnly.className = "srOnly";
        srOnly.textContent = this.requiredText();
        label.append(srOnly);
      }
      field.append(label);
    }

    const dropzone = this.ownerDocument.createElement("div");
    dropzone.className = `dropzone${this.dragging ? " dragging" : ""}`;
    this.bindDropzone(dropzone);

    if (this.appearance === "editorial") {
      const trigger = this.ownerDocument.createElement("button");
      trigger.id = controlId;
      trigger.type = "button";
      trigger.className = "editorialTrigger";
      trigger.disabled = disabled;
      trigger.setAttribute("aria-labelledby", labelId);
      if (describedBy) trigger.setAttribute("aria-describedby", describedBy);
      if (error) trigger.setAttribute("aria-invalid", "true");
      if (this.required) trigger.setAttribute("aria-required", "true");
      trigger.addEventListener("click", () => this.requestPicker("summary"));

      const text = this.ownerDocument.createElement("span");
      if (!fileSummary && this.placeholder) text.className = "editorialPlaceholder";
      text.textContent = fileSummary || this.placeholder;
      trigger.append(text);

      this.summaryControl = trigger;
      dropzone.append(trigger);
    } else {
      const summary = this.ownerDocument.createElement("input");
      summary.id = controlId;
      summary.type = "text";
      summary.className = "summaryField";
      summary.readOnly = true;
      summary.value = fileSummary;
      summary.placeholder = this.placeholder;
      summary.disabled = disabled;
      summary.required = this.required;
      if (describedBy) summary.setAttribute("aria-describedby", describedBy);
      if (error) summary.setAttribute("aria-invalid", "true");
      summary.addEventListener("click", () => this.requestPicker("summary"));
      summary.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this.requestPicker("summary");
      });

      this.summaryControl = summary;
      dropzone.append(summary);
    }

    const actions = this.ownerDocument.createElement("div");
    actions.className = "actions";

    const browse = this.ownerDocument.createElement("button");
    browse.type = "button";
    browse.className = "actionButton";
    browse.disabled = disabled;
    browse.textContent = this.uploadButtonLabel;
    browse.addEventListener("click", () => this.requestPicker("button"));
    this.browseButton = browse;
    actions.append(browse);

    if (this.liveValue && this.clearButtonLabel) {
      const clear = this.ownerDocument.createElement("button");
      clear.type = "button";
      clear.className = "clearButton";
      clear.disabled = disabled;
      clear.textContent = this.clearButtonLabel;
      clear.addEventListener("click", () => this.clearSelection("clear"));
      actions.append(clear);
    }

    dropzone.append(actions);
    field.append(dropzone);

    if (error) field.append(this.message(errorId, error, true));
    if (helper) field.append(this.message(helperId, helper));

    this.replaceShadow(styles, field);
    this.syncForm();
  }
}
