import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../test-utils/render";
import { LogoConstruction } from "./LogoConstruction";

describe("LogoConstruction", () => {
  it("starts static and gives the visitor start and stop controls", async () => {
    Object.defineProperty(SVGElement.prototype, "getTotalLength", {
      configurable: true,
      value: () => 100,
    });
    const user = userEvent.setup();
    renderWithProviders(
      <LogoConstruction
        ariaLabel="KnobSmith Audio logo construction"
        playLabel="Play construction"
        stopLabel="Stop construction"
      />,
    );

    expect(
      screen.getByRole("img", { name: "KnobSmith Audio logo construction" }),
    ).toBeInTheDocument();
    const play = screen.getByRole("button", { name: "Play construction" });
    expect(play).toHaveAttribute("aria-pressed", "false");

    await user.click(play);
    const stop = screen.getByRole("button", { name: "Stop construction" });
    expect(stop).toHaveAttribute("aria-pressed", "true");

    await user.click(stop);
    expect(
      screen.getByRole("button", { name: "Play construction" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
