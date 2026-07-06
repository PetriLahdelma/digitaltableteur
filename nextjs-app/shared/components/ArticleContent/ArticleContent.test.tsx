import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ArticleContent, ArticleProse } from "./ArticleContent";

expect.extend(toHaveNoViolations);

const body = (
  <>
    <h2>Section heading</h2>
    <p>Body copy for the article measure.</p>
  </>
);

describe("ArticleContent", () => {
  it("renders its children", () => {
    render(<ArticleContent>{body}</ArticleContent>);
    expect(
      screen.getByRole("heading", { name: "Section heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Body copy for the article measure."),
    ).toBeInTheDocument();
  });

  it("merges a custom className onto the container", () => {
    const { container } = render(
      <ArticleContent className="custom-article">{body}</ArticleContent>,
    );
    expect(container.querySelector(".custom-article")).toBeInTheDocument();
  });

  it("forwards a ref to the inner content wrapper", () => {
    const ref = vi.fn();
    render(<ArticleContent ref={ref}>{body}</ArticleContent>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it("ArticleProse wraps children in the prose typography container", () => {
    render(<ArticleProse>{body}</ArticleProse>);
    expect(
      screen.getByRole("heading", { name: "Section heading" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ArticleContent>{body}</ArticleContent>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
