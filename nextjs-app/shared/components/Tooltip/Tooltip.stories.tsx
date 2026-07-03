import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";
import Button from "@dt/Button";

const meta = {
  title: "Feedback/Tooltip",
  component: TooltipContent,
  parameters: {
    layout: "centered",
    contractStatus: "alpha",
  },
  tags: ["autodocs"],
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
