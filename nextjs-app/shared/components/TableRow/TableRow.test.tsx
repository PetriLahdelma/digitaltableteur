import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { TableRow } from "./TableRow";

expect.extend(toHaveNoViolations);

const inTable = (row: React.ReactNode) => (
  <table>
    <caption>People</caption>
    <tbody>{row}</tbody>
  </table>
);

describe("TableRow", () => {
  it("renders a native tr", () => {
    render(inTable(<TableRow><td>Ada</td></TableRow>));
    expect(screen.getByRole("row")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ada" }).parentElement?.tagName).toBe(
      "TR",
    );
  });

  it("marks the selected surface with data-selected", () => {
    const { rerender } = render(inTable(<TableRow><td>Ada</td></TableRow>));
    expect(screen.getByRole("row")).not.toHaveAttribute("data-selected");
    rerender(inTable(<TableRow selected><td>Ada</td></TableRow>));
    expect(screen.getByRole("row")).toHaveAttribute("data-selected");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      inTable(
        <TableRow selected>
          <td>Ada</td>
          <td>Engineer</td>
        </TableRow>,
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
