import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import Snippet from "@dt/Snippet";
import contract from "./Snippet.contract.json";
import storyStyles from "../CodeBlock/CodeBlock.stories.module.css";

const meta = {
  title: "Content/Snippet",
  component: Snippet,
  tags: ["beta", "autodocs"],
  parameters: {
    design: { type: "figma", url: contract.figma },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: {
    command: "npm install @digitaltableteur/react",
    prompt: true,
    theme: "default",
  },
  decorators: [
    (Story) => (
      <div className={storyStyles.column}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Snippet>;

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

export const Inverted: Story = {
  tags: ["example"],
  args: { theme: "inverted" },
};

export const MultipleCommands: Story = {
  tags: ["example"],
  args: {
    command: [
      "npm i -D stylelint stylelint-plugin-rhythmguard",
      "npx stylelint \"src/**/*.css\"",
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Several commands render one per line and copy together, joined by newlines.",
      },
    },
  },
};

export const WithoutPrompt: Story = {
  tags: ["example"],
  args: { prompt: false, command: "NEXT_PUBLIC_SENTRY_DSN=https://example.ingest.sentry.io/1" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: { command: "npx @digitaltableteur/cli init" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("$")).toHaveAttribute("aria-hidden", "true");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Copy code" })).toHaveFocus();
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => (
    <div className={storyStyles.stack}>
      <Snippet {...args} />
      <Snippet {...args} theme="inverted" />
    </div>
  ),
};
