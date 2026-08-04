import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaxonomyTree from "./TaxonomyTree";

describe("bench: tree acceptance", () => {
  it("renders an accessible tree with collapsed branches", () => {
    render(<TaxonomyTree />);
    expect(screen.getByRole("tree")).toBeInTheDocument();
    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBeGreaterThanOrEqual(3);
    const branch = items.find(
      (item) => item.getAttribute("aria-expanded") !== null,
    );
    expect(branch).toBeTruthy();
    expect(branch).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Corvidae")).not.toBeInTheDocument();
  });

  it("expands a branch to reveal its children", async () => {
    const user = userEvent.setup();
    render(<TaxonomyTree />);
    await user.click(screen.getByText("Passeriformes"));
    expect(await screen.findByText("Corvidae")).toBeInTheDocument();
    const branch = screen
      .getAllByRole("treeitem")
      .find((item) => item.textContent?.includes("Passeriformes"));
    expect(branch).toHaveAttribute("aria-expanded", "true");
  });

  it("moves focus with ArrowDown per the tree keyboard model", async () => {
    const user = userEvent.setup();
    render(<TaxonomyTree />);
    await user.tab();
    const first = document.activeElement as HTMLElement;
    expect(first).not.toBeNull();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).not.toBe(first);
  });
});
