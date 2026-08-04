import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpeciesTable from "./SpeciesTable";

function headerFor(name: RegExp) {
  return screen
    .getAllByRole("columnheader")
    .find((header) => name.test(header.textContent ?? ""));
}

describe("bench: table acceptance", () => {
  it("renders an accessible captioned table of every species", () => {
    render(<SpeciesTable />);
    const table = screen.getByRole("table");
    expect(table.querySelector("caption")?.textContent).toBeTruthy();
    expect(screen.getByText("Common swift")).toBeInTheDocument();
    expect(screen.getByText("Whooper swan")).toBeInTheDocument();
    expect(screen.getByText("Corvidae")).toBeInTheDocument();
  });

  it("sorts by name via the column header with aria-sort semantics", async () => {
    const user = userEvent.setup();
    render(<SpeciesTable />);
    const nameHeader = headerFor(/name/i);
    expect(nameHeader).toBeTruthy();
    const trigger = within(nameHeader as HTMLElement).queryByRole("button");
    await user.click(trigger ?? (nameHeader as HTMLElement));
    expect(headerFor(/name/i)).toHaveAttribute("aria-sort", "ascending");
    await user.click(
      within(headerFor(/name/i) as HTMLElement).queryByRole("button") ??
        (headerFor(/name/i) as HTMLElement),
    );
    expect(headerFor(/name/i)).toHaveAttribute("aria-sort", "descending");
  });

  it("selects rows via accessibly named checkboxes", async () => {
    const user = userEvent.setup();
    render(<SpeciesTable />);
    const checkboxes = screen.getAllByRole("checkbox", { name: /select/i });
    // At least one checkbox per data row (a select-all is allowed on top).
    expect(checkboxes.length).toBeGreaterThanOrEqual(6);
    const rowBox = checkboxes[checkboxes.length - 1];
    expect(rowBox).not.toBeChecked();
    await user.click(rowBox);
    expect(rowBox).toBeChecked();
  });
});
