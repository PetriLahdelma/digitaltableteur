import React from "react";
import { StoryFn, Meta } from "@storybook/react-webpack5";
import Avatar from "./Avatar";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";
import { within } from "@storybook/testing-library";

export default {
  title: "Components/Avatar",
  component: Avatar,
} as Meta<typeof Avatar>;

const Template: StoryFn<typeof Avatar> = (
  args: React.ComponentProps<typeof Avatar>,
) => <Avatar {...args} />;

export const WithImage = Template.bind({});
WithImage.args = {
  imageUrl: peteVaultBoy,
  name: undefined,
};

export const WithName = Template.bind({});
WithName.args = {
  name: "Petri Lahdelma",
};

WithImage.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByRole("img");
};

WithName.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  // Check for initials "PL" instead of full name
  await canvas.findByText("PL");
};
