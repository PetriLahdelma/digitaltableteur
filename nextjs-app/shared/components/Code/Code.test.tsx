import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Code } from "./Code";

expect.extend(toHaveNoViolations);

describe("Code", () => {
  it("renders a code element with the size class", () => {
    render(<Code size="lg">app/page.tsx</Code>);
    const code = screen.getByText("app/page.tsx");
    expect(code.tagName).toBe("CODE");
    expect(code.className).toMatch(/lg/);
  });

  it("defaults to md", () => {
    render(<Code>init</Code>);
    expect(screen.getByText("init").className).toMatch(/md/);
  });

  it("takes the surrounding size with size inherit", () => {
    render(<Code size="inherit">AGENTS.md</Code>);
    expect(screen.getByText("AGENTS.md").className).toMatch(/inherit/);
  });

  it("has no axe violations inside prose", async () => {
    const { container } = render(
      <p>
        Run <Code>doctor</Code> first.
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
