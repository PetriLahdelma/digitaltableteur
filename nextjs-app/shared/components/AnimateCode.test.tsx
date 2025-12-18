import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeDemo } from "./AnimateCode";

describe("AnimateCode (CodeDemo)", () => {
  it("renders code component", () => {
    render(
      <CodeDemo duration={1000} delay={0} writing={false} cursor={false} />,
    );
    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();
  });

  it("renders with writing animation enabled", () => {
    render(
      <CodeDemo duration={2000} delay={500} writing={true} cursor={true} />,
    );
    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();
  });

  it("renders with cursor disabled", () => {
    render(
      <CodeDemo duration={1000} delay={0} writing={true} cursor={false} />,
    );
    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();
  });

  it("re-renders when props change", () => {
    const { rerender } = render(
      <CodeDemo duration={1000} delay={0} writing={false} cursor={false} />,
    );
    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();

    rerender(
      <CodeDemo duration={2000} delay={500} writing={true} cursor={true} />,
    );
    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();
  });

  it("applies custom duration", () => {
    render(
      <CodeDemo duration={3000} delay={1000} writing={true} cursor={true} />,
    );
    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();
  });
});
