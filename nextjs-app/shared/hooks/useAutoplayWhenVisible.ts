import { useEffect, type RefObject } from "react";

/**
 * Play a muted, looping video while it is on screen, and pause it when it
 * scrolls away. Keep the element's own `controls` so visitors can pause it
 * (WCAG 2.2.2): once they do, it stays paused until they press play again.
 * Visitors who prefer reduced motion never get playback started for them,
 * which is why the element carries no `autoplay` attribute.
 *
 * @param ref the video element.
 * @param enabled set to false to leave playback entirely to the visitor.
 */
export function useAutoplayWhenVisible(
  ref: RefObject<HTMLVideoElement | null>,
  enabled = true,
): void {
  useEffect(() => {
    const video = ref.current;
    if (!video || !enabled || typeof IntersectionObserver === "undefined") {
      return;
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let visible = false;
    let pausedByVisitor = false;
    let pausingForScroll = false;

    const sync = () => {
      if (visible && !reduce?.matches && !pausedByVisitor) {
        void video.play()?.catch(() => {});
      } else if (!video.paused) {
        // The pause event arrives from a queued task, so the flag is cleared
        // by the handler, not here.
        pausingForScroll = true;
        video.pause();
      }
    };
    const onPause = () => {
      if (pausingForScroll) {
        pausingForScroll = false;
      } else {
        pausedByVisitor = true;
      }
    };
    const onPlay = () => {
      pausedByVisitor = false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        sync();
      },
      // Any visible pixel counts: a video scaled up inside a clipping frame
      // never shows a quarter of its own box.
      { threshold: 0 },
    );
    observer.observe(video);
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    reduce?.addEventListener?.("change", sync);
    return () => {
      observer.disconnect();
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      reduce?.removeEventListener?.("change", sync);
    };
  }, [ref, enabled]);
}
