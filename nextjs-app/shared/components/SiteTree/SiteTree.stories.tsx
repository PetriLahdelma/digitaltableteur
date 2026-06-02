import contract from "./SiteTree.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";

import SiteTree from "@dt/SiteTree";
import { sampleSiteTree } from "./siteTreeSample";

const meta: Meta<typeof SiteTree> = {
  title: "Molecules/SiteTree",
  component: SiteTree,
  tags: ["beta", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    nodes: {
      control: "object",
      description: "Hierarchical site map nodes",
    },
    "aria-label": {
      control: "text",
      description: "Accessible name for the navigation landmark",
      table: { defaultValue: { summary: "Sitemap" } },
    },
    defaultExpandAll: {
      control: "boolean",
      description: "Expand every branch on first render",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SiteTree>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    nodes: sampleSiteTree,
    defaultExpandAll: true,
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    nodes: sampleSiteTree,
  },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  args: {
    nodes: sampleSiteTree,
    defaultExpandAll: true,
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: {
    nodes: sampleSiteTree,
    defaultExpandAll: true,
  },
};
