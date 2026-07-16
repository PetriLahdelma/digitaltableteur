import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import {
  DigitaltableteurElement,
  attachFormInternals,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText, resolveElementLocale } from "./localization";

export type DtPhoneInputCountry = CountryCode;
export type DtPhoneInputValue = string | undefined;

const countries = getCountries();
const countrySet = new Set<string>(countries);

const styles = `
  :host { display: block; inline-size: 100%; font-family: var(--font-text, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .field { display: grid; gap: var(--space-internal-8, 0.5rem); }
  label { color: var(--color-primary, currentcolor); font: inherit; }
  label.disabled { color: var(--color-muted-light, GrayText); cursor: not-allowed; }
  .required { color: var(--color-error, #b00020); }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .control { display: grid; grid-template-columns: minmax(5.75rem, auto) minmax(0, 1fr); overflow: hidden; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background: var(--color-white, Canvas); }
  .control:focus-within { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  .control.error { border-color: var(--color-error, #b00020); background: var(--color-error-bg, Canvas); }
  select, input { box-sizing: border-box; min-block-size: 2.75rem; border: 0; background: transparent; color: var(--primary-text-color, CanvasText); font: inherit; }
  select { inline-size: 100%; padding: 0.625rem 0.5rem; border-inline-end: 1px solid var(--color-border, #767676); }
  input { inline-size: 100%; min-inline-size: 0; padding: 0.625rem 0.75rem; }
  select:focus-visible, input:focus-visible { outline: 0; }
  select:disabled, input:disabled { color: var(--color-disabled-placeholder, GrayText); cursor: not-allowed; }
  .control.disabled { border-color: var(--color-primary-disabled, GrayText); background: var(--color-disabled-bg-light, #eee); }
  .message { margin: 0; font-size: 0.875rem; color: var(--color-primary, currentcolor); }
  .errorMessage { color: var(--color-error-text, var(--color-error, #b00020)); }
  @media (forced-colors: active) { .control { border-color: CanvasText; } .control.error { border-color: Mark; } select { border-inline-end-color: CanvasText; } }
`;

/** Native international telephone field with E.164 form and event values. */
export class DtPhoneInputElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "value",
    "default-value",
    "error",
    "helper-text",
    "placeholder",
    "disabled",
    "required",
    "default-country",
    "name",
    "country-label",
    "lang",
  ];

  private input: HTMLInputElement | null = null;
  private countryControl: HTMLSelectElement | null = null;
  private liveValue: DtPhoneInputValue;
  private liveCountry: DtPhoneInputCountry = "FI";
  private initialized = false;
  private valueDirty = false;
  private formDisabled = false;
  private readonly internals = attachFormInternals(this);

  connectedCallback(): void {
    if (!this.initialized) {
      this.liveValue = this.initialValue();
      this.liveCountry =
        this.countryForValue(this.liveValue) ?? this.defaultCountry;
      this.initialized = true;
    }
    this.render();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "value") {
      this.liveValue =
        value === null ? this.defaultValue || undefined : value || undefined;
      this.valueDirty = false;
      this.liveCountry =
        this.countryForValue(this.liveValue) ?? this.defaultCountry;
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = value || undefined;
      this.liveCountry =
        this.countryForValue(this.liveValue) ?? this.defaultCountry;
    } else if (
      name === "default-country" &&
      !this.countryForValue(this.liveValue)
    ) {
      this.liveCountry = this.defaultCountry;
    }
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.syncDisabled();
  }

  formResetCallback(): void {
    this.liveValue = this.defaultValue || undefined;
    this.liveCountry =
      this.countryForValue(this.liveValue) ?? this.defaultCountry;
    this.valueDirty = false;
    this.render();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.liveValue = typeof state === "string" && state ? state : undefined;
    this.liveCountry =
      this.countryForValue(this.liveValue) ?? this.defaultCountry;
    this.valueDirty = true;
    this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get value(): DtPhoneInputValue {
    return this.liveValue;
  }
  set value(value: DtPhoneInputValue) {
    const current = this.getAttribute("value");
    this.liveValue = value || undefined;
    this.valueDirty = false;
    const reflectedValue = value === undefined ? null : value;
    reflectAttribute(this, "value", reflectedValue);
    if (this.isConnected && current === reflectedValue) this.render();
  }

  get defaultValue(): string {
    return stringAttribute(this, "default-value");
  }
  set defaultValue(value: string) {
    reflectAttribute(this, "default-value", value || null);
  }

  get defaultCountry(): DtPhoneInputCountry {
    const value = stringAttribute(this, "default-country", "FI").toUpperCase();
    return (countrySet.has(value) ? value : "FI") as DtPhoneInputCountry;
  }
  set defaultCountry(value: DtPhoneInputCountry) {
    reflectAttribute(this, "default-country", value);
  }

  get country(): DtPhoneInputCountry {
    return this.liveCountry;
  }
  set country(value: DtPhoneInputCountry) {
    if (!countrySet.has(value)) return;
    this.liveCountry = value;
    if (this.isConnected) this.render();
  }

  get error(): string {
    return stringAttribute(this, "error");
  }
  set error(value: string) {
    reflectAttribute(this, "error", value || null);
  }

  get helperText(): string {
    return stringAttribute(this, "helper-text");
  }
  set helperText(value: string) {
    reflectAttribute(this, "helper-text", value || null);
  }

  get placeholder(): string {
    return stringAttribute(this, "placeholder");
  }
  set placeholder(value: string) {
    reflectAttribute(this, "placeholder", value || null);
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

  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  private initialValue(): DtPhoneInputValue {
    const value = this.hasAttribute("value")
      ? stringAttribute(this, "value")
      : stringAttribute(this, "default-value");
    return value || undefined;
  }

  private countryForValue(
    value: DtPhoneInputValue,
  ): DtPhoneInputCountry | null {
    if (!value) return null;
    return parsePhoneNumberFromString(value)?.country ?? null;
  }

  private countryLabel(): string {
    const override = this.getAttribute("country-label");
    if (override !== null) return override;
    return localizedText(this, {
      en: "Country calling code",
      fi: "Maan suuntanumero",
      sv: "Landsnummer",
    });
  }

  private countryName(country: DtPhoneInputCountry): string {
    try {
      const names = new Intl.DisplayNames([resolveElementLocale(this)], {
        type: "region",
      });
      return names.of(country) ?? country;
    } catch {
      return country;
    }
  }

  private displayValue(): string {
    if (this.liveValue) return new AsYouType().input(this.liveValue);
    return `+${getCountryCallingCode(this.liveCountry)}`;
  }

  private normalizeValue(rawValue: string): DtPhoneInputValue {
    const raw = rawValue.trim();
    if (!raw) return undefined;
    const digits = raw.replace(/\D/g, "");
    if (!digits) return undefined;
    const callingCode = getCountryCallingCode(this.liveCountry);
    if (raw.startsWith("+") && digits === callingCode) return undefined;
    const formatter = new AsYouType(
      raw.startsWith("+") ? undefined : this.liveCountry,
    );
    formatter.input(raw);
    return formatter.getNumber()?.number;
  }

  private commit(value: DtPhoneInputValue): void {
    this.liveValue = value;
    this.valueDirty = true;
    const detectedCountry = this.countryForValue(value);
    if (detectedCountry) this.liveCountry = detectedCountry;
    this.syncForm();
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private syncDisabled(): void {
    const disabled = this.disabled || this.formDisabled;
    if (this.input) this.input.disabled = disabled;
    if (this.countryControl) this.countryControl.disabled = disabled;
  }

  private syncForm(): void {
    if (!this.input) return;
    const error = this.error;
    const missing = this.required && !this.liveValue;
    this.internals?.setFormValue(
      this.liveValue ?? null,
      this.liveValue ?? null,
    );
    this.internals?.setValidity(
      missing ? { valueMissing: true } : error ? { customError: true } : {},
      error || (missing ? this.requiredMessage() : ""),
      this.input,
    );
  }

  private requiredMessage(): string {
    return localizedText(this, {
      en: "Enter a phone number.",
      fi: "Anna puhelinnumero.",
      sv: "Ange ett telefonnummer.",
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

  private render(): void {
    const hadInputFocus = this.shadowRoot?.activeElement === this.input;
    const hadCountryFocus =
      this.shadowRoot?.activeElement === this.countryControl;
    const field = this.ownerDocument.createElement("div");
    field.className = "field";
    const controlId = this.id || "control";
    const error = this.error;
    const helper = this.helperText;
    const disabled = this.disabled || this.formDisabled;

    const label = this.ownerDocument.createElement("label");
    label.htmlFor = controlId;
    label.className = disabled ? "disabled" : "";
    label.append(this.label);
    if (this.required) {
      const marker = this.ownerDocument.createElement("span");
      marker.className = "required";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = " *";
      label.append(marker);
    }
    field.append(label);

    const control = this.ownerDocument.createElement("div");
    control.className = `control${error ? " error" : ""}${disabled ? " disabled" : ""}`;

    const country = this.ownerDocument.createElement("select");
    country.setAttribute("aria-label", this.countryLabel());
    country.disabled = disabled;
    for (const code of countries) {
      const option = this.ownerDocument.createElement("option");
      option.value = code;
      option.textContent = `${code} +${getCountryCallingCode(code)} ${this.countryName(code)}`;
      option.selected = code === this.liveCountry;
      country.append(option);
    }
    country.addEventListener("change", () => {
      this.liveCountry = country.value as DtPhoneInputCountry;
      const currentNumber = this.liveValue
        ? parsePhoneNumberFromString(this.liveValue)
        : undefined;
      if (currentNumber?.nationalNumber) {
        const formatter = new AsYouType(this.liveCountry);
        formatter.input(currentNumber.nationalNumber);
        const nextValue = formatter.getNumber()?.number;
        this.commit(nextValue);
        if (this.input) {
          this.input.value = nextValue
            ? new AsYouType().input(nextValue)
            : `+${getCountryCallingCode(this.liveCountry)}`;
        }
      } else if (this.input) {
        this.input.value = `+${getCountryCallingCode(this.liveCountry)}`;
      }
      this.dispatchEvent(
        new CustomEvent("country-change", {
          detail: { country: this.liveCountry },
          bubbles: true,
          composed: true,
        }),
      );
    });

    const input = this.ownerDocument.createElement("input");
    input.id = controlId;
    input.type = "tel";
    input.inputMode = "tel";
    input.autocomplete = "tel";
    input.name = this.name;
    input.value = this.displayValue();
    input.placeholder = this.placeholder;
    input.disabled = disabled;
    input.required = this.required;
    if (error) input.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    input.addEventListener("input", () => {
      const raw = input.value;
      const nextValue = this.normalizeValue(raw);
      // Keep the user's in-progress entry visible (formatted as-you-type). Blanking
      // when normalizeValue is not yet resolvable made typing a "+<code>" prefix by
      // hand impossible; the E.164 value still commits once it resolves.
      const formatter = new AsYouType(
        raw.startsWith("+") ? undefined : this.liveCountry,
      );
      input.value = formatter.input(raw);
      this.commit(nextValue);
      country.value = this.liveCountry;
    });
    input.addEventListener("change", () => {
      this.dispatchEvent(
        new Event("change", { bubbles: true, composed: true }),
      );
    });

    this.countryControl = country;
    this.input = input;
    control.append(country, input);
    field.append(control);
    if (error) field.append(this.message("error", error, true));
    if (helper) field.append(this.message("helper", helper));
    this.replaceShadow(styles, field);
    this.syncForm();
    if (hadInputFocus) input.focus();
    if (hadCountryFocus) country.focus();
  }
}
