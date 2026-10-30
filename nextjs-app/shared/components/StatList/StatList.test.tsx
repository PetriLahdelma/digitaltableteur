import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

import { StatList } from "./StatList";
import styles from "./StatList.module.css";

expect.extend(toHaveNoViolations);

const items = [
  { id: "components", value: 191, of: 208, label: "Components", note: "108 stable" },
  { id: "tokens", value: 228, label: "Design tokens" },
];

describe("StatList", () => {
  it("renders a description list with the label before the figure", () => {
    const { container } = render(<StatList items={items} />);
    const list = container.querySelector("dl");
    expect(list).not.toBeNull();
    const first = list?.firstElementChild;
    expect(first?.firstElementChild?.tagName).toBe("DT");
    expect(first?.firstElementChild).toHaveTextContent("Components");
    expect(first?.children[1]?.tagName).toBe("DD");
    expect(first?.children[1]).toHaveTextContent("191");
  });

  it("adds the total and the note only when given", () => {
    render(<StatList items={items} />);
    expect(screen.getByText("of 208")).toBeInTheDocument();
    expect(screen.getByText("108 stable").tagName).toBe("DD");
    expect(screen.getAllByRole("definition")).toHaveLength(3);
  });

  it("applies variant, size and alignment classes", () => {
    const { container } = render(
      <StatList items={items} variant="card" size="lg" align="center" />,
    );
    const list = container.querySelector("dl");
    expect(list).toHaveClass(styles.card, styles.lg, styles.center);
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<StatList items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
