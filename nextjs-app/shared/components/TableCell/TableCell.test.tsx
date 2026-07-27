import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { TableCell } from "./TableCell";

expect.extend(toHaveNoViolations);

const inRow = (cell: React.ReactNode) => (
  <table>
    <caption>People</caption>
    <tbody>
      <tr>{cell}</tr>
    </tbody>
  </table>
);

describe("TableCell", () => {
  it("renders a native td", () => {
    render(inRow(<TableCell>Ada</TableCell>));
    expect(screen.getByRole("cell", { name: "Ada" }).tagName).toBe("TD");
  });

  it("defaults numeric cells to end alignment", () => {
    render(inRow(<TableCell numeric>8</TableCell>));
    expect(screen.getByRole("cell", { name: "8" })).toHaveAttribute(
      "data-align",
      "end",
    );
  });

  it("respects an explicit align over numeric", () => {
    render(
      inRow(
        <TableCell numeric align="center">
          8
        </TableCell>,
      ),
    );
    expect(screen.getByRole("cell", { name: "8" })).toHaveAttribute(
      "data-align",
      "center",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      inRow(
        <>
          <TableCell>Ada</TableCell>
          <TableCell numeric>8</TableCell>
        </>,
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
