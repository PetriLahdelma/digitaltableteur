import React from "react";
import SelectOption from "./SelectOption";
import Select from "@dt/Select";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import contract from "./SelectOption.contract.json";
export default {
  title: "Forms/SelectOption",
  component: SelectOption,
  tags: ["autodocs", "stable"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=383-23",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
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

export const Playground = Default.bind({});
Playground.parameters = { a11y: { disable: true, test: "off" } };
Playground.tags = ["beta-matrix"];

export const Example = Default.bind({});
Example.tags = ["example", "beta-matrix"];

export const ForcedColors = Default.bind({});
ForcedColors.parameters = { a11y: { disable: true, test: "off" } };
ForcedColors.globals = { forcedColors: "active" };
ForcedColors.tags = ["beta-matrix"];
