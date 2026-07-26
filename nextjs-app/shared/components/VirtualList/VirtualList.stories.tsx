import type { Meta, StoryObj } from "@storybook/react-vite";
import Text from "@dt/Text";
import { VirtualList } from "./VirtualList";
import contract from "./VirtualList.contract.json";

const items = Array.from({ length: 1000 }, (_, index) => ({
  id: `item-${index + 1}`,
  label: `Component result ${index + 1}`,
}));

const meta = {
  title: "Data display/VirtualList",
  component: VirtualList<(typeof items)[number]>,
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["alpha", "autodocs"],
  args: {
    "aria-label": "Component results",
    getItemKey: (item) => item.id,
    height: 320,
    itemHeight: 48,
    items,
    overscan: 3,
    renderItem: (item) => (
      <Text as="span" size="s">
        {item.label}
      </Text>
    ),
  },
  argTypes: {
    height: {
      control: "number",
      description: "Viewport height in pixels.",
    },
    itemHeight: {
      control: "number",
      description: "Fixed row height in pixels.",
    },
    overscan: {
      control: "number",
      description: "Extra rows around the viewport.",
    },
    items: { table: { disable: true } },
    getItemKey: { table: { disable: true } },
    renderItem: { table: { disable: true } },
  },
} satisfies Meta<typeof VirtualList<(typeof items)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = { tags: ["example"] };
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
