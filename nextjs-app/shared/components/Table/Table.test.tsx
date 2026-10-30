import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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
          <TableHeaderCell
            sortable
            sortDirection={sortDirection}
            onSort={() => {}}
          >
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
    expect(screen.getByRole("columnheader", { name: /Name/ }).tagName).toBe(
      "TH",
    );
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

  it("stacks on narrow containers with explicit roles and cell labels", async () => {
    const { container } = render(
      <Table caption="Routing" striped stackOnNarrow>
        <thead role="rowgroup">
          <TableRow>
            <TableHeaderCell>Case</TableHeaderCell>
            <TableHeaderCell>Who</TableHeaderCell>
          </TableRow>
        </thead>
        <tbody role="rowgroup">
          <TableRow>
            <TableHeaderCell scope="row">Charts</TableHeaderCell>
            <TableCell label="Who">Specialist</TableCell>
          </TableRow>
        </tbody>
      </Table>,
    );
    const table = screen.getByRole("table", { name: "Routing" });
    expect(table).toHaveAttribute("role", "table");
    expect(
      screen.getByRole("rowheader", { name: "Charts" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Specialist" })).toHaveAttribute(
      "data-label",
      "Who",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("makes an overflowing wrapper a focusable region named by the caption", async () => {
    const scrollWidth = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockReturnValue(900);
    const clientWidth = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockReturnValue(320);
    render(
      <Table caption="Wide table">
        <tbody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </tbody>
      </Table>,
    );
    const region = await screen.findByRole("region", { name: "Wide table" });
    expect(region).toHaveAttribute("tabindex", "0");
    scrollWidth.mockRestore();
    clientWidth.mockRestore();
  });

  it("takes its name from a visible heading when there is no caption", async () => {
    const scrollWidth = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockReturnValue(900);
    const clientWidth = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockReturnValue(320);
    const { container } = render(
      <>
        <h2 id="usage-heading">Usage</h2>
        <Table aria-labelledby="usage-heading">
          <tbody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </Table>
      </>,
    );
    expect(container.querySelector("caption")).toBeNull();
    expect(screen.getByRole("table", { name: "Usage" })).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "Usage" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    scrollWidth.mockRestore();
    clientWidth.mockRestore();
  });

  it("warns in development when a table has no name at all", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Table>
        <tbody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </tbody>
      </Table>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("accessible name"));
    warn.mockRestore();
  });

  it("adds no tab stop when the table fits", () => {
    const { container } = render(
      <Table caption="Narrow table">
        <tbody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </tbody>
      </Table>,
    );
    expect(container.firstElementChild).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Basic sortDirection="ascending" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
