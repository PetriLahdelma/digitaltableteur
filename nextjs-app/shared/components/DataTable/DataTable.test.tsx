import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

expect.extend(toHaveNoViolations);

type Row = { id: string; name: string; score: number };
const data: Row[] = [
  { id: "b", name: "Beta", score: 2 },
  { id: "a", name: "Alpha", score: 1 },
];
const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
  {
    id: "score",
    header: "Score",
    accessor: (row) => row.score,
    sortable: true,
  },
];

const renderTable = (
  props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {},
) =>
  render(
    <DataTable
      caption="Scores"
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      {...props}
    />,
  );

describe("DataTable", () => {
  it("renders native table semantics and a caption", () => {
    renderTable();
    expect(screen.getByRole("table", { name: "Scores" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("cycles sortable columns through ascending, descending, and unsorted", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    renderTable({ onSortChange });
    const sort = screen.getByRole("button", { name: "Name" });

    await user.click(sort);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.click(sort);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    await user.click(sort);
    expect(
      screen.getByRole("columnheader", { name: /Name/ }),
    ).not.toHaveAttribute("aria-sort");
    expect(onSortChange).toHaveBeenCalledTimes(3);
  });

  it("selects individual rows and all rows", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({ onSelectionChange });

    await user.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a"]);
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["b", "a"]);
  });

  it("renders the supplied empty state", () => {
    renderTable({ data: [], emptyState: "Nothing to review" });
    expect(screen.getByText("Nothing to review")).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = renderTable({ onSelectionChange: () => undefined });
    expect(await axe(container)).toHaveNoViolations();
  });
});
