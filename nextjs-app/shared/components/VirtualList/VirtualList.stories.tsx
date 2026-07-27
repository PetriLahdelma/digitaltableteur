import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "@dt/Icon";
import Badge from "@dt/Badge";
import StatusDot from "@dt/StatusDot";
import { VirtualList } from "./VirtualList";
import contract from "./VirtualList.contract.json";

const items = Array.from({ length: 1000 }, (_, index) => ({
  id: `item-${index + 1}`,
  label: `Component result ${index + 1}`,
  isNew: index % 7 === 0,
  online: index % 3 === 0,
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
  // The rows are absolutely positioned, so the viewport takes its width from
  // its container. Give it one here — otherwise the centered docs canvas
  // shrink-wraps it to zero width and only the border shows.
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 360, maxInlineSize: "100%" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["alpha", "autodocs"],
  args: {
    "aria-label": "Component results",
    getItemKey: (item) => item.id,
    height: 320,
    itemHeight: 48,
    items,
    overscan: 3,
    // Each visible row renders a VirtualListItem (which composes ListItem);
    // only the ~7 in view (+ overscan) of the 1000 are ever mounted.
    getItemProps: (item) => ({ children: item.label }),
  },
  argTypes: {
    height: { control: "number", description: "Viewport height in pixels." },
    itemHeight: { control: "number", description: "Fixed row height in pixels." },
    overscan: { control: "number", description: "Extra rows around the viewport." },
    items: { table: { disable: true } },
    getItemKey: { table: { disable: true } },
    getItemProps: { table: { disable: true } },
  },
} satisfies Meta<typeof VirtualList<(typeof items)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Rows use the full VirtualListItem chrome — leading icon, label, and end meta (Badge / StatusDot) — the same extras as menus and other lists, while staying virtualized.",
      },
    },
  },
  args: {
    getItemProps: (item) => ({
      children: item.label,
      icon: <Icon name="cube" ariaLabel="" />,
      meta: item.isNew ? (
        <Badge size="sm" tone="info">
          New
        </Badge>
      ) : (
        <StatusDot tone={item.online ? "success" : "neutral"} label={item.online ? "Online" : "Offline"} />
      ),
    }),
  },
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
