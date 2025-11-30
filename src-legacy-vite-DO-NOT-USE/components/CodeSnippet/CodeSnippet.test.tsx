import { render, screen } from "@testing-library/react";
import React from "react";

import CodeSnippet from "./CodeSnippet";

describe("CodeSnippet", () => {
  const code = `const answer = 42;\nconsole.log(answer);`;

  it("renders code content", () => {
    render(<CodeSnippet code={code} language="javascript" />);
    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.getByText("const", { exact: false })).toBeInTheDocument();
  });

  it("renders line numbers when enabled", () => {
    render(<CodeSnippet code={code} language="javascript" showLineNumbers />);
    expect(screen.getByText("1", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("2", { selector: "span" })).toBeInTheDocument();
  });

  it("hides line numbers when disabled", () => {
    render(
      <CodeSnippet code={code} language="javascript" showLineNumbers={false} />,
    );
    expect(screen.queryByText("1", { selector: "span" })).toBeNull();
  });

  it("shows copy buttons when allowed", () => {
    render(<CodeSnippet code={code} language="javascript" allowCopy />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Copy w/o comments")).toBeInTheDocument();
  });
});
