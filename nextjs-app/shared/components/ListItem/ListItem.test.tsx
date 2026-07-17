import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import ListItem from "./ListItem";

expect.extend(toHaveNoViolations);

describe("ListItem", () => {
  it("renders the label", () => {
    render(<ListItem>Rename</ListItem>);
    expect(screen.getByText("Rename")).toBeInTheDocument();
  });

  it("renders icon and trailingIcon as decorative", () => {
    const { container } = render(
      <ListItem icon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
        Open
      </ListItem>,
    );
    const lead = container.querySelector('[data-slot="icon"]');
    const trail = container.querySelector('[data-slot="trailing-icon"]');
    expect(lead).toHaveAttribute("aria-hidden", "true");
    expect(trail).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes meta content to AT (no aria-hidden)", () => {
    const { container } = render(<ListItem meta="⌘K">Search</ListItem>);
    const meta = container.querySelector('[data-slot="meta"]');
    expect(meta).not.toHaveAttribute("aria-hidden");
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("renders the selected check as decorative", () => {
    const { container } = render(<ListItem selected>Finnish</ListItem>);
    const check = container.querySelector('[data-slot="check"]');
    expect(check).toBeTruthy();
    expect(check).toHaveAttribute("aria-hidden", "true");
  });

  it("applies tone and state classes", () => {
    const { container, rerender } = render(<ListItem tone="destructive">Delete</ListItem>);
    expect(container.firstElementChild!.className).toMatch(/destructive/);
    rerender(<ListItem highlighted>Row</ListItem>);
    expect(container.firstElementChild!.className).toMatch(/highlighted/);
    rerender(<ListItem disabled>Row</ListItem>);
    expect(container.firstElementChild!.className).toMatch(/disabled/);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ul>
        <li>
          <ListItem icon={<svg />} meta="Value" trailingIcon={<svg />} selected>
            Label
          </ListItem>
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
