import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
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
  tags: ["beta", "autodocs"],
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
    overscan: {
      control: "number",
      description: "Extra rows around the viewport.",
      table: { defaultValue: { summary: "3" } },
    },
    items: { table: { disable: true } },
    getItemKey: { table: { disable: true } },
    getItemProps: { table: { disable: true } },
    initialScrollOffset: {
      control: "number",
      description: "Scroll position in pixels applied on mount.",
    },
    "aria-label": {
      control: "text",
      description: "Accessible name for the listbox viewport.",
    },
  },
} satisfies Meta<typeof VirtualList<(typeof items)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };
export const Playground: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix", "example"],
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

/**
 * 10,000 rows behind a ~7-row window: the DOM stays at viewport + overscan
 * regardless of collection size, and every mounted row carries its true
 * aria-posinset/aria-setsize. Used as the scroll-stability performance case
 * (see spec Design notes).
 */
export const TenThousandRows: Story = {
  tags: ["example"],
  args: {
    "aria-label": "Ten thousand rows",
    items: Array.from({ length: 10000 }, (_, index) => ({
      id: `row-${index + 1}`,
      label: `Row ${index + 1}`,
      isNew: false,
      online: false,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("list", { name: "Ten thousand rows" });
    const mounted = () => canvas.getAllByRole("listitem").length;
    // Jump deep into the collection; the window slides, the DOM does not
    // grow beyond visible rows (ceil(320/48) = 7) plus overscan on each side.
    viewport.scrollTop = 9000 * 48;
    await waitFor(() => {
      expect(
        canvas.getByText("Row 9001").closest("[role=\"listitem\"]"),
      ).toHaveAttribute("aria-posinset", "9001");
    });
    await expect(mounted()).toBeLessThanOrEqual(7 + 2 * 3);
    await expect(
      canvas.getByText("Row 9001").closest("[role=\"listitem\"]"),
    ).toHaveAttribute("aria-setsize", "10000");
  },
};

/**
 * The scroll window is keyboard-reachable: Tab lands on the viewport itself,
 * whose native scroll handling (arrows, PageUp/PageDown, Home/End) is browser
 * behavior that synthetic key events cannot trigger — so the play asserts
 * focusability and slides the window through the same scroll pathway the keys
 * drive, verifying the rendered range follows.
 */
export const KeyboardScroll: Story = {
  tags: ["example"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("list", { name: "Component results" });
    await userEvent.tab();
    await expect(viewport).toHaveFocus();
    // The End key scrolls a focused viewport to the bottom; drive the same
    // scroll pathway programmatically (synthetic keys are untrusted and
    // cannot invoke native scrolling).
    viewport.scrollTop = viewport.scrollHeight;
    await waitFor(() => {
      expect(
        canvas.getByText("Component result 1000").closest("[role=\"listitem\"]"),
      ).toHaveAttribute("aria-posinset", "1000");
    });
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
