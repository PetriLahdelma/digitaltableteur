import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Text from "@dt/Text";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  content: string;
  size?: "sm" | "md" | "lg";
};

function NativeCode(args: Args) {
  return <NativeElement tagName="dt-code" attributes={args} />;
}

const meta = {
  title: "Web Components/Content/Code",
  component: NativeCode,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    docs: {
      description: {
        component: "Native `dt-code`: inline code chip, sm/md/lg.",
      },
    },
  },
  args: { content: "useCodeBlock()", size: "md" },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof NativeCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  play: assertNative("dt-code"),
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
        Small beside xs text: <NativeCode content="--prebuilt" size="sm" />
      </Text>
      <Text size="m">
        Medium beside body text: <NativeCode content="useCodeBlock()" size="md" />
      </Text>
      <Text size="l">
        Large beside large text: <NativeCode content="app/page.tsx" size="lg" />
      </Text>
    </div>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  render: () => (
    <Text size="s">
      The strict preset ships with sensible defaults; <NativeCode content="init" /> and{" "}
      <NativeCode content="doctor" /> pick up from there when the team wants stack-specific
      configuration.
    </Text>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
