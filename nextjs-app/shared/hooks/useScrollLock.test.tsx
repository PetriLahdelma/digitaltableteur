import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useScrollLock } from "./useScrollLock";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("useScrollLock", () => {
  it("locks body scroll while active and restores it on release", () => {
    const { rerender, unmount } = renderHook(
      ({ active }) => useScrollLock(active),
      { initialProps: { active: true } },
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender({ active: false });
    expect(document.body.style.overflow).toBe("");
    unmount();
  });

  it("restores the previous overflow value rather than clearing it", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });
});
