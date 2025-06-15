import React from "react";
import SelectOption from "./SelectOption";
import Select from "./Select";

export default {
  title: "Components/SelectOption",
  component: SelectOption,
};

export const Default = () => (
  <Select label="Select an option">
    <SelectOption value="option1" label="Option 1" />
    <SelectOption value="option2" label="Option 2" />
    <SelectOption value="option3" label="Option 3" />
  </Select>
);

export const Disabled = () => (
  <Select label="Select an option" disabled>
    <SelectOption value="option1" label="Option 1" />
    <SelectOption value="option2" label="Option 2 (disabled)" disabled />
    <SelectOption value="option3" label="Option 3" />
  </Select>
);
