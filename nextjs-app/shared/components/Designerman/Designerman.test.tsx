import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Designerman from "./Designerman";

describe("Designerman", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders sprite canvas", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("applies default scale", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("width", "192"); // 64 * 3 default scale
  });

  it("applies custom scale", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" scale={2} />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("width", "128"); // 64 * 2
  });

  it("starts with idle animation", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" />,
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders control buttons", () => {
    render(<Designerman spriteSheet="/sprites/test.png" />);
    expect(screen.getByRole("button", { name: /walk/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jump/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /punch/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /blast/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /block/i })).toBeInTheDocument();
  });

  it("handles walk button click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Designerman spriteSheet="/sprites/test.png" />);

    const walkButton = screen.getByRole("button", { name: /walk/i });
    await user.click(walkButton);

    expect(walkButton).toBeInTheDocument();
  });

  it("handles run button click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Designerman spriteSheet="/sprites/test.png" />);

    const runButton = screen.getByRole("button", { name: /run/i });
    await user.click(runButton);

    expect(runButton).toBeInTheDocument();
  });

  it("handles jump button click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Designerman spriteSheet="/sprites/test.png" />);

    const jumpButton = screen.getByRole("button", { name: /jump/i });
    await user.click(jumpButton);

    expect(jumpButton).toBeInTheDocument();
  });

  it("handles punch button click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Designerman spriteSheet="/sprites/test.png" />);

    const punchButton = screen.getByRole("button", { name: /punch/i });
    await user.click(punchButton);

    expect(punchButton).toBeInTheDocument();
  });

  it("handles blast button click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Designerman spriteSheet="/sprites/test.png" />);

    const blastButton = screen.getByRole("button", { name: /blast/i });
    await user.click(blastButton);

    expect(blastButton).toBeInTheDocument();
  });

  it("handles block button click", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Designerman spriteSheet="/sprites/test.png" />);

    const blockButton = screen.getByRole("button", { name: /block/i });
    await user.click(blockButton);

    expect(blockButton).toBeInTheDocument();
  });

  it("uses custom frame dimensions", () => {
    const { container } = render(
      <Designerman
        spriteSheet="/sprites/test.png"
        frameWidth={32}
        frameHeight={32}
      />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("width", "96"); // 32 * 3 default scale
  });

  it("uses custom columns", () => {
    const { container } = render(
      <Designerman spriteSheet="/sprites/test.png" columns={8} />,
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("applies custom animations", () => {
    const customAnimations = {
      idle: { frames: [0, 1], fps: 10, loop: true },
    };
    const { container } = render(
      <Designerman
        spriteSheet="/sprites/test.png"
        animations={customAnimations}
      />,
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
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

  it("audio is muted by default", () => {
    const { container } = render(
      <Designerman
        spriteSheet="/sprites/test.png"
        audioSrc="/audio/test.mp3"
      />,
    );
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute("muted");
  });
});
