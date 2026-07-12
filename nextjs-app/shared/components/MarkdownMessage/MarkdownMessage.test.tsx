import { render, screen } from "@testing-library/react";
import React from "react";
import MarkdownMessage from "@dt/MarkdownMessage";

describe("MarkdownMessage", () => {
  it("renders fallback when content empty", () => {
    const { container } = render(
      <MarkdownMessage content="" fallback="Loading…" data-role="assistant" />,
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-live", "polite");
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

  it("skips raw HTML element parsing but preserves plain text when skipHtml is active", () => {
    const md =
      "Here is raw HTML:<script>alert('x')</script><span style=\"color:red\">red text</span>**bold**";
    const { container } = render(<MarkdownMessage content={md} />);
    // Bold markdown should render normally
    expect(screen.getByText(/bold/i)).toBeInTheDocument();
    // The raw HTML tags should not exist as elements
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("span[style]")).toBeNull();
    // Their inner text is treated as plain text (not removed)
    expect(screen.getByText(/red text/)).toBeInTheDocument();
    expect(screen.getByText(/alert\('x'\)/)).toBeInTheDocument();
  });
});
