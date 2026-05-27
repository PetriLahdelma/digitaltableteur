import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CodeDemo } from "./AnimateCode";

describe("AnimateCode (CodeDemo)", () => {
  it("renders nothing while the demo is disabled in production builds", () => {
    const { container } = render(
      <CodeDemo duration={1000} delay={0} writing={false} cursor={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("accepts animation props without throwing", () => {
    expect(() =>
      render(
        <CodeDemo duration={3000} delay={1000} writing cursor />,
      ),
    ).not.toThrow();
  });
});
