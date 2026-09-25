import { render, screen, within } from "@testing-library/react";
import PlanCard from "./PlanCard";

describe("bench: tokens acceptance", () => {
  it("renders the plan content with an action", () => {
    render(
      <PlanCard
        name="Pro"
        price="€49 / month"
        features={["Unlimited projects", "Priority support", "SSO"]}
        highlighted
      />,
    );
    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    expect(screen.getByText("€49 / month")).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    const action =
      screen.queryByRole("button", { name: "Choose Pro" }) ??
      screen.queryByRole("link", { name: "Choose Pro" });
    expect(action).not.toBeNull();
  });
});
