import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Stack } from "./Stack";

expect.extend(toHaveNoViolations);

describe("Stack", () => {
  it("renders a vertical flex column by default", () => {
    const { container } = render(
      <Stack>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("flex-col");
    expect(el.className).toContain("gap-4");
  });

  it("switches to a row for horizontal direction", () => {
    const { container } = render(
      <Stack direction="horizontal">
        <span>a</span>
      </Stack>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("flex-row");
  });

  it("maps the gap token scale", () => {
    const { container } = render(<Stack gap="xl"><span>a</span></Stack>);
    expect((container.firstChild as HTMLElement).className).toContain("gap-8");
  });

  it("renders as a semantic list when asked", () => {
    render(
      <Stack as="ul">
        <li>one</li>
        <li>two</li>
      </Stack>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Stack as="ul">
        <li>one</li>
        <li>two</li>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
