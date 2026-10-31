import contract from "./ServicesGrid.contract.json";
import React from "react";
import ServicesGrid from "@dt/ServicesGrid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { withTranslation } from "react-i18next";
import Icon from "@dt/Icon";

const meta: Meta<typeof ServicesGrid> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/ServicesGrid",
  component: ServicesGrid,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-services-grid",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ServicesGrid>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <ServicesGrid />,
};

// Auto-render (the Default closure ignores args).
export const Playground: Story = {
  tags: ["beta-matrix"],
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
