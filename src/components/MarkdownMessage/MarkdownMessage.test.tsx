import { render, screen } from "@testing-library/react";
import React from "react";
import MarkdownMessage from "./MarkdownMessage";

describe("MarkdownMessage", () => {
  it("renders fallback when content empty", () => {
    render(
      <MarkdownMessage content="" fallback="Loading…" data-role="assistant" />,
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders basic markdown (heading, list, code)", () => {
    const md =
      "# Title\n\n- item one\n- item two\n\nInline code: `const x = 1;`";
    render(<MarkdownMessage content={md} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Title",
    );
    expect(screen.getByText("item one")).toBeInTheDocument();
    expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
  });

  it("renders link with rel attribute", () => {
    const md = "A [link](https://example.com)";
    render(<MarkdownMessage content={md} />);
    const link = screen.getByRole("link", { name: /link/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
