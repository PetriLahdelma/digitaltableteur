import { AboutPageContent } from "./AboutPageContent";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./AboutPageContent.contract.json";

const defaultArgs = {
  showCTA: true,
};

const meta = {
  title: "Patterns/AboutPageContent",
  component: AboutPageContent,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    showCTA: { control: "boolean", description: "Render bottom CTA band" },
    className: { control: "text", description: "Page wrapper class names", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof AboutPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { };
export const Playground: Story = { };


export const Example: Story = {
  name: "Example (about page)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <AboutPageContent showCTA />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
