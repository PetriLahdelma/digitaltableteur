import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import contract from "../../nextjs-app/shared/components/Button/Button.contract.json";
import type { DtContract } from "../lib/contracts";
import { DocHeader } from "./DocHeader";
import { ImportBlock } from "./ImportBlock";
import { UsageSection } from "./UsageSection";
import { BestPractices } from "./BestPractices";
import { AnatomySection } from "./AnatomySection";
import { WebComponentUsage } from "./DtDocsPage";
import { WebComponentApiSection } from "./WebComponentApiSection";

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
    expect(
      screen.getByRole("navigation", { name: "Implementation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("React")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Web component" })).toHaveAttribute(
      "href",
      "/?path=/docs/web-components-actions-button--docs",
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

  it("omits implementation navigation without a native counterpart", () => {
    render(
      <DocHeader
        contract={{ name: "NonNative", status: "stable" } as DtContract}
      />,
    );
    expect(
      screen.queryByRole("navigation", { name: "Implementation" }),
    ).not.toBeInTheDocument();
  });

  it("links multiword component names to Storybook's kebab-case story IDs", () => {
    render(
      <DocHeader
        contract={{ name: "ButtonGroup", status: "stable" } as DtContract}
      />,
    );
    expect(screen.getByRole("link", { name: "Web component" })).toHaveAttribute(
      "href",
      "/?path=/docs/web-components-actions-buttongroup--docs",
    );
  });

  it("links web-component docs back to the canonical React docs", () => {
    render(
      <DocHeader
        contract={c}
        implementation="web-component"
        implementationStatus="beta"
      />,
    );
    expect(screen.getByText("Web component")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByLabelText("Lifecycle status")).toHaveTextContent(
      "APIstableImplementationbeta",
    );
    expect(screen.getByRole("link", { name: "React" })).toHaveAttribute(
      "href",
      "/?path=/docs/actions-button--docs",
    );
  });

  it("renders native docs when optional metadata arrays are omitted", () => {
    render(
      <>
        <WebComponentUsage
          description="Native loading indicator."
          tagName="dt-spinner"
        />
        <WebComponentApiSection />
      </>,
    );
    expect(screen.getByRole("heading", { name: "Usage" })).toBeInTheDocument();
    expect(screen.getByText(/<dt-spinner>/)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Native API" }),
    ).not.toBeInTheDocument();
  });
});
