import contract from "./Tooltip.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";
import Button from "@dt/Button";
import { IconButton } from "@dt/IconButton";

const meta = {
  title: "Feedback/Tooltip",
  component: TooltipContent,
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
      description: "Preferred placement; flips when out of room",
      table: { defaultValue: { summary: "top" } },
    },
    sideOffset: {
      control: { type: "number" },
      description: "Gap between trigger and bubble in px",
      table: { defaultValue: { summary: "4" } },
    },
    children: {
      control: "text",
      description: "Hint text (short phrase, never interactive content)",
    },
    className: { control: false, table: { category: "Advanced" } },
  },
  args: {
    side: "top" as const,
    sideOffset: 4,
    children: "Helpful hint about this action.",
  },
} satisfies Meta<typeof TooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Radix tooltip composition: `TooltipProvider` sets the open delay,
 * `TooltipTrigger` wraps the focusable element via `asChild`, and
 * `TooltipContent` renders the hint in a portal with a tokenized fade/scale
 * enter animation (dropped under `prefers-reduced-motion`). Shown `defaultOpen`
 * so the content is visible without a pointer; in use it opens on hover/focus.
 */
export const Default: Story = {
  render: (args) => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover or focus me</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover or focus me</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </TooltipProvider>
  ),
};

/** All four placements, forced open for comparison. */
export const Placements: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "side sets the preferred placement — top, right, bottom, left. Radix flips to the opposite side automatically when the preferred one runs out of room.",
      },
    },
  },
  render: () => (
    <TooltipProvider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, auto)",
          gap: "4rem 6rem",
          padding: "4rem",
        }}
      >
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side} defaultOpen>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm">
                {side}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Placed {side}.</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

/** The canonical pairing: visible hint for an icon-only control that keeps its own accessible name. */
export const WithIconButton: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The most common use: an icon-only control keeps its own accessible name (label) while the tooltip shows the sighted hint. The tooltip describes; it never names.",
      },
    },
  },
  render: () => (
    <TooltipProvider>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton icon="star" label="Favorite" variant="tertiary" />
          </TooltipTrigger>
          <TooltipContent>Add to favorites</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              icon="share-network"
              label="Share"
              variant="tertiary"
            />
          </TooltipTrigger>
          <TooltipContent>Share this page</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

/** Provider-level delayDuration tunes how fast hints appear. */
export const Delay: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "delayDuration lives on the provider so a whole toolbar shares one timing: 0 feels instant, the 200ms default filters accidental hovers, longer values suit dense UI.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      {[0, 200, 700].map((delay) => (
        <TooltipProvider key={delay} delayDuration={delay}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm">
                {delay}ms
              </Button>
            </TooltipTrigger>
            <TooltipContent>Opened after {delay}ms.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  ),
};

/** Keyboard contract driven end to end: focus opens, Escape dismisses. */
export const Example: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The a11y contract, asserted by the play function: keyboard focus opens the tooltip (no pointer needed) and Escape dismisses it without moving focus.",
      },
    },
  },
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Focus me</Button>
        </TooltipTrigger>
        <TooltipContent>Visible on focus, gone on Escape.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Focus me",
    });
    // Keyboard focus must open the tooltip — no pointer involved.
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeVisible());
    // Radix wires the description onto the trigger.
    expect(trigger).toHaveAttribute("aria-describedby");
    // Escape dismisses without moving focus.
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover or focus me</Button>
        </TooltipTrigger>
        <TooltipContent>Helpful hint about this action.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
