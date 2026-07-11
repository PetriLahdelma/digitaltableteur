import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Toast from "@dt/Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders message when open is true", () => {
    render(<Toast message="Test message" open={true} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("keeps live region mounted when open is false", () => {
    render(<Toast message="Test message" open={false} />);
    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls onClose after default duration", () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" open={true} onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose after custom duration", () => {
    const onClose = vi.fn();
    render(
      <Toast
        message="Test message"
        open={true}
        duration={5000}
        onClose={onClose}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility attributes", () => {
    render(<Toast message="Test message" open={true} />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("uses assertive alert semantics for warning and error tones", () => {
    const { rerender } = render(
      <Toast message="Check this" open={true} tone="warning" />,
    );

    expect(screen.getByRole("alert")).toHaveAttribute(
      "aria-live",
      "assertive",
    );

    rerender(<Toast message="Failed" open={true} tone="error" />);

    expect(screen.getByRole("alert")).toHaveAttribute(
      "aria-live",
      "assertive",
    );
  });

  it("keeps tone icons decorative", () => {
    const { container } = render(
      <Toast message="Saved" open={true} tone="success" />,
    );

    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("clears timer when component unmounts", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Toast message="Test message" open={true} onClose={onClose} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
