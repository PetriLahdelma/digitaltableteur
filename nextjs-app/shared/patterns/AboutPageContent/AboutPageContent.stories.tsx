import { AboutPageContent } from "./AboutPageContent";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./AboutPageContent.contract.json";

const defaultArgs = {
  showCTA: true,
};

const meta = {
  title: "Patterns/AboutPageContent",
  component: AboutPageContent,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-about-page-content",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof AboutPageContent>;

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
  name: "Example (about page)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <AboutPageContent showCTA />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
