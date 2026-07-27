import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "@dt/Table";
import { TableRow } from "@dt/TableRow";
import { TableHeaderCell } from "@dt/TableHeaderCell";
import { TableCell } from "./TableCell";
import contract from "./TableCell.contract.json";

const meta = {
  title: "Data display/TableCell",
  component: TableCell,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["alpha", "autodocs"],
  args: { children: "Ada Lovelace", numeric: false },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    numeric: { control: "boolean", description: "Tabular figures, end-aligned." },
  },
  render: (args) => (
    <Table caption="Contributors">
      <thead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end">Projects</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCell {...args} />
          <TableCell numeric>8</TableCell>
        </TableRow>
      </tbody>
    </Table>
  ),
} satisfies Meta<typeof TableCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story: "numeric cells right-align with tabular figures so columns line up on the decimal.",
      },
    },
  },
  render: () => (
    <Table caption="Numbers">
      <thead>
        <TableRow>
          <TableHeaderCell>Metric</TableHeaderCell>
          <TableHeaderCell align="end">Value</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCell>Requests</TableCell>
          <TableCell numeric>1,204</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Errors</TableCell>
          <TableCell numeric>12</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Latency</TableCell>
          <TableCell numeric>98</TableCell>
        </TableRow>
      </tbody>
    </Table>
  ),
};

export const ForcedColors: Story = { globals: { forcedColors: "active" } };
