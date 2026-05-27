import contract from "./CookieConsent.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import CookieConsent from "./CookieConsent";

const meta: Meta<typeof CookieConsent> = {
  argTypes: {},
  title: "Organisms/CookieConsent",
  component: CookieConsent,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof CookieConsent>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <CookieConsent />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
