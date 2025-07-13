import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Button from "./Button";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: [
          "primary",
          "secondary",
          "tertiary",
          "error",
          "warning",
          "success",
          "info",
        ],
      },
    },
    disabled: { control: "boolean" },
    tooltip: { control: "text" },
    accessibleName: { control: "text" },
    accessibleDescription: { control: "text" },
  },
} as Meta;

const ButtonStoryLabel = ({ tKey }: { tKey: string }) => {
  const { t } = useTranslation();
  return <>{t(tKey)}</>;
};

const Template: StoryFn = (args: React.ComponentProps<typeof Button>) => (
  <Button {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  children: <ButtonStoryLabel tKey="buttonPrimary" />,
};
Primary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /primary button/i });
  await userEvent.click(button);
  // Focus test
  await userEvent.tab();
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  children: <ButtonStoryLabel tKey="buttonSecondary" />,
};
Secondary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /secondary button/i,
  });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  variant: "tertiary",
  children: <ButtonStoryLabel tKey="buttonTertiary" />,
};
Tertiary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /tertiary button/i,
  });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Error = Template.bind({});
Error.args = {
  variant: "error",
  children: <ButtonStoryLabel tKey="buttonError" />,
};
Error.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /error button/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Warning = Template.bind({});
Warning.args = {
  variant: "warning",
  children: <ButtonStoryLabel tKey="buttonWarning" />,
};
Warning.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /warning button/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Success = Template.bind({});
Success.args = {
  variant: "success",
  children: <ButtonStoryLabel tKey="buttonSuccess" />,
};
Success.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /success button/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Info = Template.bind({});
Info.args = {
  variant: "info",
  children: <ButtonStoryLabel tKey="buttonInfo" />,
};
Info.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /info button/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  variant: "primary",
  icon: FaSearch,
  tooltip: "Search",
};
IconOnly.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /search/i });
  await userEvent.hover(button);
  await userEvent.tab();
};

export const IconLeft = Template.bind({});
IconLeft.args = {
  variant: "primary",
  icon: FaArrowLeft,
  children: <ButtonStoryLabel tKey="buttonLeftIcon" />,
};
IconLeft.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /left icon/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const IconRight = Template.bind({});
IconRight.args = {
  variant: "primary",
  endIcon: FaArrowRight,
  children: <ButtonStoryLabel tKey="buttonRightIcon" />,
};
IconRight.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /right icon/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Disabled = Template.bind({});
Disabled.args = {
  variant: "primary",
  children: <ButtonStoryLabel tKey="buttonDisabled" />,
  disabled: true,
};
Disabled.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /disabled button/i,
  });
  await userEvent.tab();
};

export const AllVariants = () => (
  <div style={{ display: "flex", gap: "1rem" }}>
    <Button variant="primary">
      <ButtonStoryLabel tKey="buttonPrimary" />
    </Button>
    <Button variant="secondary">
      <ButtonStoryLabel tKey="buttonSecondary" />
    </Button>
    <Button variant="tertiary">
      <ButtonStoryLabel tKey="buttonTertiary" />
    </Button>
    <Button variant="error">
      <ButtonStoryLabel tKey="buttonError" />
    </Button>
    <Button variant="warning">
      <ButtonStoryLabel tKey="buttonWarning" />
    </Button>
    <Button variant="success">
      <ButtonStoryLabel tKey="buttonSuccess" />
    </Button>
    <Button variant="info">
      <ButtonStoryLabel tKey="buttonInfo" />
    </Button>
  </div>
);

export const AllSizes = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Button size="s">
      <ButtonStoryLabel tKey="buttonSmall" />
    </Button>
    <Button size="m">
      <ButtonStoryLabel tKey="buttonMedium" />
    </Button>
    <Button size="l">
      <ButtonStoryLabel tKey="buttonLarge" />
    </Button>
  </div>
);

export const ButtonVariantsComponent: React.FC = () => (
  <div style={{ display: "flex", gap: "1rem" }}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="tertiary">Tertiary</Button>
    <Button variant="error">Error</Button>
    <Button variant="warning">Warning</Button>
    <Button variant="success">Success</Button>
    <Button variant="info">Info</Button>
  </div>
);
