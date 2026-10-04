import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Section } from "./Section";
import { RelatedSection } from "./RelatedSection";
import { ShowcaseStage } from "./ShowcaseStage";
import type { DtContract } from "../lib/contracts";

describe("Storybook presentation boundaries", () => {
  it("preserves fullscreen intent without changing the demonstrated child", () => {
    const { container } = render(
      <ShowcaseStage layout="fullscreen">
        <button>Example</button>
      </ShowcaseStage>,
    );
    expect(container.firstChild).toHaveAttribute("data-layout", "fullscreen");
    expect(screen.getByRole("button", { name: "Example" })).not.toHaveAttribute(
      "class",
    );
  });
  it("gives custom sections stable IDs for the native Storybook table of contents", () => {
    render(
      <Section block="a11y" heading="Accessibility">
        Evidence
      </Section>,
    );
    expect(
      screen.getByRole("heading", { name: "Accessibility" }),
    ).toHaveAttribute("id", "dt-docs-a11y");
  });

  it("opens related documentation in the manager, never a nested manager iframe", () => {
    render(
      <RelatedSection
        contract={
          { name: "X", status: "alpha", composesWith: ["Button"] } as DtContract
        }
        hrefForComponent={() => "/storybook/?path=/docs/actions-button--docs"}
      />,
    );
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute(
      "target",
      "_top",
    );
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute(
      "href",
      "/storybook/?path=/docs/actions-button--docs",
    );
  });

  it("loads the original local Satoshi fonts relative to the production base", () => {
    for (const file of ["manager-head.html", "preview-head.html"]) {
      const source = readFileSync(`.storybook/${file}`, "utf8");
      expect(source).toContain('url("./fonts/Satoshi-Variable.woff2")');
      expect(source).not.toContain("fonts.googleapis.com");
    }
  });

  it("keeps presentation CSS out of component source and generic element descendants", () => {
    const source = readFileSync(
      ".storybook/blocks/DtDocsContainer.module.css",
      "utf8",
    );
    expect(source).not.toMatch(
      /\.frame\s+(?:h[1-6]|button|input|table|p|span)\b/,
    );
    expect(source).toContain(":global(.sbdocs-content) >");
    const page = readFileSync(".storybook/blocks/DtDocsPage.tsx", "utf8");
    expect(page.match(/styles\.page} sb-unstyled/g)).toHaveLength(2);
  });
});
