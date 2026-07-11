import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ToastStack, { type ToastStackItem } from "@dt/ToastStack";
import styles from "./ToastStack.module.css";

expect.extend(toHaveNoViolations);

const items: ToastStackItem[] = [
  { id: "a", message: "Language changed" },
  { id: "b", message: "This content is only available in English", tone: "info" },
];

describe("ToastStack", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("renders every toast message at once", () => {
    render(<ToastStack toasts={items} />);
    expect(screen.getByText("Language changed")).toBeInTheDocument();
    expect(
      screen.getByText("This content is only available in English"),
    ).toBeInTheDocument();
  });

  it("preserves each Toast live-region role and politeness", () => {
    render(
      <ToastStack
        toasts={[
          { id: "saved", message: "Saved", tone: "success" },
          { id: "failed", message: "Failed", tone: "error" },
        ]}
      />,
    );

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("alert")).toHaveAttribute(
      "aria-live",
      "assertive",
    );
  });

  it("renders toasts inline so the stack owns placement", () => {
    const { container } = render(<ToastStack toasts={items} />);
    const stack = container.firstElementChild as HTMLElement;
    expect(stack.className).toContain(styles.stack);
    expect(stack.className).toContain(styles["stack--bottom-center"]);
    for (const toast of stack.children) {
      expect(toast.className).toMatch(/toast--inline/);
    }
  });

  it("reports each dismissal with the toast id", () => {
    const onDismiss = vi.fn();
    render(
      <ToastStack
        toasts={[
          { id: "fast", message: "Fast", duration: 1000 },
          { id: "slow", message: "Slow", duration: 5000 },
        ]}
        onDismiss={onDismiss}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDismiss).toHaveBeenCalledWith("fast");
    expect(onDismiss).not.toHaveBeenCalledWith("slow");
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onDismiss).toHaveBeenCalledWith("slow");
  });

  it("caps rendered toasts at max, dropping the oldest", () => {
    const many = Array.from({ length: 7 }, (_, index) => ({
      id: String(index),
      message: `Toast ${index}`,
    }));
    render(<ToastStack toasts={many} max={3} />);
    expect(screen.queryByText("Toast 3")).not.toBeInTheDocument();
    expect(screen.getByText("Toast 4")).toBeInTheDocument();
    expect(screen.getByText("Toast 6")).toBeInTheDocument();
  });

  it("positions the stack per the position prop", () => {
    const { container } = render(
      <ToastStack toasts={items} position="top-right" />,
    );
    const stack = container.firstElementChild as HTMLElement;
    expect(stack.className).toContain(styles["stack--top-right"]);
  });

  it("has no axe violations", async () => {
    vi.useRealTimers();
    const { container } = render(<ToastStack toasts={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
