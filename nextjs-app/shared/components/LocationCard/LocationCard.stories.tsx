import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocationCard } from "./LocationCard";
import contract from "./LocationCard.contract.json";

const defaultArgs = {
  officeName: "Digitaltableteur Helsinki",
  address: ["Mannerheimintie 20 B", "00100 Helsinki", "Finland"],
  email: "mail@digitaltableteur.com",
  variant: "bordered" as const,
};

const meta = {
  title: "Site/LocationCard",
  component: LocationCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-location-card",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof LocationCard>;

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

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (contact page)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420, width: "100%" }}>
      <LocationCard {...defaultArgs} />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
