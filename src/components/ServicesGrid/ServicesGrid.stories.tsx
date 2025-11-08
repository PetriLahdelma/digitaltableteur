import React from "react";
import ServicesGrid from "./ServicesGrid";
import type { Meta, StoryObj } from "@storybook/react";
import { withTranslation } from "react-i18next";

const meta: Meta<typeof ServicesGrid> = {
  title: "Components/AI/Chat/Custom Components/ServicesGrid",
  component: ServicesGrid,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ServicesGrid>;

export const Default: Story = {
  render: () => <ServicesGrid />,
};
