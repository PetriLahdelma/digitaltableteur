"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DonnyState } from "@dt/DonnyAvatar";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

/** How long each one-off reaction holds before the reactive state returns. */
export const BEAT_MS = {
  acknowledging: 700,
  waving: 1000,
  remembering: 1100,
} as const;

/**
 * Short one-off reactions ("beats") to moments the reactive state machine
 * has no state for: a reply finishing, the panel opening, a restored
 * conversation. A beat holds for a moment, then hands back to the reactive
 * state; any newer beat replaces it.
 */
export function useDonnyChatBeats({
  status,
  isOpen,
  hasConversation,
}: {
  status: ChatStatus;
  isOpen: boolean;
  /** More than the greeting is on screen (a restored or ongoing chat). */
  hasConversation: boolean;
}) {
  const [beat, setBeat] = useState<DonnyState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playBeat = useCallback((state: DonnyState, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBeat(state);
    timerRef.current = setTimeout(() => {
      setBeat(null);
      timerRef.current = null;
    }, ms);
  }, []);

  // A reply finished streaming: a small nod, like "there you go".
  const previousStatusRef = useRef(status);
  useEffect(() => {
    const previous = previousStatusRef.current;
    previousStatusRef.current = status;
    if (previous === "streaming" && status === "ready") {
      playBeat("acknowledging", BEAT_MS.acknowledging);
    }
    if (status === "submitted") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setBeat(null);
    }
  }, [status, playBeat]);

  // The panel opened: wave hello, or recall a restored conversation.
  const wasOpenRef = useRef(isOpen);
  const hasConversationRef = useRef(hasConversation);
  useEffect(() => {
    hasConversationRef.current = hasConversation;
  }, [hasConversation]);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (!wasOpen && isOpen) {
      if (hasConversationRef.current) {
        playBeat("remembering", BEAT_MS.remembering);
      } else {
        playBeat("waving", BEAT_MS.waving);
      }
    }
  }, [isOpen, playBeat]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { beat, playBeat };
}
