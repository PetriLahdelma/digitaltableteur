import {
  DigitaltableteurElement,
  attachFormInternals,
  reflectAttribute,
  stringAttribute,
} from "./base";
import type { DtCheckboxElement } from "./checkbox";

export interface DtCheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

const styles = `
  :host { display: block; inline-size: fit-content; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  fieldset { display: flex; margin: 1rem 0; padding: 0; flex-direction: column; gap: 1rem; border: 0; }
  legend { padding: 0; color: var(--color-title, currentcolor); font-family: var(--font-text, var(--primary-body-font)); font-weight: 600; }
  .options { display: flex; margin-inline-start: 1.5rem; flex-direction: column; gap: 0.5rem; }
`;

export class DtCheckboxGroupElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "options",
    "show-master-checkbox",
    "master-label",
    "default-selected",
    "name",
  ];

  private readonly internals = attachFormInternals(this);
  private readonly intrinsicDisabled = new WeakMap<
    DtCheckboxElement,
    boolean
  >();
  private assignedOptions: DtCheckboxOption[] | null = null;
  private selectedValues: string[] = [];
  private selectionInitialized = false;
  private formDisabled = false;

  connectedCallback(): void {
    if (!this.selectionInitialized) {
      this.selectedValues = this.filterSelected(this.defaultSelected);
      this.selectionInitialized = true;
    }
    this.addEventListener("checked-change", this.handleCheckedChange);
    this.observeLightDom(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.removeEventListener("checked-change", this.handleCheckedChange);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "options") this.assignedOptions = null;
    if (name === "default-selected") {
      this.selectedValues = this.filterSelected(this.defaultSelected);
      this.selectionInitialized = true;
    } else if (name === "options") {
      this.selectedValues = this.filterSelected(this.selectedValues);
    }
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    for (const control of this.optionControls) {
      if (!this.intrinsicDisabled.has(control)) {
        this.intrinsicDisabled.set(control, control.disabled);
      }
      control.disabled =
        disabled || this.intrinsicDisabled.get(control) === true;
    }
    const master = this.masterControl;
    if (master) master.disabled = disabled;
  }

  formResetCallback(): void {
    this.selectedValues = this.filterSelected(this.defaultSelected);
    this.selectionInitialized = true;
    this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get options(): DtCheckboxOption[] {
    return this.assignedOptions ?? this.parseOptions();
  }
  set options(value: DtCheckboxOption[]) {
    this.assignedOptions = value.map((option) => ({ ...option }));
    if (this.isConnected) this.render();
  }
  get showMasterCheckbox(): boolean {
    return this.getAttribute("show-master-checkbox") !== "false";
  }
  set showMasterCheckbox(value: boolean) {
    reflectAttribute(this, "show-master-checkbox", value ? null : "false");
  }
  get masterLabel(): string {
    return stringAttribute(this, "master-label", "All");
  }
  set masterLabel(value: string) {
    reflectAttribute(this, "master-label", value || null);
  }
  get defaultSelected(): string[] {
    return this.parseStringArray(this.getAttribute("default-selected"));
  }
  set defaultSelected(value: string[]) {
    reflectAttribute(this, "default-selected", JSON.stringify(value));
  }
  get selected(): string[] {
    return [...this.selectedValues];
  }
  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  private parseOptions(): DtCheckboxOption[] {
    const source = this.getAttribute("options");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const option = item as Record<string, unknown>;
        return typeof option.value === "string" &&
          typeof option.label === "string"
          ? [
              {
                value: option.value,
                label: option.label,
                disabled: option.disabled === true,
              },
            ]
          : [];
      });
    } catch {
      return [];
    }
  }

  private parseStringArray(source: string | null): string[] {
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return source
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  private get slottedCheckboxes(): DtCheckboxElement[] {
    return [...this.children].filter(
      (child): child is DtCheckboxElement =>
        child.tagName.toLowerCase() === "dt-checkbox",
    );
  }

  private get optionControls(): DtCheckboxElement[] {
    const slotted = this.slottedCheckboxes;
    return slotted.length > 0
      ? slotted
      : [
          ...(this.shadowRoot?.querySelectorAll<DtCheckboxElement>(
            ".options > dt-checkbox",
          ) ?? []),
        ];
  }

  private get masterControl(): DtCheckboxElement | null {
    return (
      this.shadowRoot?.querySelector<DtCheckboxElement>(
        "dt-checkbox[data-master]",
      ) ?? null
    );
  }

  private availableValues(): string[] {
    const slotted = this.slottedCheckboxes;
    return slotted.length > 0
      ? slotted.map((item) => item.value)
      : this.options.map((item) => item.value);
  }

  private filterSelected(values: string[]): string[] {
    const available = new Set(this.availableValues());
    return [...new Set(values.filter((value) => available.has(value)))];
  }

  private readonly handleCheckedChange = (event: Event): void => {
    const target = event
      .composedPath()
      .find(
        (node) =>
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === "dt-checkbox",
      );
    if (!(target instanceof HTMLElement)) return;
    const checkbox = target as DtCheckboxElement;
    if (checkbox.hasAttribute("data-master")) {
      this.setAll(checkbox.checked);
      return;
    }
    this.commitFromControls();
  };

  private setAll(checked: boolean): void {
    for (const control of this.optionControls) {
      if (!control.disabled) control.checked = checked;
    }
    this.commitFromControls();
  }

  private commitFromControls(): void {
    this.selectedValues = this.optionControls
      .filter((control) => control.checked)
      .map((control) => control.value);
    this.syncForm();
    this.refreshMaster();
    this.dispatchEvent(
      new CustomEvent("selected-change", {
        detail: { selected: [...this.selectedValues] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private syncForm(): void {
    const submittedValues = this.optionControls
      .filter((control) => control.checked && !control.disabled)
      .map((control) => control.value);

    if (!this.name || submittedValues.length === 0) {
      this.internals?.setFormValue(null);
      return;
    }
    const data = new FormData();
    for (const value of submittedValues) data.append(this.name, value);
    this.internals?.setFormValue(data);
  }

  private refreshMaster(): void {
    const master = this.masterControl;
    if (!master) return;
    const enabled = this.optionControls.filter((control) => !control.disabled);
    const selected = enabled.filter((control) => control.checked).length;
    master.checked = enabled.length > 0 && selected === enabled.length;
    master.indeterminate = selected > 0 && selected < enabled.length;
  }

  private render(): void {
    const fieldset = this.ownerDocument.createElement("fieldset");
    fieldset.disabled = this.formDisabled;
    const legend = this.ownerDocument.createElement("legend");
    legend.textContent = this.label;
    fieldset.append(legend);

    if (this.showMasterCheckbox) {
      const master = this.ownerDocument.createElement(
        "dt-checkbox",
      ) as DtCheckboxElement;
      master.setAttribute("data-master", "");
      master.label = this.masterLabel;
      master.disabled = this.formDisabled;
      fieldset.append(master);
    }

    const container = this.ownerDocument.createElement("div");
    container.className = "options";
    if (this.slottedCheckboxes.length > 0) {
      container.append(this.ownerDocument.createElement("slot"));
    } else {
      for (const option of this.options) {
        const checkbox = this.ownerDocument.createElement(
          "dt-checkbox",
        ) as DtCheckboxElement;
        checkbox.label = option.label;
        checkbox.value = option.value;
        checkbox.disabled = this.formDisabled || option.disabled === true;
        this.intrinsicDisabled.set(checkbox, option.disabled === true);
        container.append(checkbox);
      }
    }
    fieldset.append(container);
    this.replaceShadow(styles, fieldset);

    this.selectedValues = this.filterSelected(this.selectedValues);
    for (const control of this.optionControls) {
      if (!this.intrinsicDisabled.has(control)) {
        this.intrinsicDisabled.set(control, control.disabled);
      }
      control.name = "";
      control.checked = this.selectedValues.includes(control.value);
      control.disabled =
        this.formDisabled || this.intrinsicDisabled.get(control) === true;
    }
    this.syncForm();
    this.refreshMaster();
  }
}
