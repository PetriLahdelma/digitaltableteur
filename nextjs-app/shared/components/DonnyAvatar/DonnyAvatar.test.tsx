import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
// Import directly from file to avoid React version mismatch through alias resolution
import { DonnyAvatar, type DonnyState } from "./DonnyAvatar";
import styles from "./DonnyAvatar.module.css";

describe("DonnyAvatar", () => {
  describe("Rendering", () => {
    it("renders with default idle state", () => {
      render(<DonnyAvatar />);
      const avatar = screen.getByRole("img");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("data-state", "idle");
    });

    it("renders with specified state", () => {
      render(<DonnyAvatar state="thinking" />);
      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("data-state", "thinking");
    });

    it("renders SVG content", () => {
      const { container } = render(<DonnyAvatar />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    const sizes = [
      { size: "sm" as const, expected: 32 },
      { size: "md" as const, expected: 48 },
      { size: "lg" as const, expected: 64 },
      { size: "xl" as const, expected: 96 },
    ];

    sizes.forEach(({ size, expected }) => {
      it(`renders ${size} size with ${expected}px dimensions`, () => {
        render(<DonnyAvatar size={size} />);
        const container = screen.getByRole("img");
        expect(container).toHaveStyle({ width: `${expected}px`, height: `${expected}px` });
      });
    });
  });

  describe("State Transitions", () => {
    it("transitions between states", async () => {
      vi.useFakeTimers();
      const onTransitionEnd = vi.fn();
      const { rerender } = render(
        <DonnyAvatar state="idle" onTransitionEnd={onTransitionEnd} />
      );

      expect(screen.getByRole("img")).toHaveAttribute("data-state", "idle");

      rerender(<DonnyAvatar state="thinking" onTransitionEnd={onTransitionEnd} />);

      // Should be transitioning
      expect(screen.getByRole("img")).toHaveAttribute("data-transitioning", "true");

      // Wait for transition
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      expect(screen.getByRole("img")).toHaveAttribute("data-state", "thinking");
      expect(screen.getByRole("img")).toHaveAttribute("data-transitioning", "false");
      expect(onTransitionEnd).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("has accessible label", () => {
      render(<DonnyAvatar state="thinking" />);
      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("aria-label", "Donny is thinking");
    });

    it("is decorative when used inside a labeled control", () => {
      const { container } = render(<DonnyAvatar decorative state="idle" />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    });

    it("updates aria-label when state changes", async () => {
      vi.useFakeTimers();
      const { rerender } = render(<DonnyAvatar state="idle" />);
      expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Donny is idle");

      rerender(<DonnyAvatar state="success" />);
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Donny is success");
      vi.useRealTimers();
    });
  });

  describe("Debug Label", () => {
    it("shows label when showLabel is true", () => {
      render(<DonnyAvatar state="confused" showLabel />);
      expect(screen.getByText("confused")).toBeInTheDocument();
    });

    it("hides label when showLabel is false", () => {
      render(<DonnyAvatar state="confused" showLabel={false} />);
      expect(screen.queryByText("confused")).not.toBeInTheDocument();
    });
  });

  describe("All States", () => {
    const coreStates: DonnyState[] = [
      "idle",
      "listening",
      "thinking",
      "searching",
      "success",
      "error",
      "confused",
      "handoff",
    ];

    const extendedStates: DonnyState[] = [
      "greeting",
      "acknowledging",
      "suggesting",
      "confident",
      "curious",
      "celebrating",
      "apologetic",
      "typing",
      "loading",
      "waving",
      "remembering",
      "focused",
      "playful",
      "impressed",
      "skeptical",
      "sleepy",
      "sleeping",
    ];

    coreStates.forEach((state) => {
      it(`renders core state: ${state}`, () => {
        render(<DonnyAvatar state={state} />);
        const avatar = screen.getByRole("img");
        expect(avatar).toHaveAttribute("data-state", state);
      });
    });

    extendedStates.forEach((state) => {
      it(`renders extended state: ${state}`, () => {
        render(<DonnyAvatar state={state} />);
        const avatar = screen.getByRole("img");
        expect(avatar).toHaveAttribute("data-state", state);
      });
    });
  });

  describe("Decorative Elements", () => {
    it("renders sparkles for celebrating state", () => {
      const { container } = render(<DonnyAvatar state="celebrating" />);
      const sparkles = container.querySelectorAll(`.${styles.sparkles} circle`);
      expect(sparkles.length).toBeGreaterThan(0);
    });

    it("renders question mark for confused state", () => {
      const { container } = render(<DonnyAvatar state="confused" />);
      const questionMark = container.querySelector("text");
      expect(questionMark).toHaveTextContent("?");
    });

    it("renders thought bubbles for remembering state", () => {
      const { container } = render(<DonnyAvatar state="remembering" />);
      const bubbles = container.querySelectorAll("circle[fill='white']");
      expect(bubbles.length).toBeGreaterThan(0);
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      render(<DonnyAvatar className="custom-class" />);
      const avatar = screen.getByRole("img");
      expect(avatar).toHaveClass("custom-class");
    });
  });

  describe("Mouse Tracking", () => {
    it("sets data-tracking attribute when trackMouse is enabled", () => {
      render(<DonnyAvatar trackMouse />);
      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("data-tracking", "true");
    });

    it("does not set data-tracking when trackMouse is disabled", () => {
      render(<DonnyAvatar trackMouse={false} />);
      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("data-tracking", "false");
    });

    it("sets data-near-target attribute", () => {
      render(<DonnyAvatar trackMouse proximitySelectors={[".test"]} />);
      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("data-near-target", "false");
    });

    it("calls onProximityChange when the cursor nears a tracked selector", async () => {
      const onProximityChange = vi.fn();
      const requestAnimationFrameSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((callback) => {
          callback(0);
          return 1;
        });
      const cancelAnimationFrameSpy = vi
        .spyOn(window, "cancelAnimationFrame")
        .mockImplementation(() => {});
      const rect = (
        left: number,
        top: number,
        width: number,
        height: number,
      ) =>
        ({
          x: left,
          y: top,
          left,
          top,
          width,
          height,
          right: left + width,
          bottom: top + height,
          toJSON: () => ({}),
        }) as DOMRect;

      const target = document.createElement("button");
      target.className = "tracked-action";
      target.getBoundingClientRect = vi.fn(() => rect(90, 0, 20, 20));
      document.body.appendChild(target);

      try {
        render(
          <DonnyAvatar
            trackMouse
            proximitySelectors={[".tracked-action"]}
            proximityThreshold={40}
            onProximityChange={onProximityChange}
          />,
        );
        const avatar = screen.getByRole("img");
        avatar.getBoundingClientRect = vi.fn(() => rect(0, 0, 40, 32));

        await act(async () => {
          window.dispatchEvent(
            new MouseEvent("mousemove", {
              clientX: 100,
              clientY: 10,
              bubbles: true,
            }),
          );
        });

        await waitFor(() =>
          expect(onProximityChange).toHaveBeenCalledWith(
            true,
            ".tracked-action",
          ),
        );
        expect(avatar).toHaveAttribute("data-near-target", "true");
      } finally {
        target.remove();
        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
      }
    });
  });
});
