import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "@dt/Table";
import { TableCell } from "@dt/TableCell";
import { TableHeaderCell } from "@dt/TableHeaderCell";
import { TableRow } from "./TableRow";
import contract from "./TableRow.contract.json";

const people = [
  { name: "Ada Lovelace", role: "Engineer" },
  { name: "Dieter Rams", role: "Designer" },
  { name: "Grace Hopper", role: "Engineer" },
];

const meta = {
  title: "Data display/TableRow",
  component: TableRow,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["beta", "autodocs"],
  args: { selected: false },
  argTypes: {
    selected: {
      control: "boolean",
      description: "Selected surface (visual only).",
      table: { defaultValue: { summary: "false" } },
    },
  },
  render: (args) => (
    <Table caption="Contributors">
      <thead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow {...args}>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Engineer</TableCell>
        </TableRow>
      </tbody>
    </Table>
  ),
} satisfies Meta<typeof TableRow>;

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
          "Rows in context: the middle row is selected; the hover, zebra, and selection surfaces come from the Table root.",
      },
    },
  },
  render: () => (
    <Table caption="Contributors" striped>
      <thead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {people.map((person, index) => (
          <TableRow key={person.name} selected={index === 1}>
            <TableCell>{person.name}</TableCell>
            <TableCell>{person.role}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"], globals: { forcedColors: "active" } };
