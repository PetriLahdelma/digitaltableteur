import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "@dt/Icon";
import Badge from "@dt/Badge";
import StatusDot from "@dt/StatusDot";
import { VirtualListItem } from "./VirtualListItem";
import contract from "./VirtualListItem.contract.json";

const meta = {
  title: "Data display/VirtualListItem",
  component: VirtualListItem,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["beta", "autodocs"],
  // role="listitem" is only valid inside a list; wrap and give it width.
  decorators: [
    (Story) => (
      <div role="list" aria-label="Example list" style={{ inlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    posInSet: 3,
    setSize: 1000,
    children: "Component result 3",
  },
  argTypes: {
    posInSet: { control: "number", description: "1-based position (aria-posinset)." },
    setSize: { control: "number", description: "Total item count (aria-setsize)." },
    selected: { control: "boolean", description: "Renders the trailing check." },
    tone: {
      control: "inline-radio",
      options: ["neutral", "destructive"],
      description: "Destructive rows use the error treatment.",
      table: { defaultValue: { summary: "neutral" } },
    },
    icon: { table: { disable: true } },
    meta: { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof VirtualListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };
export const Playground: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  args: {
    icon: <Icon name="cube" ariaLabel="" />,
    meta: (
      <Badge size="sm" tone="info">
        New
      </Badge>
    ),
  },
};

export const WithStatus: Story = {
  args: {
    icon: <Icon name="cube" ariaLabel="" />,
    meta: <StatusDot tone="success" label="Online" />,
    selected: true,
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
