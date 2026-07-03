import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Spacer } from "./Spacer";

expect.extend(toHaveNoViolations);

describe("Spacer", () => {
  it("is hidden from the accessibility tree", () => {
    const { container } = render(<Spacer />);
    expect((container.firstChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("maps size to a height class on the vertical axis", () => {
    const { container } = render(<Spacer size="xl" />);
    expect((container.firstChild as HTMLElement).className).toContain("h-12");
  });

  it("maps size to a width class on the horizontal axis", () => {
    const { container } = render(<Spacer size="xl" axis="horizontal" />);
    expect((container.firstChild as HTMLElement).className).toContain("w-12");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        before
        <Spacer />
        after
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
