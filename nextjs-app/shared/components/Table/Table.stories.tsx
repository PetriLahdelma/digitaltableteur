import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import React from "react";
import { Table, type TableSortDirection } from "./Table";
import { TableRow } from "@dt/TableRow";
import { TableHeaderCell } from "@dt/TableHeaderCell";
import { TableCell } from "@dt/TableCell";
import Checkbox from "../Checkbox/Checkbox";
import { useTableSelection } from "../../hooks/useTableSelection";
import contract from "./Table.contract.json";

const people = [
  { id: "ada", name: "Ada Lovelace", role: "Engineer", projects: 8 },
  { id: "dieter", name: "Dieter Rams", role: "Designer", projects: 5 },
  { id: "grace", name: "Grace Hopper", role: "Engineer", projects: 12 },
];

const meta = {
  title: "Data display/Table",
  component: Table,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["alpha", "autodocs"],
  args: {
    caption: "Project contributors",
    size: "md",
    striped: false,
    stickyHeader: false,
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Density scale.",
    },
    striped: { control: "boolean", description: "Alternating row surfaces." },
    stickyHeader: {
      control: "boolean",
      description: "Pin the header row while the body scrolls.",
    },
    hideCaption: {
      control: "boolean",
      description: "Visually hide the caption (kept for assistive tech).",
    },
    caption: { control: "text", description: "Accessible table name." },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

function Body() {
  return (
    <>
      <thead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell align="end">Projects</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {people.map((person) => (
          <TableRow key={person.id}>
            <TableCell>{person.name}</TableCell>
            <TableCell>{person.role}</TableCell>
            <TableCell numeric>{person.projects}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <Body />
    </Table>
  ),
};

export const Playground: Story = { ...Default };

export const Sortable: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "TableHeaderCell renders the three-state sort control: caret-up-down (unsorted, muted), caret-up (ascending), caret-down (descending).",
      },
    },
  },
  render: (args) => {
    const states: TableSortDirection[] = ["ascending", "none", "descending"];
    return (
      <Table {...args} caption="Sortable columns">
        <thead>
          <TableRow>
            {["Name", "Role", "Projects"].map((label, index) => (
              <TableHeaderCell
                key={label}
                sortable
                sortDirection={states[index]}
                align={label === "Projects" ? "end" : "start"}
              >
                {label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell>{person.name}</TableCell>
              <TableCell>{person.role}</TableCell>
              <TableCell numeric>{person.projects}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    );
  },
};

function SelectableTable(args: React.ComponentProps<typeof Table>) {
  // The header checkbox is the master control: useTableSelection derives the
  // all/indeterminate state and select-all toggle from the row selection.
  const selection = useTableSelection({ rowIds: people.map((p) => p.id) });
  return (
    <Table {...args} caption="Selectable rows">
      <thead>
        <TableRow>
          <TableHeaderCell align="center">
            <Checkbox
              label="Select all rows"
              aria-label="Select all rows"
              showLabel={false}
              checked={selection.allSelected}
              indeterminate={selection.someSelected}
              onCheckedChange={selection.toggleAll}
            />
          </TableHeaderCell>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {people.map((person) => {
          const selected = selection.isSelected(person.id);
          return (
            <TableRow key={person.id} selected={selected}>
              <TableCell align="center">
                <Checkbox
                  label={`Select ${person.name}`}
                  aria-label={`Select ${person.name}`}
                  showLabel={false}
                  checked={selected}
                  onCheckedChange={() => selection.toggleRow(person.id)}
                />
              </TableCell>
              <TableCell>{person.name}</TableCell>
              <TableCell>{person.role}</TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
}

export const Selectable: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The header checkbox is the master control: it selects/clears all rows and shows the indeterminate state on a partial selection, driven by useTableSelection.",
      },
    },
  },
  render: (args) => <SelectableTable {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ada = canvas.getByRole("checkbox", { name: "Select Ada Lovelace" });
    ada.focus();
    await userEvent.keyboard(" ");
    await expect(ada).toBeChecked();
    // A partial selection drives the master checkbox to indeterminate.
    await expect(
      canvas.getByRole("checkbox", { name: "Select all rows" }),
    ).toBePartiallyChecked();
  },
};

export const Example: Story = {
  tags: ["example"],
  args: { striped: true },
  render: (args) => (
    <Table {...args} caption="Contributors (striped)">
      <Body />
    </Table>
  ),
};

function KeyboardSortTable(args: React.ComponentProps<typeof Table>) {
  const [direction, setDirection] =
    React.useState<TableSortDirection>("none");
  const cycle = () =>
    setDirection((current) =>
      current === "none"
        ? "ascending"
        : current === "ascending"
          ? "descending"
          : "none",
    );
  return (
    <Table {...args} caption="Keyboard sort">
      <thead>
        <TableRow>
          <TableHeaderCell sortable sortDirection={direction} onSort={cycle}>
            Name
          </TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {people.map((person) => (
          <TableRow key={person.id}>
            <TableCell>{person.name}</TableCell>
            <TableCell>{person.role}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

/**
 * The family keyboard contract with real key events: Tab reaches the native
 * sort button, Enter and Space cycle the three sort states, and aria-sort
 * tracks each transition on the columnheader.
 */
export const KeyboardInteraction: Story = {
  tags: ["example"],
  render: (args) => <KeyboardSortTable {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = () => canvas.getByRole("columnheader", { name: /Name/ });
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Name" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(header()).toHaveAttribute("aria-sort", "ascending");
    await userEvent.keyboard("{Enter}");
    await expect(header()).toHaveAttribute("aria-sort", "descending");
    await userEvent.keyboard(" ");
    await expect(header()).not.toHaveAttribute("aria-sort");
  },
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: (args) => (
    <Table {...args}>
      <thead>
        <TableRow>
          <TableHeaderCell sortable sortDirection="ascending">
            Name
          </TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {people.map((person) => (
          <TableRow key={person.id}>
            <TableCell>{person.name}</TableCell>
            <TableCell>{person.role}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  ),
};
