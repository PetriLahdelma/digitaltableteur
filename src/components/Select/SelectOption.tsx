import React from "react";
import styles from "./SelectOption.module.css";

export interface SelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  label: string;
  disabled?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({
  value,
  label,
  disabled = false,
  ...rest
}) => {
  return (
    <option
      value={value}
      disabled={disabled}
      className={styles.option}
      {...rest}
    >
      {label}
    </option>
  );
};

export default SelectOption;
