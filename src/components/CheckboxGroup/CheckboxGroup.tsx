import React, { useEffect, useRef, useState, useCallback } from "react";
import Checkbox from "../Checkbox/Checkbox";
import GroupLabel from "../GroupLabel/GroupLabel";
import styles from "./CheckboxGroup.module.css";

export interface CheckboxGroupProps {
  label: string;
  clasassName?: string;
  options: { label: string; value: string }[];
  // eslint-disable-next-line no-unused-vars
  onChange?: (selectedOptions: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options = [],
  onChange,
}) => {
  const [checkedStates, setCheckedStates] = useState(options.map(() => false));

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const updateMasterCheckboxState = useCallback(() => {
    if (masterCheckboxRef.current) {
      const allChecked = checkedStates.every((state) => state);
      const noneChecked = checkedStates.every((state) => !state);
      masterCheckboxRef.current.indeterminate = !allChecked && !noneChecked;
      masterCheckboxRef.current.checked = allChecked;
    }
  }, [checkedStates]);

  useEffect(() => {
    updateMasterCheckboxState();
  }, [updateMasterCheckboxState]);

  const handleMasterCheckboxChange = (checked: boolean) => {
    const newCheckedStates = options.map(() => checked);
    setCheckedStates(newCheckedStates);

    if (onChange) {
      const selectedOptions = newCheckedStates
        .map((state, index) => (state ? options[index].value : ""))
        .filter(Boolean);
      onChange(selectedOptions);
    }
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedStates = [...checkedStates];
    newCheckedStates[index] = checked;
    setCheckedStates(newCheckedStates);

    if (onChange) {
      const selectedOptions = newCheckedStates
        .map((state, index) => (state ? options[index].value : ""))
        .filter(Boolean);
      onChange(selectedOptions);
    }

    // Update master checkbox state
    if (masterCheckboxRef.current) {
      const allChecked = newCheckedStates.every((state) => state);
      const noneChecked = newCheckedStates.every((state) => !state);
      masterCheckboxRef.current.indeterminate = !allChecked && !noneChecked;
      masterCheckboxRef.current.checked = allChecked;
    }
  };

  return (
    <div className={styles["checkbox-group"]}>
      <GroupLabel htmlFor="master-checkbox">{label}</GroupLabel>
      <Checkbox
        ref={masterCheckboxRef}
        label="All"
        checked={checkedStates.every((state) => state)}
        onChange={(checked) => handleMasterCheckboxChange(checked)}
      />
      <div className={styles.options}>
        {options.map((option, index) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={checkedStates[index]}
            onChange={(checked) => handleCheckboxChange(index, checked)}
          />
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
