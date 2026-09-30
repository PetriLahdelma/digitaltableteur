import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Mermaid } from "./Mermaid";

expect.extend(toHaveNoViolations);

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>Visual diagram</text></svg>',
    }),
  },
}));

const diagramProps = {
  chart: "flowchart LR\n  A --> B",
  title: "Request flow",
  description: "The browser sends a request to the application server.",
  accessibleDetails: (
    <ul>
      <li>
        Browser
        <ul>
          <li>Sends a request to the application server</li>
        </ul>
      </li>
    </ul>
  ),
};

describe("Mermaid", () => {
  it("announces its loading state without naming a generic container", () => {
    render(<Mermaid {...diagramProps} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading diagram");
    expect(status).not.toHaveAttribute("aria-label");
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("names the rendered diagram and exposes a structured text equivalent", async () => {
    render(<Mermaid {...diagramProps} />);

    const diagram = await screen.findByRole("img", {
      name: diagramProps.title,
    });
    expect(diagram).toHaveAccessibleDescription(diagramProps.description);
    expect(diagram).toHaveAttribute("aria-details");
    expect(screen.getByText("Browser")).toBeInTheDocument();
    expect(
      screen.getByText("Sends a request to the application server"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Visual diagram").closest("[aria-hidden='true']"),
    ).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<Mermaid {...diagramProps} />);
    await screen.findByRole("img", { name: diagramProps.title });
    expect(await axe(container)).toHaveNoViolations();
  });
});
