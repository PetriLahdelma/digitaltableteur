import contract from "./SiteTree.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";

import SiteTree from "@dt/SiteTree";
import { sampleSiteTree } from "./siteTreeSample";

const meta: Meta<typeof SiteTree> = {
  title: "Site/SiteTree",
  component: SiteTree,
  tags: ["stable", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
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
  argTypes: {
    nodes: {
      control: { type: "select" },
      options: ["site", "firstBranch"],
      mapping: {
        site: sampleSiteTree,
        firstBranch: sampleSiteTree.slice(0, 1),
      },
      description:
        "Tree nodes (label, href, children). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "SiteTreeNode[]" } },
    },
  },
  args: {
    nodes: "site" as never,
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
