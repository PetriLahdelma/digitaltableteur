import { type ReactNode } from "react";
export interface ComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
}
/** Map native `<option>` children to combobox options. */
export declare function optionsFromSelectChildren(children: ReactNode): ComboboxOption[];
export declare function splitPlaceholderOption(options: ComboboxOption[]): {
    placeholder?: string;
    options: ComboboxOption[];
};
//# sourceMappingURL=comboboxOptions.d.ts.map