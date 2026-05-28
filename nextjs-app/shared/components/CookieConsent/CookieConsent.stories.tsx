import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import CookieConsent from "./CookieConsent";
import contract from "./CookieConsent.contract.json";

const meta = {
  title: "Organisms/CookieConsent",
  component: CookieConsent,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: { control: "text", description: "Banner class names", table: { disable: true } },
  },
  args: {},
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <CookieConsent />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
