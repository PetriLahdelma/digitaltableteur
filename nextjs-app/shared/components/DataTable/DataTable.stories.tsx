import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DataTable, type DataTableColumn } from "./DataTable";
import contract from "./DataTable.contract.json";

type Person = {
  id: string;
  name: string;
  role: string;
  projects: number;
};

const rows: Person[] = [
  { id: "ada", name: "Ada Lovelace", role: "Engineer", projects: 8 },
  { id: "dieter", name: "Dieter Rams", role: "Designer", projects: 5 },
  { id: "grace", name: "Grace Hopper", role: "Engineer", projects: 12 },
];

const columns: DataTableColumn<Person>[] = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => row.name,
    sortable: true,
  },
  {
    id: "role",
    header: "Role",
    accessor: (row) => row.role,
    sortable: true,
  },
  {
    id: "projects",
    header: "Projects",
    accessor: (row) => row.projects,
    sortable: true,
    align: "end",
  },
];

const meta = {
  title: "Data display/DataTable",
  component: DataTable<Person>,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["alpha", "autodocs"],
  args: {
    caption: "Project contributors",
    columns,
    data: rows,
    getRowId: (row) => row.id,
    getRowLabel: (row) => row.name,
    onSelectionChange: () => undefined,
    size: "md",
    striped: false,
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Table density.",
    },
    striped: {
      control: "boolean",
      description: "Alternating row surfaces.",
    },
    data: { table: { disable: true } },
    columns: { table: { disable: true } },
    getRowId: { table: { disable: true } },
    getRowLabel: { table: { disable: true } },
    onSelectionChange: { table: { disable: true } },
  },
} satisfies Meta<typeof DataTable<Person>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  tags: ["example"],
  args: { striped: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(
      canvas.getByRole("columnheader", { name: /Name/ }),
    ).toHaveAttribute("aria-sort", "ascending");
  },
};
export const Empty: Story = {
  args: { data: [], emptyState: "No contributors" },
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
