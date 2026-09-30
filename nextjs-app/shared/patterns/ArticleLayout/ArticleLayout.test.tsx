import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleLayout } from "./ArticleLayout";

describe("ArticleLayout", () => {
  it("does not add nested main landmarks and defaults English article copy", () => {
    const { container } = render(
      <main>
        <ArticleLayout
          nav={<button type="button">Takaisin</button>}
          hero={<h1>Article title</h1>}
          sidebar={<nav aria-label="On this page" />}
          showReadingProgress={false}
        >
          <p>Article body</p>
        </ArticleLayout>
      </main>,
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getByRole("article")).not.toHaveAttribute("lang");
    expect(
      screen.getByRole("heading", { name: "Article title" }).closest("header"),
    ).toHaveAttribute("lang", "en");
    expect(screen.getByText("Article body").closest("[lang]")).toHaveAttribute(
      "lang",
      "en",
    );
    expect(
      screen.getByRole("button", { name: "Takaisin" }).closest("[lang]"),
    ).toBeNull();
  });
});
