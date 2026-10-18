import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ManifestoSection } from "./ManifestoSection";

const tokens = [
  { text: "Digitaltableteur is", phrase: false },
  { text: "No-Fluff Thinking", phrase: true },
  { text: "AI-Powered Craft", phrase: true },
  { text: "Technology With Taste", phrase: true },
];

describe("ManifestoSection", () => {
  it("renders the phrases as plain text with a decorative mark between them", () => {
    const { container } = render(
      <ManifestoSection title="Manifesto" tokens={tokens} />,
    );
    const paragraph = container.querySelector("p")!;
    expect(paragraph.textContent).toBe(
      "Digitaltableteur is No-Fluff Thinking\u00a0× AI-Powered Craft\u00a0× Technology With Taste",
    );
    const marks = container.querySelectorAll('[aria-hidden="true"]');
    expect(marks).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Manifesto" })).toBeInTheDocument();
  });

  it("has no highlight or motion on the phrases", () => {
    const { container } = render(
      <ManifestoSection title="Manifesto" tokens={tokens} />,
    );
    expect(container.querySelector(".bg-primary, .shadow-sm")).toBeNull();
  });
});
