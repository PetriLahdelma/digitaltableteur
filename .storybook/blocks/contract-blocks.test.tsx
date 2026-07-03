import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import contract from "../../nextjs-app/shared/components/Button/Button.contract.json";
import type { DtContract } from "../lib/contracts";
import { DocHeader } from "./DocHeader";
import { ImportBlock } from "./ImportBlock";
import { UsageSection } from "./UsageSection";
import { BestPractices } from "./BestPractices";
import { AnatomySection } from "./AnatomySection";

const c = contract as unknown as DtContract;

describe("contract blocks", () => {
  it("DocHeader shows name, status, group and figma link", () => {
    render(<DocHeader contract={c} />);
    expect(screen.getByRole("heading", { name: "Button" })).toBeInTheDocument();
    expect(screen.getByText("stable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /figma/i })).toHaveAttribute(
      "href",
      c.figma as string,
    );
  });

  it("ImportBlock renders the @dt import line", () => {
    render(<ImportBlock contract={c} />);
    expect(
      screen.getByText(/import { Button } from "@dt\/Button";/),
    ).toBeInTheDocument();
  });

  it("BestPractices splits do and don't", () => {
    render(<BestPractices contract={c} />);
    expect(screen.getByText(/Reserve variant=primary/)).toBeInTheDocument();
    expect(
      screen.getByText(/Do not place more than one primary/),
    ).toBeInTheDocument();
  });

  it("AnatomySection lists anatomy rows with required marks", () => {
    render(<AnatomySection contract={c} />);
    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.getAllByText("Yes").length).toBeGreaterThan(0);
  });

  it("UsageSection renders the usage description", () => {
    render(<UsageSection contract={c} />);
    expect(screen.getByText(/Button triggers an action/)).toBeInTheDocument();
  });

  it("blocks return null when their data slice is missing", () => {
    const bare = { name: "X", status: "alpha" } as DtContract;
    const { container } = render(
      <>
        <UsageSection contract={bare} />
        <BestPractices contract={bare} />
        <AnatomySection contract={bare} />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
