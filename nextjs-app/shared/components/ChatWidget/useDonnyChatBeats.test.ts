import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BEAT_MS, useDonnyChatBeats } from "./useDonnyChatBeats";

type Props = Parameters<typeof useDonnyChatBeats>[0];

describe("useDonnyChatBeats", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const start: Props = { status: "ready", isOpen: false, hasConversation: false };

  it("waves when the panel opens on a fresh chat, then hands back", () => {
    const { result, rerender } = renderHook((props: Props) => useDonnyChatBeats(props), {
      initialProps: start,
    });
    expect(result.current.beat).toBeNull();
    rerender({ ...start, isOpen: true });
    expect(result.current.beat).toBe("waving");
    act(() => vi.advanceTimersByTime(BEAT_MS.waving));
    expect(result.current.beat).toBeNull();
  });

  it("remembers when the panel reopens on a restored conversation", () => {
    const { result, rerender } = renderHook((props: Props) => useDonnyChatBeats(props), {
      initialProps: { ...start, hasConversation: true },
    });
    rerender({ ...start, hasConversation: true, isOpen: true });
    expect(result.current.beat).toBe("remembering");
  });

  it("nods when a reply finishes, and clears the moment a new message is sent", () => {
    const open = { ...start, isOpen: true, hasConversation: true };
    const { result, rerender } = renderHook((props: Props) => useDonnyChatBeats(props), {
      initialProps: { ...open, status: "streaming" },
    });
    rerender({ ...open, status: "ready" });
    expect(result.current.beat).toBe("acknowledging");
    rerender({ ...open, status: "submitted" });
    expect(result.current.beat).toBeNull();
  });

  it("does not nod when a request errors", () => {
    const open = { ...start, isOpen: true, hasConversation: true };
    const { result, rerender } = renderHook((props: Props) => useDonnyChatBeats(props), {
      initialProps: { ...open, status: "streaming" },
    });
    rerender({ ...open, status: "error" });
    expect(result.current.beat).toBeNull();
  });
});
