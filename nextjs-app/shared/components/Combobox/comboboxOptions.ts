import { Children, isValidElement, type ReactNode } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

function extractOptionLabel(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractOptionLabel).join("");
  }
  return "";
}

/**
 * Map option children to combobox options: native `<option>` elements and
 * option components such as Select's `SelectOption` (a `value` prop, and a
 * `label` prop or text children).
 */
export function optionsFromSelectChildren(children: ReactNode): ComboboxOption[] {
  const options: ComboboxOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const props = child.props as {
      value?: string | number;
      label?: string;
      disabled?: boolean;
      children?: ReactNode;
    };
    if (child.type !== "option" && props.value === undefined) return;

    options.push({
      value: String(props.value ?? ""),
      label: extractOptionLabel(props.children) || props.label || "",
      disabled: props.disabled,
    });
  });

  return options;
}

export function splitPlaceholderOption(options: ComboboxOption[]): {
  placeholder?: string;
  options: ComboboxOption[];
} {
  const placeholderOption = options.find((option) => option.value === "");
  if (!placeholderOption) {
    return { options };
  }

  return {
    placeholder: placeholderOption.label,
    options: options.filter((option) => option.value !== ""),
  };
}
