import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectDirectory from "./ProjectDirectory";

function setup() {
  const user = userEvent.setup();
  render(<ProjectDirectory />);
  const items = () =>
    within(screen.getByRole("list", { name: "Projects" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent ?? "");
  const status = () => screen.getByRole("status");
  const chip = (name: string) => screen.getByRole("button", { name });
  return { user, items, status, chip };
}

describe("bench: directory acceptance", () => {
  it("shows the first page, a live count, and pagination", () => {
    const { items, status, chip } = setup();
    expect(status()).toHaveTextContent(/^23 projects$/);
    expect(items()).toHaveLength(5);
    expect(items()[0]).toContain("Aurora");
    expect(chip("All")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  });

  it("pages through results", async () => {
    const { user, items } = setup();
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(items()[0]).toContain("Fjord");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("filters by category as a single-select toggle and resets to page 1", async () => {
    const { user, items, status, chip } = setup();
    await user.click(screen.getByRole("button", { name: "Page 3" }));
    await user.click(chip("Design"));
    expect(chip("Design")).toHaveAttribute("aria-pressed", "true");
    expect(chip("All")).toHaveAttribute("aria-pressed", "false");
    expect(status()).toHaveTextContent(/^9 projects$/);
    expect(items()[0]).toContain("Aurora");
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  });

  it("searches by name, resets paging, and uses the singular", async () => {
    const { user, items, status } = setup();
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    await user.type(screen.getByRole("searchbox", { name: "Search projects" }), "UMB");
    expect(items()).toEqual([expect.stringContaining("Umber")]);
    expect(status()).toHaveTextContent(/^1 project$/);
  });

  it("explains an empty result and hides pagination", async () => {
    const { user, status } = setup();
    await user.type(screen.getByRole("searchbox", { name: "Search projects" }), "zzz");
    expect(screen.getByText("No projects match your filters")).toBeInTheDocument();
    expect(status()).toHaveTextContent(/^0 projects$/);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
