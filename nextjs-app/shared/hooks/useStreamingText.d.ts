export type StreamingTextSpeed = "natural" | "fast" | "instant";
export interface UseStreamingTextOptions {
    /** Reveal cadence. Instant also disables the animation loop. */
    speed?: StreamingTextSpeed;
}
/**
 * Smooth accumulated streamed text into a steady, adaptive reveal.
 *
 * Pass the complete accumulated string on every update. The hook catches up
 * quickly after large bursts, remains responsive to sparse chunks, never cuts
 * through a grapheme cluster, and returns the complete target immediately when
 * streaming ends or reduced motion is preferred.
 */
export declare function useStreamingText(targetText: string, isStreaming: boolean, options?: UseStreamingTextOptions): string;
//# sourceMappingURL=useStreamingText.d.ts.map