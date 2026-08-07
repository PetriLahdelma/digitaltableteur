import React from "react";
export interface CheckboxGroupProps {
    /** Base id for the checkbox inputs */
    id?: string;
    /** Legend text for the group */
    label: string;
    /** Additional CSS classes on the group */
    className?: string;
    /** Checkbox options (label, value) */
    options: {
        label: string;
        value: string;
    }[];
    /** Shows the select-all master checkbox. @default true */
    showMasterCheckbox?: boolean;
    /** Label for the select-all master checkbox */
    masterLabel?: string;
    /** Initially selected option values (uncontrolled) */
    defaultSelected?: string[];
    onChange?: (selectedOptions: string[]) => void;
}
/** Checkbox group with optional master select-all control. */
declare const CheckboxGroup: React.FC<CheckboxGroupProps>;
export default CheckboxGroup;
//# sourceMappingURL=CheckboxGroup.d.ts.map