import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Button from "./Button";
import { within, userEvent } from "@storybook/testing-library";

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

const Template: StoryFn = (args: React.ComponentProps<typeof Button>) => (
  <Button {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  children: "Primary Button",
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
  children: "Secondary Button",
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
  children: "Tertiary Button",
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
  children: "Error Button",
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
  children: "Warning Button",
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
  children: "Success Button",
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
  children: "Info Button",
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
  icon: FaSearch, // Use JSX element for the icon
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
  icon: FaArrowLeft, // Use JSX element for the icon
  children: "Left Icon",
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
  endIcon: FaArrowRight, // Use JSX element for the end icon
  children: "Right Icon",
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
  children: "Disabled Button",
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
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="tertiary">Tertiary</Button>
    <Button variant="error">Error</Button>
    <Button variant="warning">Warning</Button>
    <Button variant="success">Success</Button>
    <Button variant="info">Info</Button>
  </div>
);
AllVariants.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  await canvas.findByRole("button", { name: /primary/i });
  await canvas.findByRole("button", { name: /secondary/i });
  await canvas.findByRole("button", { name: /tertiary/i });
  await canvas.findByRole("button", { name: /error/i });
  await canvas.findByRole("button", { name: /warning/i });
  await canvas.findByRole("button", { name: /success/i });
  await canvas.findByRole("button", { name: /info/i });
};

export const AllSizes = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Button size="s">Small</Button>
    <Button size="m">Medium</Button>
    <Button size="l">Large</Button>
  </div>
);
AllSizes.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByRole("button", { name: /small/i });
  await canvas.findByRole("button", { name: /medium/i });
  await canvas.findByRole("button", { name: /large/i });
};
