import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Checkbox from "@dt/Checkbox/Checkbox";
import GroupLabel from "@dt/GroupLabel/GroupLabel";
import styles from "./CheckboxGroup.module.css";

export interface CheckboxGroupProps {
  /** Base id for the checkbox inputs */
  id?: string;
  /** Legend text for the group */
  label: string;
  /** Additional CSS classes on the group */
  className?: string;
  /** Checkbox options (label, value) */
  options: { label: string; value: string }[];
  /** Shows the select-all master checkbox. @default true */
  showMasterCheckbox?: boolean;
  /** Label for the select-all master checkbox */
  masterLabel?: string;
  /** Initially selected option values (uncontrolled) */
  defaultSelected?: string[];
  // eslint-disable-next-line no-unused-vars
  onChange?: (selectedOptions: string[]) => void;
}

/** Checkbox group with optional master select-all control. */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id = "",
  label,
  className,
  options = [],
  showMasterCheckbox = true,
  defaultSelected,
  masterLabel,
  onChange,
}) => {
  const { t } = useTranslation();
  const [checkedStates, setCheckedStates] = useState(options.map(() => false));
  // Track previous option values to avoid resetting when only labels change
  const prevOptionValuesRef = useRef<string[] | null>(null);
  const prevDefaultRef = useRef<string[] | undefined>(undefined);

  // Reset states only when the option values or defaultSelected change
  useEffect(() => {
    const currentOptionValues = options.map((opt) => opt.value);

    const valuesChanged =
      !prevOptionValuesRef.current ||
      prevOptionValuesRef.current.length !== currentOptionValues.length ||
      prevOptionValuesRef.current.some((v, i) => v !== currentOptionValues[i]);

    const defaultChanged =
      (prevDefaultRef.current || []).join(",") !==
      (defaultSelected || []).join(",");

    if (valuesChanged || defaultChanged) {
      setCheckedStates(
        options.map((opt) =>
          defaultSelected ? defaultSelected.includes(opt.value) : false,
        ),
      );
    }

    prevOptionValuesRef.current = currentOptionValues;
    prevDefaultRef.current = defaultSelected;
  }, [options, defaultSelected]);
  // Calculate master checkbox state for props
  const allChecked = checkedStates.every((state) => state);
  const noneChecked = checkedStates.every((state) => !state);
  const someChecked = !allChecked && !noneChecked;
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
  };

  return (
    <div className={`${styles["checkboxGroup"]} ${className || ""}`}>
      <GroupLabel
        htmlFor={
          showMasterCheckbox ? `masterCheckbox-${id}` : `checkboxgroup-${id}`
        }
      >
        {label}
      </GroupLabel>
      {showMasterCheckbox && (
        <Checkbox
          label={(() => {
            const translated = t("contactAll");
            // If i18n isn't initialized in tests, t may return the key itself.
            // In that case fall back to the literal "All" to keep tests stable.
            if (masterLabel) return masterLabel;
            if (!translated || translated === "contactAll") return "All";
            return translated;
          })()}
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(checked: boolean) =>
            handleMasterCheckboxChange(checked)
          }
          id={`masterCheckbox-${id}`}
        />
      )}
      <div className={styles.options}>
        {options.map((option, index) => {
          const optionId = `${id || "checkboxgroup"}-option-${option.value || index}`;
          return (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={checkedStates[index]}
              onCheckedChange={(checked: boolean) =>
                handleCheckboxChange(index, checked)
              }
              id={optionId}
            />
          );
        })}
      </div>
    </div>
  );
};

CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;
