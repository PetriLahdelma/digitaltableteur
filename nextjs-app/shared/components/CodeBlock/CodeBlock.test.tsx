import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

expect.extend(toHaveNoViolations);

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
});

/* userEvent.setup() installs its own clipboard stub, so ours goes on after. */
function setup(options?: Parameters<typeof userEvent.setup>[0]) {
  const user = userEvent.setup(options);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return user;
}

const lines = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-line]"));

/* The shape rehype-pretty-code hands over from MDX. */
const shikiTree = (
  <pre data-language="ts" tabIndex={0}>
    <code data-language="ts" data-line-numbers="">
      <span data-line="">
        <span style={{ "--shiki-light": "#a0111f" } as React.CSSProperties}>const</span>
        {" a = 1;"}
      </span>
      {"\n"}
      <span data-line="" data-highlighted-line="" data-highlighted-line-id="removed">
        {"const b = 2;"}
      </span>
      {"\n"}
      <span data-line="" data-highlighted-line="" data-highlighted-line-id="added">
        {"const b = 3;"}
      </span>
    </code>
  </pre>
);

describe("CodeBlock", () => {
  it("shows the filename, language and copy button in the header", () => {
    render(<CodeBlock code="const a = 1;" language="ts" filename="a.ts" />);
    expect(screen.getByText("a.ts")).toBeInTheDocument();
    expect(screen.getByText("ts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("floats the copy button when there is no header", () => {
    const { container } = render(<CodeBlock code="ls" language="bash" />);
    expect(container.querySelector("[data-header]")).toBeNull();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("highlights the requested lines and leaves the rest plain", () => {
    const { container } = render(
      <CodeBlock code={"a\nb\nc\nd"} language="text" highlightLines="2-3" />,
    );
    const states = lines(container).map((line) =>
      line.hasAttribute("data-highlighted-line"),
    );
    expect(states).toEqual([false, true, true, false]);
  });

  it("turns a diff into added and removed rows and copies the result", async () => {
    const user = setup();
    const { container } = render(
      <CodeBlock code={"keep\n-old\n+new"} language="diff" filename="x.js" />,
    );
    const ids = lines(container).map((line) =>
      line.getAttribute("data-highlighted-line-id"),
    );
    expect(ids).toEqual([null, "removed", "added"]);
    expect(lines(container)[1]).toHaveTextContent(/^old$/);
    expect(lines(container)[1]).toHaveAttribute("data-sign-label", "Removed line");

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("keep\nnew"));
    expect(await screen.findByRole("status")).toHaveTextContent("Copied");
  });

  it("highlights a code string with the shared syntax roles", () => {
    const { container } = render(
      <CodeBlock code={'const greeting = "hi";'} language="ts" />,
    );
    expect(container.querySelector('[data-syntax="keyword"]')).toHaveTextContent(
      "const",
    );
    expect(container.querySelector('[data-syntax="string"]')).toHaveTextContent(
      '"hi"',
    );
  });

  it("reads language, numbers and diff from a Shiki tree", async () => {
    const user = setup();
    const { container } = render(<CodeBlock filename="a.ts">{shikiTree}</CodeBlock>);
    expect(screen.getByText("ts")).toBeInTheDocument();
    expect(container.querySelector("[data-line-numbers]")).not.toBeNull();
    expect(container.querySelector("[data-diff]")).not.toBeNull();
    expect(container.querySelector("pre")).not.toHaveAttribute("tabindex");
    expect(lines(container)[2]).toHaveAttribute("data-sign-label", "Added line");

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("const a = 1;\nconst b = 3;"),
    );
  });

  it("turns the markers of a Shiki diff block into rows", async () => {
    const user = setup();
    const diffTree = (
      <pre data-language="diff">
        <code data-language="diff">
          <span data-line=""><span style={{ "--shiki-light": "#000" } as React.CSSProperties}>{" keep"}</span></span>
          <span data-line=""><span style={{ "--shiki-light": "#a0111f" } as React.CSSProperties}>{"-old"}</span></span>
          <span data-line=""><span style={{ "--shiki-light": "#024c1a" } as React.CSSProperties}>{"+new"}</span></span>
        </code>
      </pre>
    );
    const { container } = render(<CodeBlock>{diffTree}</CodeBlock>);
    const rows = lines(container);
    expect(rows.map((row) => row.getAttribute("data-highlighted-line-id"))).toEqual([
      null,
      "removed",
      "added",
    ]);
    expect(rows.map((row) => row.textContent)).toEqual(["keep", "old", "new"]);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("keep\nnew"));
  });

  it("finds the code element when MDX maps code to a component", () => {
    const MdxCode = (props: React.ComponentProps<"code">) => <code {...props} />;
    const { container } = render(
      <CodeBlock>
        <pre data-language="ts">
          <MdxCode data-language="ts" data-line-numbers="">
            <span data-line="">const a = 1;</span>
          </MdxCode>
        </pre>
      </CodeBlock>,
    );
    expect(container.querySelector("code")?.className).toMatch(/code/);
    expect(container.querySelector("[data-line-numbers]")).not.toBeNull();
  });

  it("renders a figure with a caption", () => {
    render(<CodeBlock code="x" language="text" caption="What it does" />);
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(screen.getByText("What it does").tagName).toBe("FIGCAPTION");
  });

  it("puts a terminal block in the dark theme", () => {
    const { container } = render(
      <CodeBlock code="ls" language="bash" theme="terminal" />,
    );
    const card = container.querySelector("[data-copyable]");
    expect(card).toHaveClass("themeDark");
    expect(container.firstElementChild).not.toHaveClass("themeDark");
  });

  it("can hide the copy button", () => {
    render(<CodeBlock code="x" language="text" copyable={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <CodeBlock
        code={"keep\n-old\n+new"}
        language="diff"
        filename="x.js"
        lineNumbers
        caption="A diff"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
