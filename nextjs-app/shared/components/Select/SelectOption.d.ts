import React from "react";
export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
    value: string;
    label: string;
    disabled?: boolean;
    children?: React.ReactNode;
}
declare const SelectOption: React.FC<SelectOptionProps>;
export default SelectOption;
//# sourceMappingURL=SelectOption.d.ts.map