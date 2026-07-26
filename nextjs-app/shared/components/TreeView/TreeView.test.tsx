import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { TreeView, type TreeViewNode } from "./TreeView";

expect.extend(toHaveNoViolations);

const nodes: TreeViewNode[] = [
  {
    id: "parent",
    label: "Parent",
    children: [
      { id: "first", label: "First child" },
      { id: "second", label: "Second child" },
    ],
  },
  { id: "sibling", label: "Sibling" },
];

describe("TreeView", () => {
  it("renders the tree and only visible nodes", () => {
    render(<TreeView aria-label="Files" nodes={nodes} />);
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument();
    expect(screen.queryByRole("treeitem", { name: "First child" })).toBeNull();
  });

  it("expands and traverses children with arrow keys", async () => {
    const user = userEvent.setup();
    render(<TreeView aria-label="Files" nodes={nodes} />);
    const parent = screen.getByRole("treeitem", { name: "Parent" });
    parent.focus();

    await user.keyboard("{ArrowRight}");
    expect(parent).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("treeitem", { name: "First child" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(parent).toHaveFocus();
  });

  it("selects enabled nodes through the keyboard", async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();
    render(
      <TreeView
        aria-label="Files"
        nodes={nodes}
        onSelectedIdChange={onSelectedIdChange}
      />,
    );
    const sibling = screen.getByRole("treeitem", { name: "Sibling" });
    sibling.focus();
    await user.keyboard("{Enter}");
    expect(onSelectedIdChange).toHaveBeenCalledWith("sibling");
    expect(sibling).toHaveAttribute("aria-selected", "true");
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <TreeView
        aria-label="Files"
        nodes={nodes}
        defaultExpandedIds={["parent"]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
