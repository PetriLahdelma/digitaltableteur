import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "@dt/Table";
import { TableRow } from "@dt/TableRow";
import { TableCell } from "@dt/TableCell";
import { TableHeaderCell } from "./TableHeaderCell";
import contract from "./TableHeaderCell.contract.json";

const meta = {
  title: "Data display/TableHeaderCell",
  component: TableHeaderCell,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["alpha", "autodocs"],
  args: {
    children: "Name",
    align: "start",
    scope: "col",
    sortable: true,
    sortDirection: "ascending",
  },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    scope: { control: "inline-radio", options: ["col", "row"] },
    sortable: { control: "boolean" },
    sortDirection: {
      control: "radio",
      options: ["ascending", "descending", "none"],
    },
  },
  render: (args) => (
    <Table caption="Contributors">
      <thead>
        <TableRow>
          <TableHeaderCell {...args} />
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Engineer</TableCell>
        </TableRow>
      </tbody>
    </Table>
  ),
} satisfies Meta<typeof TableHeaderCell>;

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
          "The three-state sort control: caret-up-down (unsorted, muted), caret-up (ascending), caret-down (descending).",
      },
    },
  },
  render: () => (
    <Table caption="Sort states">
      <thead>
        <TableRow>
          <TableHeaderCell sortable sortDirection="ascending">
            Name
          </TableHeaderCell>
          <TableHeaderCell sortable sortDirection="none">
            Role
          </TableHeaderCell>
          <TableHeaderCell sortable sortDirection="descending" align="end">
            Projects
          </TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCell>Ada</TableCell>
          <TableCell>Engineer</TableCell>
          <TableCell numeric>8</TableCell>
        </TableRow>
      </tbody>
    </Table>
  ),
};

export const RowHeader: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "scope=row names the identifying cell of each body row, so screen readers announce the person with every other cell.",
      },
    },
  },
  render: () => (
    <Table caption="People">
      <thead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableHeaderCell scope="row">Ada Lovelace</TableHeaderCell>
          <TableCell>Engineer</TableCell>
        </TableRow>
        <TableRow>
          <TableHeaderCell scope="row">Dieter Rams</TableHeaderCell>
          <TableCell>Designer</TableCell>
        </TableRow>
      </tbody>
    </Table>
  ),
};

export const ForcedColors: Story = { globals: { forcedColors: "active" } };
