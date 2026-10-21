import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { ServicesLedger } from "./ServicesLedger";

const props = {
  title: "Services",
  services: [
    {
      index: "01",
      machineKey: "BUILD_THE_SYSTEM",
      title: "Build the system",
      description: "Design systems that hold up in production.",
      capabilities: ["Tokens", "Machine-readable contracts"],
      href: "/work/a",
      donnyTarget: "home.services.designSystems",
    },
    {
      index: "02",
      machineKey: "DESIGN_THE_PRODUCT",
      title: "Design the product",
      description: "Research, strategy and UX.",
      capabilities: ["Research"],
      href: "/work/b",
    },
  ],
  machineLinks: [{ label: "LLMS", href: "/llms.txt" }],
  labels: {
    view: "View",
    human: "Human",
    machine: "Machine",
    machineTitle: "Studio :: Services",
    machineComment: "# What the studio does, machine-readable.",
    copy: "Copy as Markdown",
    copied: "Copied",
  },
};

describe("ServicesLedger", () => {
  it("renders one linked row per offer under the section heading", () => {
    render(<ServicesLedger {...props} />);
    expect(screen.getByRole("heading", { level: 2, name: "Services" })).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/work/a", "/work/b"]);
    expect(links[0]).toHaveAttribute("data-donny-target", "home.services.designSystems");
    expect(screen.getByText("Machine-readable contracts")).toBeInTheDocument();
  });

  it("switches to the machine view and back", () => {
    render(<ServicesLedger {...props} />);
    const machine = screen.getByRole("button", { name: "Machine" });
    expect(machine).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(machine);
    expect(machine).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("* 01 BUILD_THE_SYSTEM")).toBeInTheDocument();
    expect(screen.getByText(/capabilities: tokens, machine-readable-contracts/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/llms.txt" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Human" }));
    expect(screen.getByRole("link", { name: /Build the system/ })).toBeInTheDocument();
  });

  it("has no axe violations in either view", async () => {
    const { container } = render(<ServicesLedger {...props} />);
    expect(await axe(container)).toHaveNoViolations();
    fireEvent.click(screen.getByRole("button", { name: "Machine" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
