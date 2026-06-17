"use client";

import type { ReactNode } from "react";
import {
  DonnyActionsContext,
  useDonnyActionsState,
} from "./useDonnyActions";
import { DonnySpotlightOverlay } from "./DonnySpotlightOverlay";
import "./donny-target-highlights.css";
import styles from "./DonnyActionProvider.module.css";

export interface DonnyActionProviderProps {
  children: ReactNode;
}

/**
 * Client action bus for Donny — navigation, scroll, highlight, and contact prefill.
 * Mount once near ChatWidget in NextLayout.
 */
export function DonnyActionProvider({ children }: DonnyActionProviderProps) {
  const actions = useDonnyActionsState();

  return (
    <DonnyActionsContext.Provider value={actions}>
      {children}
      <DonnySpotlightOverlay
        activeHighlight={actions.activeHighlight}
        prefersReducedMotion={actions.prefersReducedMotion}
      />
      <div
        className={styles.liveRegion}
        aria-atomic="true"
        role="status"
      >
        {actions.statusMessage}
      </div>
    </DonnyActionsContext.Provider>
  );
}

export { useDonnyActions, useOptionalDonnyActions } from "./useDonnyActions";
export type {
  CapturePageContextOutput,
  PrefillContactIntentInput,
  PrefillContactIntentOutput,
  ShowPageTargetInput,
  ShowPageTargetOutput,
} from "./donnyActionTypes";
