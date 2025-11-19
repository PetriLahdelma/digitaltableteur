import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Switch, { type SwitchProps } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    checked: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    labelPlacement: {
      control: { type: "select" },
      options: ["right", "left", "top"],
    },
  },
  args: {
    checked: false,
    loading: false,
    disabled: false,
    label: "Enable notifications",
    labelPlacement: "right",
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

const ControlledTemplate = (args: SwitchProps) => {
  const [checked, setChecked] = React.useState<boolean>(args.checked ?? false);

  React.useEffect(() => {
    setChecked(args.checked ?? false);
  }, [args.checked]);

  return (
    <Switch
      {...args}
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        args.onCheckedChange?.(next);
      }}
    />
  );
};

export const Default: Story = {
  name: "Default",
  render: (args) => <ControlledTemplate {...args} />,
};

export const Loading: Story = {
  name: "Loading",
  args: {
    loading: true,
    checked: true,
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const LabelOnTop: Story = {
  name: "Label on Top",
  args: {
    labelPlacement: "top",
    label: "Top aligned label",
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const LabelOnLeft: Story = {
  name: "Label on Left (Full Width)",
  args: {
    labelPlacement: "left",
    label: "Make this project public",
  },
  render: (args) => <ControlledTemplate {...args} />,
};
