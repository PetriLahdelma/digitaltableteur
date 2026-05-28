import { ClientLogoMarquee } from "./ClientLogoMarquee";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ClientLogoMarquee.contract.json";

const defaultArgs = {
  ariaLabel: "Selected clients",
};

const meta = {
  title: "Organisms/ClientLogoMarquee",
  component: ClientLogoMarquee,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    ariaLabel: { control: "text", description: "Accessible name for the logo region" },
  },
  args: defaultArgs,
} satisfies Meta<typeof ClientLogoMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { };
export const Playground: Story = { };


export const Example: Story = {
  name: "Example (homepage client strip)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ClientLogoMarquee ariaLabel="Selected clients" />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
