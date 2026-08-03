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
    // The identifying column: each row's Name cell is a <th scope="row">.
    rowHeader: true,
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
      table: { defaultValue: { summary: "md" } },
    },
    striped: {
      control: "boolean",
      description: "Alternating row surfaces.",
      table: { defaultValue: { summary: "false" } },
    },
    stickyHeader: {
      control: "boolean",
      description: "Pin the header row while the body scrolls.",
      table: { defaultValue: { summary: "false" } },
    },
    pageSize: {
      control: "number",
      description: "Rows per page; enables pagination when set.",
    },
    caption: {
      control: "text",
      description: "Accessible table name rendered as a caption.",
    },
    hideCaption: {
      control: "boolean",
      description: "Visually hides the caption while retaining the accessible name.",
      table: { defaultValue: { summary: "false" } },
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
export const Paginated: Story = {
  tags: ["example"],
  args: {
    pageSize: 3,
    data: Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      name: `Contributor ${i + 1}`,
      role: i % 2 ? "Designer" : "Engineer",
      projects: (i * 3) % 13,
    })),
  },
  parameters: {
    docs: {
      description: {
        story: "Set `pageSize` to page the table; the pager reads via IconButtons.",
      },
    },
  },
};

export const Empty: Story = {
  args: { data: [], emptyState: "No contributors" },
};

/**
 * 1,000 generated rows behind a 50-row page: the sort and selection hooks
 * operate on the full set while the DOM stays at one page. Used as the
 * representative large-data performance case (see spec Design notes).
 */
export const LargeDataset: Story = {
  tags: ["example"],
  args: {
    caption: "1,000 contributors",
    pageSize: 50,
    stickyHeader: true,
    data: Array.from({ length: 1000 }, (_, i) => ({
      id: `row-${i}`,
      name: `Contributor ${String(i + 1).padStart(4, "0")}`,
      role: ["Engineer", "Designer", "Writer", "Researcher"][i % 4],
      projects: (i * 7) % 97,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Sorting a paginated table must re-rank the WHOLE set, not the page.
    await userEvent.click(canvas.getByRole("button", { name: "Projects" }));
    await expect(
      canvas.getByRole("columnheader", { name: /Projects/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getByText("1–50 of 1000")).toBeInTheDocument();
  },
};

/**
 * Nine columns of unbroken content in a constrained container: the Table
 * primitive's scroll wrapper takes the horizontal overflow so the page never
 * widens.
 */
export const Overflow: Story = {
  args: {
    caption: "Wide result set",
    columns: [
      ...columns,
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `metric-${i}`,
        header: `Quarterly metric ${i + 1}`,
        accessor: (row: Person) => `${row.name.replaceAll(" ", "")}-metric-${i + 1}-0000${row.projects}`,
      })),
    ],
  },
  decorators: [
    (StoryComponent) => (
      <div style={{ maxInlineSize: "480px" }}>
        <StoryComponent />
      </div>
    ),
  ],
};

/**
 * The full keyboard contract, driven by real key events: Tab reaches the
 * select-all checkbox and the sort buttons in order, Enter cycles a sort,
 * Space toggles selection.
 */
export const KeyboardInteraction: Story = {
  tags: ["example"],
  args: { defaultSelectedRowIds: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Tab 1: select-all checkbox; Space selects every displayed row.
    await userEvent.tab();
    await expect(
      canvas.getByRole("checkbox", { name: "Select all rows" }),
    ).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(
      canvas.getByRole("checkbox", { name: "Select Ada Lovelace" }),
    ).toBeChecked();
    await userEvent.keyboard(" "); // deselect again
    // Tab 2: first sortable header; Enter sorts ascending.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Name" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByRole("columnheader", { name: /Name/ }),
    ).toHaveAttribute("aria-sort", "ascending");
  },
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
