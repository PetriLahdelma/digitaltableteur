import React from "react";
import SelectOption from "./SelectOption";
import Select from "@dt/Select";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
export default {
  title: "Forms/SelectOption",
  component: SelectOption,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=383-23",
    },
  },
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
Default.tags = ["beta-matrix"];

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
