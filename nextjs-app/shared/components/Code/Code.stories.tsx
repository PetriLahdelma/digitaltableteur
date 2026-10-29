import type { Meta, StoryObj } from "@storybook/react-vite";
import Code from "@dt/Code";
import Text from "@dt/Text";
import contract from "./Code.contract.json";

const meta = {
  title: "Content/Code",
  component: Code,
  tags: ["beta", "autodocs"],
  parameters: {
    design: { type: "figma", url: contract.figma },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: { children: "useCodeBlock()", size: "md" },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Sizes: Story = {
  tags: ["example"],
  render: () => (
    <div>
      <Text size="xs">
        Small beside xs text: <Code size="sm">--prebuilt</Code>
      </Text>
      <Text size="m">
        Medium beside body text: <Code size="md">useCodeBlock()</Code>
      </Text>
      <Text size="l">
        Large beside large text: <Code size="lg">app/page.tsx</Code>
      </Text>
      <Text size="m">
        Inherit takes the size of the text around it:{" "}
        <Code size="inherit">AGENTS.md</Code>
      </Text>
    </div>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  render: () => (
    <Text size="s">
      The strict preset ships with sensible defaults; <Code>init</Code> and{" "}
      <Code>doctor</Code> pick up from there when the team wants stack-specific
      configuration.
    </Text>
  ),
  parameters: {
    docs: {
      description: {
        story: "In production: CLI commands named inside the Rhythmguard case study copy.",
      },
    },
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
