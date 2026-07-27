import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { Table } from "./Table";
import { TableRow } from "@dt/TableRow";
import { TableHeaderCell } from "@dt/TableHeaderCell";
import { TableCell } from "@dt/TableCell";

expect.extend(toHaveNoViolations);

function Basic({
  sortDirection,
}: {
  sortDirection?: "ascending" | "descending" | "none";
}) {
  return (
    <Table caption="People">
      <thead>
        <TableRow>
          <TableHeaderCell sortable sortDirection={sortDirection} onSort={() => {}}>
            Name
          </TableHeaderCell>
          <TableHeaderCell align="end">Projects</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow selected>
          <TableCell>Ada</TableCell>
          <TableCell numeric>8</TableCell>
        </TableRow>
      </tbody>
    </Table>
  );
}

describe("Table primitives", () => {
  it("renders a captioned native table with header and cells", () => {
    render(<Basic />);
    const table = screen.getByRole("table", { name: "People" });
    expect(table.tagName).toBe("TABLE");
    expect(screen.getByRole("columnheader", { name: /Name/ }).tagName).toBe("TH");
    expect(screen.getByRole("cell", { name: "Ada" }).tagName).toBe("TD");
  });

  it("marks a selected row with data-selected", () => {
    render(<Basic />);
    expect(screen.getByRole("row", { name: /Ada/ })).toHaveAttribute(
      "data-selected",
    );
  });

  it("exposes aria-sort only when the column is actively sorted", () => {
    const { rerender } = render(<Basic sortDirection="none" />);
    expect(
      screen.getByRole("columnheader", { name: /Name/ }),
    ).not.toHaveAttribute("aria-sort");
    rerender(<Basic sortDirection="ascending" />);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("renders the sortable header control as a button", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: /Name/ }).tagName).toBe("BUTTON");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Basic sortDirection="ascending" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
