import { render, screen } from "@testing-library/react";
import StatusPanel from "./StatusPanel";

describe("bench: repair acceptance", () => {
  it("renders the intended panel content", () => {
    render(<StatusPanel />);
    expect(
      screen.getByRole("region", { name: "Deployment status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Building")).toBeInTheDocument();
    expect(screen.getByText("Stable")).toBeInTheDocument();
    const kbd = document.querySelector("kbd");
    expect(kbd).not.toBeNull();
    expect(kbd?.textContent).toContain("L");
  });
});
