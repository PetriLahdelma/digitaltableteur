import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Progress from "./Progress";

expect.extend(toHaveNoViolations);

const here = dirname(fileURLToPath(import.meta.url));

describe("Progress", () => {
  it("exposes determinate progressbar semantics", () => {
    render(<Progress value={50} label="Upload progress" />);
    const bar = screen.getByRole("progressbar", { name: "Upload progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("drops aria-valuenow in indeterminate mode", () => {
    render(<Progress indeterminate label="Loading panel" />);
    const bar = screen.getByRole("progressbar", { name: "Loading panel" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Progress value={72} label="Determinate" />
        <Progress indeterminate label="Indeterminate" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // Static guard: the Vitest CSS proxy fabricates a class for any styles.x
  // key, so a missing .indeterminate rule would render class="undefined" in
  // production while staying green in render tests.
  it("every styles.x reference has a matching .x rule", () => {
    const tsx = readFileSync(join(here, "Progress.tsx"), "utf8");
    const css = readFileSync(join(here, "Progress.module.css"), "utf8");
    const referenced = new Set<string>();
    for (const match of tsx.matchAll(/\bstyles\.([A-Za-z_$][\w$]*)/g)) {
      referenced.add(match[1]);
    }
    const missing = [...referenced].filter(
      (cls) => !new RegExp(`\\.${cls}(?![\\w-])`).test(css),
    );
    expect(missing).toEqual([]);
  });
});
