import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils/render";
import { LogoReveal } from "./LogoReveal";

describe("LogoReveal", () => {
  it("renders a static logo and requires user action to animate it", () => {
    const { container } = renderWithProviders(
      <LogoReveal
        logoSrc="/logo.svg"
        wordmarkSrc="/wordmark.svg"
        ariaLabel="KnobSmith Audio logo"
        playLabel="Play logo animation"
      />,
    );

    expect(
      screen.getByRole("img", { name: "KnobSmith Audio logo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play logo animation" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("img[alt='']")).toHaveLength(2);
  });
});
