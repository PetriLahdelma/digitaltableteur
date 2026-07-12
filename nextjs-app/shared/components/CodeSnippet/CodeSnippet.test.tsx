import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";

import CodeSnippet from "@dt/CodeSnippet";

// Mock clipboard API
const mockWriteText = vi.fn(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("CodeSnippet", () => {
  const code = `const answer = 42;\nconsole.log(answer);`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Multi variant (default)", () => {
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
        <CodeSnippet
          code={code}
          language="javascript"
          showLineNumbers={false}
        />,
      );
      expect(screen.queryByText("1", { selector: "span" })).toBeNull();
    });

    it("shows copy button when allowed", () => {
      render(<CodeSnippet code={code} language="javascript" allowCopy />);
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });

    it("shows expand/collapse when maxLines exceeded", () => {
      const longCode = Array(15).fill("console.log('line');").join("\n");
      render(
        <CodeSnippet
          code={longCode}
          language="javascript"
          variant="multi"
          maxLines={10}
        />,
      );

      expect(screen.getByText("Show more")).toBeInTheDocument();
    });

    it("toggles between show more and show less", async () => {
      const longCode = Array(15).fill("console.log('line');").join("\n");
      render(
        <CodeSnippet
          code={longCode}
          language="javascript"
          variant="multi"
          maxLines={10}
        />,
      );

      const button = screen.getByText("Show more");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Show less")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Show less"));

      await waitFor(() => {
        expect(screen.getByText("Show more")).toBeInTheDocument();
      });
    });

    it("links the expand control to the code element", async () => {
      const longCode = Array(15).fill("console.log('line');").join("\n");
      const { container } = render(
        <CodeSnippet
          code={longCode}
          language="javascript"
          variant="multi"
          maxLines={10}
        />,
      );

      const codeElement = container.querySelector("code");
      const button = screen.getByRole("button", { name: "Show more" });
      expect(codeElement).toHaveAttribute("id");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-controls", codeElement?.id);

      fireEvent.click(button);

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Show less" }),
        ).toHaveAttribute("aria-expanded", "true"),
      );
    });

    // Regression: maxLines=0 (clamp disabled) made hasOverflow the NUMBER 0,
    // which {hasOverflow && ...} rendered as a literal "0" in the figure.
    it("does not leak a stray '0' when maxLines is 0", () => {
      const { container } = render(
        <CodeSnippet
          code={code}
          language="javascript"
          variant="multi"
          maxLines={0}
        />,
      );
      const figure = container.querySelector("figure");
      const strayText = Array.from(figure?.childNodes ?? []).filter(
        (node) => node.nodeType === Node.TEXT_NODE,
      );
      expect(strayText).toHaveLength(0);
      expect(screen.queryByText("Show more")).not.toBeInTheDocument();
    });
  });

  describe("Single variant", () => {
    it("renders single line with simple copy button", () => {
      render(
        <CodeSnippet
          code="npm install package"
          language="bash"
          variant="single"
          showLineNumbers={false}
        />,
      );

      expect(screen.getByText("Copy")).toBeInTheDocument();
      expect(screen.queryByText("Copy w/o comments")).not.toBeInTheDocument();
    });

    it("does not show line numbers by default in single variant", () => {
      render(
        <CodeSnippet
          code="npm install package"
          language="bash"
          variant="single"
          showLineNumbers={false}
        />,
      );

      expect(
        screen.queryByText("1", { selector: "span[aria-hidden='true']" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Inline variant", () => {
    it("renders inline code element", () => {
      render(
        <CodeSnippet code="npm install" language="bash" variant="inline" />,
      );

      const codeElement = screen.getByRole("button");
      expect(codeElement.tagName).toBe("CODE");
    });

    it("is clickable when copy is allowed", () => {
      render(
        <CodeSnippet
          code="test code"
          language="bash"
          variant="inline"
          allowCopy
        />,
      );

      const codeElement = screen.getByRole("button");
      expect(codeElement).toHaveAttribute("role", "button");
      expect(codeElement).toHaveAttribute("tabIndex", "0");
    });

    it("copies to clipboard on click", async () => {
      const user = userEvent.setup();
      render(
        <CodeSnippet
          code="copy me"
          language="bash"
          variant="inline"
          allowCopy
        />,
      );

      const codeElement = screen.getByRole("button");
      await user.click(codeElement);

      // Verify toast appears
      await waitFor(() => {
        expect(screen.getByText("Copied to clipboard")).toBeInTheDocument();
      });
    });

    it("copies to clipboard on Enter key", async () => {
      render(
        <CodeSnippet
          code="copy me"
          language="bash"
          variant="inline"
          allowCopy
        />,
      );

      const codeElement = screen.getByRole("button");
      codeElement.focus();
      fireEvent.keyDown(codeElement, { key: "Enter" });

      // Verify toast appears
      await waitFor(() => {
        expect(screen.getByText("Copied to clipboard")).toBeInTheDocument();
      });
    });

    it("does not show toolbar or copy button", () => {
      render(
        <CodeSnippet code="inline code" language="bash" variant="inline" />,
      );

      expect(screen.queryByText("bash")).not.toBeInTheDocument();
    });
  });

  describe("Copy functionality", () => {
    it("calls onCopy callback when copy succeeds", async () => {
      const onCopy = vi.fn();
      const user = userEvent.setup();

      render(
        <CodeSnippet
          code={code}
          language="javascript"
          allowCopy
          onCopy={onCopy}
        />,
      );

      const copyButton = screen.getByText("Copy");
      await user.click(copyButton);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalled();
      });
    });
  });
});
