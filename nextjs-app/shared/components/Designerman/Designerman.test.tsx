import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Designerman from "./Designerman";
import styles from "./Designerman.module.css";

describe("Designerman", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders sprite stage with application role", () => {
    render(<Designerman spriteSheet="/sprites/test.png" />);
    expect(
      screen.getByRole("application", { name: /Designerman interactive sprite/i }),
    ).toBeInTheDocument();
  });

  it("renders sprite layer with background image", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" />,
    );
    const sprite = container.querySelector(`.${styles.sprite}`);
    expect(sprite).toBeInTheDocument();
    expect(sprite).toHaveStyle({
      backgroundImage: "url(/sprites/test.png)",
    });
  });

  it("renders mute control in the HUD", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" />,
    );
    expect(container.querySelector("button")).toHaveTextContent("Mute");
  });

  it("toggles mute label when clicked", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" />,
    );

    const muteButton = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(muteButton);
    expect(muteButton).toHaveTextContent("Unmute");
  });

  it("renders audio element when audioSrc provided", () => {
    const { container } = render(
      <Designerman
        spriteSheet="/sprites/test.png"
        audioSrc="/audio/test.mp3"
      />,
    );
    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute("src", "/audio/test.mp3");
  });

  it("does not render audio when audioSrc is empty", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" audioSrc="" />,
    );
    expect(container.querySelector("audio")).not.toBeInTheDocument();
  });

  it("applies custom animations without crashing", () => {
    const customAnimations = {
      idle: { frames: [0, 1], fps: 10, loop: true },
    };
    const { container } = render(
      <Designerman
        spriteSheet="/sprites/test.png"
        animations={customAnimations}
      />,
    );
    expect(container.querySelector(`.${styles.sprite}`)).toBeInTheDocument();
  });

  it("is keyboard focusable", () => {
    render(<Designerman spriteSheet="/sprites/test.png" />);
    const stage = screen.getByRole("application");
    expect(stage).toHaveAttribute("tabindex", "0");
  });
});
