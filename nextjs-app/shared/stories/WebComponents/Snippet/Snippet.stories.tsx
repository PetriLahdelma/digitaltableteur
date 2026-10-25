import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect } from "storybook/test";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  command: string;
  prompt?: boolean;
  theme?: "default" | "inverted";
  copyable?: boolean;
  copyLabel?: string;
};

function NativeSnippet(args: Args) {
  return (
    <NativeElement
      tagName="dt-snippet"
      attributes={{
        command: args.command,
        prompt: args.prompt === false ? "false" : undefined,
        theme: args.theme,
        copyable: args.copyable === false ? "false" : undefined,
        "copy-label": args.copyLabel,
      }}
    />
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return <div style={{ maxInlineSize: "var(--size-width-form)" }}>{children}</div>;
}

const meta = {
  title: "Web Components/Content/Snippet",
  component: NativeSnippet,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    contractStatus: "beta",
    docs: {
      description: {
        component:
          "Native `dt-snippet`: copyable command(s); the $ prompt is aria-hidden and never copied. Several commands go newline-separated in `command`.",
      },
    },
  },
  args: {
    command: "npm install @digitaltableteur/react",
    prompt: true,
    theme: "default",
  },
  argTypes: {
    theme: { control: "inline-radio", options: ["default", "inverted"] },
  },
  decorators: [
    (Story) => (
      <Column>
        <Story />
      </Column>
    ),
  ],
} satisfies Meta<typeof NativeSnippet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  play: assertNative("dt-snippet"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Inverted: Story = {
  tags: ["example"],
  args: { theme: "inverted" },
};

export const MultipleCommands: Story = {
  tags: ["example"],
  args: {
    command:
      "npm i -D stylelint stylelint-plugin-rhythmguard\nnpx stylelint \"src/**/*.css\"",
  },
};

export const WithoutPrompt: Story = {
  tags: ["example"],
  args: {
    prompt: false,
    command: "NEXT_PUBLIC_SENTRY_DSN=https://example.ingest.sentry.io/1",
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: { command: "npx @digitaltableteur/cli init" },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-snippet") as HTMLElement;
    const prompt = host.shadowRoot?.querySelector(".prompt");
    await expect(prompt?.getAttribute("aria-hidden")).toBe("true");
    const copy = host.shadowRoot?.querySelector("button") as HTMLButtonElement;
    await expect(copy.getAttribute("aria-label")).toBe("Copy code");
    // user-event's tab order does not enter shadow roots; focus directly.
    copy.focus();
    await expect(host.shadowRoot?.activeElement).toBe(copy);
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--space-internal-24)" }}>
      <NativeSnippet {...args} />
      <NativeSnippet {...args} theme="inverted" />
    </div>
  ),
};
