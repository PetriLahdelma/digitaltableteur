import contract from "./CodeBlockWindow.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import CodeBlockWindow from "@dt/CodeBlockWindow";
import { codeBlockFixtures } from "./codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "./CodeBlockFixtureRenderer";

const meta: Meta<typeof CodeBlockWindow> = {
  argTypes: {
    context: {
      control: "select",
      options: ["default", "article"],
      description: "Layout context for article vs default sizing",
      table: { defaultValue: { summary: "default" } },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      caption: { control: "text", description: "Optional caption rendered below the code", table: { category: "Content" } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Optional className passthrough", table: { category: "Advanced" } },
      id: { table: { disable: true } },
      language: { control: "text", description: "Language label shown in the header", table: { category: "Content" } },
      ref: { table: { disable: true } },
      showLineNumbers: { control: "boolean", description: "Force line numbers on/off (defaults to presence in Shiki output)", table: { category: "Content" } },
      style: { table: { disable: true } },
      title: { control: "text", description: "Optional title or filename shown in the header", table: { category: "Content" } }
},
  title: "Content/CodeBlockWindow",
  component: CodeBlockWindow,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-code-block-window",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["beta", "autodocs"],
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

export const Playground = Default;
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
