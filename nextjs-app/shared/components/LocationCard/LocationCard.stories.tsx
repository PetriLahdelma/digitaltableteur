import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocationCard } from "./LocationCard";
import contract from "./LocationCard.contract.json";

/** Mirrors `ContactPageContent` — Helsinki office card in the locations grid. */
const contactPageArgs = {
  officeName: "Digitaltableteur Helsinki",
  address: ["Mannerheimintie 20 B", "00100 Helsinki", "Finland"],
  email: "mail@digitaltableteur.com",
  variant: "bordered" as const,
};

const meta = {
  title: "Molecules/LocationCard",
  component: LocationCard,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  argTypes: {
    officeName: { control: "text", table: { category: "Content" } },
    address: { control: "object", table: { category: "Content" } },
    email: { control: "text", table: { category: "Content" } },
    phone: { control: "text", table: { category: "Content" } },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
      table: { defaultValue: { summary: "default" } },
    },
  },
  args: contactPageArgs,
} satisfies Meta<typeof LocationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {};

export const Example: Story = {
  name: "Example (contact page)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420, width: "100%" }}>
      <LocationCard {...contactPageArgs} />
    </div>
  ),
};

export const ElevatedWithPhone: Story = {
  args: {
    ...contactPageArgs,
    variant: "elevated",
    phone: "+358 40 123 4567",
  },
};
