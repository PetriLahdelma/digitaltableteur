import contract from "./CodeBlockWindow.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import CodeBlockWindow from "@dt/CodeBlockWindow";
import { codeBlockFixtures } from "./codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "./CodeBlockFixtureRenderer";

const meta: Meta<typeof CodeBlockWindow> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite children slot (pre-rendered Shiki output) keeps a mapping
  // preset — defined on Playground below because the fixtures are built after
  // this meta literal.
  title: "Content/CodeBlockWindow",
  component: CodeBlockWindow,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1164-257",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["stable", "autodocs"],
};

export default meta;

const fixture = {
  tsx: renderCodeBlockFixtureNode(codeBlockFixtures.tsx.pre),
  bash: renderCodeBlockFixtureNode(codeBlockFixtures.bash.pre),
  json: renderCodeBlockFixtureNode(codeBlockFixtures.json.pre),
  longLine: renderCodeBlockFixtureNode(codeBlockFixtures.longLine.pre),
};

type Story = StoryObj<typeof CodeBlockWindow>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    title: "components/DemoButton.tsx",
    language: "tsx",
    showLineNumbers: true,
    children: fixture.tsx,
  },
};

export const NoTitle: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Header collapses gracefully without a title; the language label still orients the reader." } },
  },
  args: { language: "bash", children: fixture.bash },
};

export const JsonExample: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Filename in title plus the language label — readers orient by file, not grammar." } },
  },
  args: { title: "payload.json", language: "json", children: fixture.json },
};

export const LongLine: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Long lines scroll horizontally inside the frame; in article context the block also caps its height." } },
  },
  args: { title: "long-line.ts", language: "ts", children: fixture.longLine },
};

export const DarkPreview: Story = {
  render: (args) => (
    <div className="themeDark">
      <CodeBlockWindow {...args} />
    </div>
  ),
  args: {
    title: "theme-dark.tsx",
    language: "tsx",
    showLineNumbers: true,
    children: fixture.tsx,
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    children: {
      control: { type: "select" },
      options: ["tsx", "bash", "json", "longLine"],
      mapping: fixture,
      description:
        "Pre-rendered Shiki code content. Pick a fixture here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {
    ...Default.args,
    children: "tsx" as unknown as React.ReactNode,
  },
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
