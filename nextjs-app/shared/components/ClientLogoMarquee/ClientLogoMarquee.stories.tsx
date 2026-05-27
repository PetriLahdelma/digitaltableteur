import contract from "./ClientLogoMarquee.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClientLogoMarquee } from "./ClientLogoMarquee";

const meta: Meta<typeof ClientLogoMarquee> = {
  argTypes: {},
  title: "Organisms/ClientLogoMarquee",
  component: ClientLogoMarquee,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof ClientLogoMarquee>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ClientLogoMarquee />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
