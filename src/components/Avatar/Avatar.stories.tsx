import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import Avatar from "./Avatar";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";

export default {
  title: "Components/Avatar",
  component: Avatar,
} as Meta<typeof Avatar>;

const Template: StoryFn<typeof Avatar> = (args) => <Avatar {...args} />;

export const WithImage = Template.bind({});
WithImage.args = {
  imageUrl: peteVaultBoy,
  name: undefined,
};

export const WithName = Template.bind({});
WithName.args = {
  name: "Petri Lahdelma",
};
