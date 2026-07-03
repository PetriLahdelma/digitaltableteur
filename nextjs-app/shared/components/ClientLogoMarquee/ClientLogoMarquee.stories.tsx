import { ClientLogoMarquee } from "./ClientLogoMarquee";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ClientLogoMarquee.contract.json";

const defaultArgs = {
  ariaLabel: "Selected clients",
};

const meta = {
  title: "Site/ClientLogoMarquee",
  component: ClientLogoMarquee,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-client-logo-marquee",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    ariaLabel: {
      control: "text",
      description: "Accessible name for the logo region",
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ClientLogoMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (homepage client strip)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ClientLogoMarquee ariaLabel="Selected clients" />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
