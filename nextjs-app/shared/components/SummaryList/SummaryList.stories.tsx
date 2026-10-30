import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import Button from "@dt/Button";
import { SummaryList, type SummaryListRow } from "./SummaryList";
import contract from "./SummaryList.contract.json";

/* The production use: a section of the client intake's Check and submit page. */
const rows: SummaryListRow[] = [
  { id: "name", label: "Full name", value: "Aino Virtanen" },
  { id: "company", label: "Company / brand name", value: "Northwind Planning" },
  {
    id: "priorities",
    label: "What are the three most important things to address?",
    value:
      "1. One shared component library.\n2. Accessibility that passes procurement reviews.\n3. Tokens the team can maintain.",
  },
  { id: "services", label: "Services", value: "Design System Audit\nRedesign / refresh" },
  { id: "phone", label: "Phone number", value: "Not answered" },
];

const meta = {
  title: "Content/SummaryList",
  component: SummaryList,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  args: { rows, layout: "auto" },
  argTypes: {
    rows: { table: { disable: true } },
    layout: {
      control: "radio",
      options: ["auto", "stacked"],
      description: "auto puts label and value side by side once the list is about 40rem wide.",
      table: { defaultValue: { summary: "auto" } },
    },
  },
} satisfies Meta<typeof SummaryList>;

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
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A section heading with its Change action above the list, as on Check and submit.",
      },
    },
  },
  render: () => (
    <div style={{ maxInlineSize: "58rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Contact details</h3>
        <Button variant="tertiary" icon="pencil">
          Change<span className="sr-only"> Contact details</span>
        </Button>
      </div>
      <SummaryList rows={rows} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("term")).toHaveLength(rows.length);
    await expect(canvas.getByText(/One shared component library/).textContent).toContain("\n");
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: {
    docs: { description: { story: "Forced-colors verification story." } },
  },
};
