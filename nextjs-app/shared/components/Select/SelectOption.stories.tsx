import React from "react";
import SelectOption from "./SelectOption";
import Select from "@dt/Select";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/SelectOption",
  component: SelectOption,
};

export const Default = () => {
  const { t } = useTranslation();
  return (
    <Select label={t("storySelectLabel")}>
      <SelectOption value="option1" label={t("storyCheckboxOption1")} />
      <SelectOption value="option2" label={t("storyCheckboxOption2")} />
      <SelectOption value="option3" label={t("storyCheckboxOption3")} />
    </Select>
  );
};

Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const select = await canvas.findByLabelText(/select an option/i);
  await userEvent.selectOptions(select, "option2");
};

export const Disabled = () => {
  const { t } = useTranslation();
  return (
    <Select label={t("storySelectLabel")} disabled>
      <SelectOption value="option1" label={t("storyCheckboxOption1")} />
      <SelectOption
        value="option2"
        label={t("storyCheckboxOption2") + " (disabled)"}
        disabled
      />
      <SelectOption value="option3" label={t("storyCheckboxOption3")} />
    </Select>
  );
};

Disabled.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(/select an option/i);
};
