import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";
import contract from "./Pagination.contract.json";

function PaginationDemo(args: React.ComponentProps<typeof Pagination>) {
  const [page, setPage] = useState(args.currentPage ?? 1);
  // Sync panel edits in: currentPage would otherwise be mount-only state and
  // the Controls row would drive nothing.
  React.useEffect(() => {
    if (args.currentPage) setPage(args.currentPage);
  }, [args.currentPage]);
  return (
    <Pagination
      {...args}
      currentPage={page}
      onPageChange={(p) => {
        setPage(p);
        args.onPageChange?.(p);
      }}
    />
  );
}

const defaultArgs = {
  currentPage: 2,
  totalPages: 8,
  onPageChange: fn(),
  siblingCount: 1,
};

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-pagination",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <PaginationDemo {...args} />,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <PaginationDemo {...args} />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <PaginationDemo currentPage={3} totalPages={12} onPageChange={fn()} />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <PaginationDemo {...args} />,
};

/** Deep in a long collection: ellipsis appears on both sides of the window. */
export const ManyPages: Story = {
  tags: ["example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "First and last pages always render; the siblingCount window travels with the current page and ellipsis fills the gaps. This preview is live — click around.",
      },
    },
  },
  render: () => (
    <PaginationDemo currentPage={25} totalPages={50} onPageChange={fn()} />
  ),
};

/** siblingCount trades width for context. */
export const SiblingCount: Story = {
  tags: ["example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    // Three pagers side by side is a comparison artifact of this story; a
    // real page has one pager landmark, so landmark-unique does not apply.
    a11y: {
      config: { rules: [{ id: "landmark-unique", enabled: false }] },
    },
    docs: {
      description: {
        story:
          "siblingCount sets how many numbers flank the current page: 0 is the most compact (mobile), 2 keeps more context in reach on wide layouts.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {([0, 1, 2] as const).map((count) => (
        <PaginationDemo
          key={count}
          currentPage={10}
          totalPages={20}
          siblingCount={count}
          onPageChange={fn()}
        />
      ))}
    </div>
  ),
};

/** The controlled contract, asserted: clicking moves aria-current. */
export const Interactive: Story = {
  tags: ["example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "Pagination is fully controlled: onPageChange updates state, the new currentPage flows back down, and aria-current follows. The play function asserts the round trip.",
      },
    },
  },
  render: () => (
    <PaginationDemo currentPage={1} totalPages={9} onPageChange={fn()} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pageTwo = canvas.getByRole("button", { name: /page 2/i });
    await userEvent.click(pageTwo);
    await expect(pageTwo).toHaveAttribute("aria-current", "page");
  },
};
