import type {
  DonnyHighlightMode,
  DonnyTargetId,
} from "../../data/donny-site-actions";

export type DonnyPageTargetMode = "navigate" | "scroll" | "highlight";

export interface ShowPageTargetInput {
  targetId: DonnyTargetId;
  mode: DonnyPageTargetMode;
  highlightMode?: DonnyHighlightMode;
  narration?: string;
  requiresConfirmation?: boolean;
  toolCallId?: string;
}

export type ShowPageTargetAction =
  | "navigated"
  | "scrolled"
  | "highlighted"
  | "skipped";

export interface ShowPageTargetOutput {
  ok: boolean;
  targetId: DonnyTargetId;
  route: string;
  action: ShowPageTargetAction;
  reason?: string;
}

export interface PrefillContactIntentInput {
  serviceId?: string;
  packageId?: string;
  messageDraft?: string;
  sourceTargetId?: DonnyTargetId;
  toolCallId?: string;
}

export interface PrefillContactIntentOutput {
  ok: boolean;
  targetId: "contact.form";
  prefilledFields: string[];
  reason?: string;
}

export interface CapturePageContextOutput {
  path: string;
  locale: "en" | "fi" | "sv";
  visibleTargetIds: DonnyTargetId[];
  lastInterest?: string;
}

export interface DonnyActiveHighlight {
  targetId: DonnyTargetId;
  highlightMode: DonnyHighlightMode;
  annotationId: string;
  element: HTMLElement;
}

export interface DonnyActionQueueItem {
  id: string;
  run: () => Promise<void>;
}
