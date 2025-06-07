import React from "react";
import { FaChevronDown } from "react-icons/fa";
import Label from "../Label/Label";
import styles from "./Select.module.css";

interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={styles["select-container"]}>
      {label && <Label htmlFor={label}>{label}</Label>}
      <div className={styles["select-wrapper"]}>
        <select
          className={styles.select}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {FaChevronDown({ className: styles["chevron-icon"] })}
      </div>
    </div>
  );
};

export default Select;
