import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";

import { SummaryList } from "./SummaryList";

expect.extend(toHaveNoViolations);

const rows = [
  { id: "name", label: "Full name", value: "Petri" },
  { id: "priorities", label: "Top priorities", value: "One library\nAccessible forms" },
  {
    id: "email",
    label: "Email address",
    value: "client@example.com",
    action: <a href="#email">Change<span hidden> email address</span></a>,
  },
];

describe("SummaryList", () => {
  it("renders a description list with one term and definition per row", () => {
    const { container } = render(<SummaryList rows={rows} />);
    const list = container.querySelector("dl");
    expect(list).not.toBeNull();
    expect(screen.getAllByRole("term")).toHaveLength(3);
    expect(screen.getByText("Full name").tagName).toBe("DT");
    expect(screen.getByText("Petri").tagName).toBe("DD");
  });

  it("keeps line breaks in string answers", () => {
    render(<SummaryList rows={rows} />);
    expect(screen.getByText(/One library/).textContent).toBe("One library\nAccessible forms");
  });

  it("renders a row action only when given", () => {
    const { container } = render(<SummaryList rows={rows} />);
    expect(container.querySelectorAll("dd")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Change/ })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SummaryList rows={rows} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
