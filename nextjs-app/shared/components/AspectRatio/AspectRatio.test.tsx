import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { AspectRatio } from "./AspectRatio";

expect.extend(toHaveNoViolations);

describe("AspectRatio", () => {
  it("defaults to the 16:9 preset", () => {
    const { container } = render(<AspectRatio>media</AspectRatio>);
    expect((container.firstChild as HTMLElement).className).toContain("aspect-video");
  });

  it("maps each ratio preset to its class", () => {
    const { container } = render(<AspectRatio ratio="1:1">x</AspectRatio>);
    expect((container.firstChild as HTMLElement).className).toContain("aspect-square");
  });

  it("absolutely fills the child inside the clipped frame", () => {
    render(
      <AspectRatio>
        <span data-testid="child">fill</span>
      </AspectRatio>,
    );
    const fillWrapper = screen.getByTestId("child").parentElement as HTMLElement;
    expect(fillWrapper.className).toContain("absolute");
    expect(fillWrapper.className).toContain("inset-0");
  });

  it("has no axe violations with media content", async () => {
    const { container } = render(
      <AspectRatio ratio="1:1">
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Sample" />
      </AspectRatio>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
