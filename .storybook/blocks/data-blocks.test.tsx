import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import contract from "../../nextjs-app/shared/components/Button/Button.contract.json";
import type { DtContract } from "../lib/contracts";
import { ThemingSection } from "./ThemingSection";
import { A11ySection } from "./A11ySection";
import { RelatedSection } from "./RelatedSection";

const c = contract as unknown as DtContract;

describe("data blocks", () => {
  it("ThemingSection lists contract tokens with categories", () => {
    render(<ThemingSection contract={c} />);
    expect(screen.getByText("--color-primary")).toBeInTheDocument();
    expect(screen.getByText("--space-internal-8")).toBeInTheDocument();
  });

  it("ThemingSection prefers theming.vars when present", () => {
    const withVars = {
      ...c,
      theming: {
        vars: [
          {
            name: "--button-accent",
            description: "Accent override",
            default: "var(--color-primary)",
          },
        ],
      },
    } as DtContract;
    render(<ThemingSection contract={withVars} />);
    expect(screen.getByText("--button-accent")).toBeInTheDocument();
    expect(screen.queryByText("--color-primary")).not.toBeInTheDocument();
  });

  it("A11ySection shows keyboard keys and aria requirements", () => {
    render(<A11ySection contract={c} />);
    expect(screen.getByText("Enter")).toBeInTheDocument();
    expect(screen.getByText("aria-busy when loading")).toBeInTheDocument();
    expect(screen.getByText(/forced colors verified/i)).toBeInTheDocument();
  });

  it("RelatedSection renders a link per composesWith entry when href resolves", () => {
    render(<RelatedSection contract={c} hrefForComponent={() => "#x"} />);
    expect(screen.getAllByRole("link")).toHaveLength(
      (c.composesWith ?? []).length,
    );
  });

  it("RelatedSection falls back to plain chips without hrefs", () => {
    render(<RelatedSection contract={c} hrefForComponent={() => null} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Modal")).toBeInTheDocument();
  });

  it("all three return null when their data slice is missing", () => {
    const bare = { name: "X", status: "alpha" } as DtContract;
    const { container } = render(
      <>
        <ThemingSection contract={bare} />
        <A11ySection contract={bare} />
        <RelatedSection contract={bare} hrefForComponent={() => null} />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
