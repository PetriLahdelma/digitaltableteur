import type { ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BillingPage from "./BillingPage";
import ProfilePage from "./ProfilePage";
import TeamPage from "./TeamPage";

const PAGES: [string, ComponentType, string, [string, string][]][] = [
  ["ProfilePage", ProfilePage, "Profile sections", [
    ["Details", "Name and email"],
    ["Security", "Password and two-factor"],
  ]],
  ["BillingPage", BillingPage, "Billing sections", [
    ["Plan", "Pro plan, billed monthly"],
    ["Invoices", "No invoices yet"],
    ["Payment", "Card ending 4242"],
  ]],
  ["TeamPage", TeamPage, "Team sections", [
    ["Members", "3 members"],
    ["Roles", "Admin, Editor, Viewer"],
  ]],
];

describe.each(PAGES)("bench: refactor acceptance, %s", (_name, Page, label, tabs) => {
  it("exposes an accessible tablist with the first tab selected", () => {
    render(<Page />);
    expect(screen.getByRole("tablist", { name: label })).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent?.trim())).toEqual(
      tabs.map(([title]) => title),
    );
    const [firstTitle, firstContent] = tabs[0];
    expect(screen.getByRole("tab", { name: firstTitle })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: firstTitle })).toHaveTextContent(firstContent);
  });

  it("switches panels from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const [firstTitle] = tabs[0];
    const [secondTitle, secondContent] = tabs[1];
    await user.click(screen.getByRole("tab", { name: firstTitle }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: secondTitle })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: secondTitle })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: secondTitle })).toHaveTextContent(secondContent);
    expect(screen.queryByText(tabs[0][1])).not.toBeInTheDocument();
  });
});
