import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { articleMdxComponents } from "./ArticlePageTemplate";

type EmbedProps = {
  provider?: string;
  url: string;
  title?: string;
};

const Embed = articleMdxComponents.Embed as ComponentType<EmbedProps>;

describe("ArticlePageTemplate Embed", () => {
  it("replaces a YouTube embed with a named external link and warning", () => {
    render(
      <Embed
        provider="youtube"
        url="https://www.youtube.com/embed/m0b_D2JgZgY?si=tracking"
        title="Workflow tips: Figma MCP overview"
      />,
    );

    const link = screen.getByRole("link", {
      name: "Workflow tips: Figma MCP overview (watch on YouTube, opens in a new tab)",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=m0b_D2JgZgY",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
    expect(link.closest("[lang]")).toHaveAttribute("lang", "en");
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("uses a meaningful fallback title", () => {
    render(<Embed provider="youtube" url="https://youtu.be/m0b_D2JgZgY" />);

    expect(
      screen.getByRole("link", {
        name: "Supplementary article video (watch on YouTube, opens in a new tab)",
      }),
    ).toBeInTheDocument();
  });

  it.each([
    "not a URL",
    "javascript:alert(1)",
    "https://example.com/embed/m0b_D2JgZgY",
    "https://www.youtube.com/embed/not%20valid",
  ])("does not render an unsafe or malformed YouTube URL: %s", (url) => {
    const { container } = render(
      <Embed provider="youtube" url={url} title="Unsafe video" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps a named Vimeo iframe for a valid HTTP URL", () => {
    render(
      <Embed
        provider="vimeo"
        url="https://player.vimeo.com/video/123456"
        title="Vimeo demonstration"
      />,
    );

    expect(screen.getByTitle("Vimeo demonstration")).toHaveAttribute(
      "src",
      "https://player.vimeo.com/video/123456",
    );
  });
});
