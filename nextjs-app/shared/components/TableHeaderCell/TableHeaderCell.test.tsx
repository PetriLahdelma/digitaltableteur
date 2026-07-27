import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { TableHeaderCell } from "./TableHeaderCell";

expect.extend(toHaveNoViolations);

const inHeadRow = (cell: React.ReactNode) => (
  <table>
    <caption>People</caption>
    <thead>
      <tr>{cell}</tr>
    </thead>
  </table>
);

describe("TableHeaderCell", () => {
  it("defaults to a column header", () => {
    render(inHeadRow(<TableHeaderCell>Name</TableHeaderCell>));
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "scope",
      "col",
    );
  });

  it("supports a row header (scope=row)", () => {
    render(
      <table>
        <caption>People</caption>
        <tbody>
          <tr>
            <TableHeaderCell scope="row">Ada</TableHeaderCell>
            <td>Engineer</td>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByRole("rowheader", { name: "Ada" })).toHaveAttribute(
      "scope",
      "row",
    );
  });

  it("exposes aria-sort and toggles via a button when sortable", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      inHeadRow(
        <TableHeaderCell sortable sortDirection="ascending" onSort={onSort}>
          Name
        </TableHeaderCell>,
      ),
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it("does not render a sort control on a row header", () => {
    render(
      <table>
        <caption>People</caption>
        <tbody>
          <tr>
            <TableHeaderCell scope="row" sortable>
              Ada
            </TableHeaderCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      inHeadRow(
        <TableHeaderCell sortable sortDirection="descending">
          Score
        </TableHeaderCell>,
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
