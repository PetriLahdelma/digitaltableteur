import React from "react";
import styles from "./SelectOption.module.css";

export interface SelectOptionProps {
  value: string;
  label: string;
  disabled?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({
  value,
  label,
  disabled = false,
}) => {
  return (
    <option value={value} disabled={disabled} className={styles.option}>
      {label}
    </option>
  );
};

export default SelectOption;
