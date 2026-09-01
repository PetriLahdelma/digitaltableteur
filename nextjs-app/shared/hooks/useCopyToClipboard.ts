"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardResult {
  /** Key of the field copied most recently, or null once the flag expires. */
  copiedKey: string | null;
  /** Copies `value` and flags `key` as copied for `resetAfterMs`. */
  copy: (key: string, value: string) => Promise<void>;
}

/**
 * Copy-to-clipboard with a self-expiring "copied" flag, keyed so one hook can
 * back several fields (e-invoice address and operator ID on /pricing and
 * /imprint).
 *
 * A refused clipboard — insecure origin, denied permission — leaves the flag
 * untouched rather than reporting a copy that did not happen. Callers should
 * keep the value selectable so there is always a manual route.
 */
export function useCopyToClipboard(
  resetAfterMs = 1500,
): UseCopyToClipboardResult {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear on unmount so the reset never fires against a gone component.
  useEffect(
    () => () => {
      if (resetRef.current) clearTimeout(resetRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (key: string, value: string) => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return;
      }
      setCopiedKey(key);
      if (resetRef.current) clearTimeout(resetRef.current);
      resetRef.current = setTimeout(() => setCopiedKey(null), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { copiedKey, copy };
}

export default useCopyToClipboard;
