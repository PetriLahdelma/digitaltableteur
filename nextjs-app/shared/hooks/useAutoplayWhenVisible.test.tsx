import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { useAutoplayWhenVisible } from "./useAutoplayWhenVisible";

let observerCallback: IntersectionObserverCallback | null = null;
let reducedMotion = false;

class ControlledObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

async function setVisible(visible: boolean) {
  await act(async () => {
    observerCallback?.(
      [{ isIntersecting: visible } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    await new Promise((resolve) => setTimeout(resolve));
  });
}

function Demo({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useAutoplayWhenVisible(ref, enabled);
  return <video ref={ref} data-testid="video" muted loop controls />;
}

describe("useAutoplayWhenVisible", () => {
  const originalObserver = globalThis.IntersectionObserver;
  const originalMatchMedia = window.matchMedia;
  let play: ReturnType<typeof vi.spyOn>;
  let pause: ReturnType<typeof vi.spyOn>;
  let paused: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    observerCallback = null;
    reducedMotion = false;
    globalThis.IntersectionObserver =
      ControlledObserver as unknown as typeof IntersectionObserver;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") && reducedMotion,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    // Browsers flip `paused` at once but fire play/pause events from a
    // queued task, so the mocks do the same.
    const state = new WeakMap<HTMLMediaElement, boolean>();
    paused = vi
      .spyOn(HTMLMediaElement.prototype, "paused", "get")
      .mockImplementation(function (this: HTMLMediaElement) {
        return state.get(this) ?? true;
      });
    play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(function (this: HTMLMediaElement) {
        state.set(this, false);
        setTimeout(() => this.dispatchEvent(new Event("play")));
        return Promise.resolve();
      });
    pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(function (this: HTMLMediaElement) {
        if (state.get(this) === false) {
          state.set(this, true);
          setTimeout(() => this.dispatchEvent(new Event("pause")));
        }
      });
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
    window.matchMedia = originalMatchMedia;
    play.mockRestore();
    pause.mockRestore();
    paused.mockRestore();
  });

  it("plays while on screen and pauses when scrolled away", async () => {
    render(<Demo />);
    await setVisible(true);
    expect(play).toHaveBeenCalledTimes(1);
    await setVisible(false);
    expect(pause).toHaveBeenCalledTimes(1);
    await setVisible(true);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("never starts playback for visitors who prefer reduced motion", async () => {
    reducedMotion = true;
    render(<Demo />);
    await setVisible(true);
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps a video the visitor paused paused when it scrolls back in", async () => {
    const { getByTestId } = render(<Demo />);
    await setVisible(true);
    const video = getByTestId("video") as HTMLVideoElement;
    await act(async () => {
      video.pause();
      await new Promise((resolve) => setTimeout(resolve));
    });
    await setVisible(false);
    await setVisible(true);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    render(<Demo enabled={false} />);
    await setVisible(true);
    expect(play).not.toHaveBeenCalled();
  });
});
