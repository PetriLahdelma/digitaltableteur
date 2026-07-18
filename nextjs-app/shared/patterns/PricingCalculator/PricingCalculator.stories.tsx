import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PricingCalculator } from "./PricingCalculator";
import { computePricing } from "./pricingMath";
import contract from "./PricingCalculator.contract.json";

const meta = {
  title: "Patterns/PricingCalculator",
  component: PricingCalculator,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Optional wrapper class.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof PricingCalculator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    className: "",
  },
};

/** Selecting a different duration and workload recomputes the totals live. */
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const format = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

    // Defaults: 2 weeks × 5 days/week.
    const defaults = computePricing("2w", 5);
    await expect(
      canvas.getByText(format.format(defaults.totalHours)),
    ).toBeInTheDocument();

    // 12 months at the default 5 days/week earns the 90 €/h partnership rate.
    await userEvent.click(canvas.getByRole("radio", { name: /12\s*months/i }));
    await expect(canvas.getByText(/^90\s?€\//)).toBeInTheDocument();

    // Dropping below 4 days/week loses the partnership rate again.
    await userEvent.click(canvas.getByRole("radio", { name: /3\s*days/i }));
    const next = computePricing("12m", 3);
    await expect(next.effectiveRate).toBe(120);
    await expect(
      canvas.getByText(format.format(next.totalHours)),
    ).toBeInTheDocument();
    await expect(canvas.queryByText(/^90\s?€\//)).toBeNull();
  },
};

/** In-context composition: the section as it sits on the pricing page. */
export const Example: Story = {
  render: () => (
    <div style={{ maxWidth: 1120, marginInline: "auto" }}>
      <PricingCalculator />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
