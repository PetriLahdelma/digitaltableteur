"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLenis } from "lenis/react";
import {
  getDonnyTarget,
  isDonnyTargetId,
  isSafeDonnyRoute,
  type DonnyHighlightMode,
  type DonnyTargetId,
} from "../../data/donny-site-actions";
import {
  useNavigationPathname,
  useNavigationRouter,
} from "../../lib/navigation";
import { useLocalization } from "../../lib/translation";
import {
  applyDonnyHighlightAttributes,
  clearDonnyHighlightAttributes,
  createDonnyAnnotationId,
  getLastDonnyInterest,
  getVisibleDonnyTargetIds,
  normalizeDonnyPath,
  resolveDonnyTargetWithFallback,
  resolveHighlightMode,
  waitForDonnyTarget,
} from "./donnyActionUtils";
import {
  DONNY_PACKAGE_PROJECT_TYPE,
  dispatchDonnyContactPrefill,
} from "./donnyContactPrefill";
import type {
  CapturePageContextOutput,
  DonnyActiveHighlight,
  PrefillContactIntentInput,
  PrefillContactIntentOutput,
  ShowPageTargetInput,
  ShowPageTargetOutput,
} from "./donnyActionTypes";

const HIGHLIGHT_TIMEOUT_MS = 45_000;

export interface DonnyActionsContextValue {
  showPageTarget: (input: ShowPageTargetInput) => Promise<ShowPageTargetOutput>;
  clearPageTarget: () => void;
  prefillContactIntent: (
    input: PrefillContactIntentInput,
  ) => Promise<PrefillContactIntentOutput>;
  capturePageContext: () => CapturePageContextOutput;
  activeHighlight: DonnyActiveHighlight | null;
  statusMessage: string;
  prefersReducedMotion: boolean;
}

export const DonnyActionsContext = createContext<DonnyActionsContextValue | null>(
  null,
);

function resolveLocale(language: string): "en" | "fi" | "sv" {
  const base = language.split("-")[0]?.toLowerCase();
  if (base === "fi" || base === "sv") return base;
  return "en";
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useDonnyActionsState(): DonnyActionsContextValue {
  const router = useNavigationRouter();
  const pathname = useNavigationPathname() ?? "/";
  const lenis = useLenis();
  const { translate: t, language } = useLocalization();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [activeHighlight, setActiveHighlight] =
    useState<DonnyActiveHighlight | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const executedToolCallIdsRef = useRef(new Set<string>());
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const highlightTimeoutRef = useRef<number | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);

  const clearHighlightTimeout = useCallback(() => {
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const clearPageTarget = useCallback(() => {
    clearHighlightTimeout();
    const element = activeElementRef.current;
    if (element) {
      clearDonnyHighlightAttributes(element);
    }
    activeElementRef.current = null;
    setActiveHighlight(null);
    setStatusMessage(t("donnyAction.cleared", "Highlight cleared"));
  }, [clearHighlightTimeout, t]);

  const scrollToTarget = useCallback(
    (element: HTMLElement) => {
      if (lenis && !prefersReducedMotion) {
        lenis.scrollTo(element, { offset: -96, duration: 1.1 });
        return;
      }

      element.scrollIntoView({
        behavior: prefersReducedMotion ? "instant" : "smooth",
        block: "center",
        inline: "nearest",
      });
    },
    [lenis, prefersReducedMotion],
  );

  const applyHighlight = useCallback(
    (
      element: HTMLElement,
      targetId: DonnyTargetId,
      highlightMode: DonnyHighlightMode,
    ) => {
      clearHighlightTimeout();
      const previous = activeElementRef.current;
      if (previous) {
        clearDonnyHighlightAttributes(previous);
      }

      const annotationId = createDonnyAnnotationId();
      applyDonnyHighlightAttributes(element, highlightMode, annotationId);
      activeElementRef.current = element;
      setActiveHighlight({
        targetId,
        highlightMode,
        annotationId,
        element,
      });

      const label = getDonnyTarget(targetId)?.label ?? targetId;
      setStatusMessage(
        t("donnyAction.highlighted", "Highlighted {{label}}", { label }),
      );

      highlightTimeoutRef.current = window.setTimeout(() => {
        clearPageTarget();
      }, HIGHLIGHT_TIMEOUT_MS);
    },
    [clearHighlightTimeout, clearPageTarget, t],
  );

  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const next = queueRef.current.then(task);
    queueRef.current = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }, []);

  const showPageTarget = useCallback(
    (input: ShowPageTargetInput): Promise<ShowPageTargetOutput> =>
      enqueue(async (): Promise<ShowPageTargetOutput> => {
        if (input.toolCallId) {
          if (executedToolCallIdsRef.current.has(input.toolCallId)) {
            const existing = getDonnyTarget(input.targetId);
            return {
              ok: true,
              targetId: input.targetId,
              route: existing?.route ?? "/",
              action: "skipped",
              reason: "duplicate_tool_call",
            };
          }
          executedToolCallIdsRef.current.add(input.toolCallId);
        }

        if (!isDonnyTargetId(input.targetId)) {
          return {
            ok: false,
            targetId: input.targetId,
            route: "/",
            action: "skipped",
            reason: "unknown_target",
          };
        }

        const target = getDonnyTarget(input.targetId);
        if (!target || !isSafeDonnyRoute(target.route)) {
          return {
            ok: false,
            targetId: input.targetId,
            route: target?.route ?? "/",
            action: "skipped",
            reason: "unsafe_route",
          };
        }

        const highlightMode = resolveHighlightMode(
          input.targetId,
          input.highlightMode,
        );
        if (!highlightMode) {
          return {
            ok: false,
            targetId: input.targetId,
            route: target.route,
            action: "skipped",
            reason: "invalid_highlight_mode",
          };
        }

        const currentPath = normalizeDonnyPath(pathname);
        const shouldNavigate =
          input.mode === "navigate" ||
          (input.mode !== "highlight" && currentPath !== target.route);

        if (shouldNavigate && currentPath !== target.route) {
          router.push(target.route);
          setStatusMessage(
            t("donnyAction.navigated", "Opened {{label}}", {
              label: target.label,
            }),
          );
        }

        let resolvedElement = await waitForDonnyTarget(target.selector);
        let resolvedTargetId: DonnyTargetId = input.targetId;
        let resolvedRoute = target.route;

        if (!resolvedElement) {
          const fallback = resolveDonnyTargetWithFallback(input.targetId);
          if (!fallback) {
            setStatusMessage(
              t(
                "donnyAction.notFound",
                "Could not find that section on the page",
              ),
            );
            return {
              ok: false,
              targetId: input.targetId,
              route: target.route,
              action: "skipped",
              reason: "target_not_found",
            };
          }

          if (normalizeDonnyPath(pathname) !== fallback.route) {
            router.push(fallback.route);
          }

          resolvedElement = await waitForDonnyTarget(fallback.selector);
          resolvedTargetId = fallback.targetId;
          resolvedRoute = fallback.route;
        }

        if (!resolvedElement) {
          setStatusMessage(
            t(
              "donnyAction.notFound",
              "Could not find that section on the page",
            ),
          );
          return {
            ok: false,
            targetId: input.targetId,
            route: target.route,
            action: "skipped",
            reason: "target_not_found",
          };
        }

        if (input.mode !== "highlight") {
          scrollToTarget(resolvedElement);
        }

        applyHighlight(resolvedElement, resolvedTargetId, highlightMode);

        const action =
          shouldNavigate && currentPath !== target.route
            ? "navigated"
            : input.mode === "scroll"
              ? "scrolled"
              : "highlighted";

        return {
          ok: true,
          targetId: resolvedTargetId,
          route: resolvedRoute,
          action,
        };
      }),
    [applyHighlight, enqueue, pathname, router, scrollToTarget, t],
  );

  const prefillContactIntent = useCallback(
    (input: PrefillContactIntentInput): Promise<PrefillContactIntentOutput> =>
      enqueue(async (): Promise<PrefillContactIntentOutput> => {
        if (input.toolCallId) {
          if (executedToolCallIdsRef.current.has(input.toolCallId)) {
            return {
              ok: true,
              targetId: "contact.form",
              prefilledFields: [],
              reason: "duplicate_tool_call",
            };
          }
          executedToolCallIdsRef.current.add(input.toolCallId);
        }

        const prefilledFields: string[] = [];
        let projectType: string | undefined;

        if (input.packageId) {
          projectType = DONNY_PACKAGE_PROJECT_TYPE[input.packageId];
          if (projectType) prefilledFields.push("projectType");
        }

        if (input.serviceId) {
          projectType = input.serviceId;
          prefilledFields.push("projectType");
        }

        const contactTarget = getDonnyTarget("contact.form");
        if (!contactTarget) {
          return {
            ok: false,
            targetId: "contact.form",
            prefilledFields: [],
            reason: "missing_contact_target",
          };
        }

        if (normalizeDonnyPath(pathname) !== contactTarget.route) {
          router.push(contactTarget.route);
        }

        const formElement = await waitForDonnyTarget(contactTarget.selector);

        dispatchDonnyContactPrefill({
          projectType,
          message: input.messageDraft,
          sourceTargetId: input.sourceTargetId,
          packageId: input.packageId,
          serviceId: input.serviceId,
        });

        if (input.messageDraft) {
          prefilledFields.push("message");
        }

        if (formElement) {
          scrollToTarget(formElement);
          applyHighlight(formElement, "contact.form", "focus");
        }

        setStatusMessage(
          t("donnyAction.prefilled", "Contact form updated with your brief"),
        );

        return {
          ok: true,
          targetId: "contact.form",
          prefilledFields,
        };
      }),
    [applyHighlight, enqueue, pathname, router, scrollToTarget, t],
  );

  const capturePageContext = useCallback((): CapturePageContextOutput => {
    return {
      path: pathname,
      locale: resolveLocale(language),
      visibleTargetIds: getVisibleDonnyTargetIds(),
      lastInterest: getLastDonnyInterest(),
    };
  }, [language, pathname]);

  const isFirstPathRef = useRef(true);

  useEffect(() => {
    if (isFirstPathRef.current) {
      isFirstPathRef.current = false;
      return;
    }
    clearPageTarget();
  }, [pathname, clearPageTarget]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !activeHighlight) return;
      event.preventDefault();
      clearPageTarget();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeHighlight, clearPageTarget]);

  useEffect(
    () => () => {
      clearHighlightTimeout();
      if (activeElementRef.current) {
        clearDonnyHighlightAttributes(activeElementRef.current);
      }
    },
    [clearHighlightTimeout],
  );

  return useMemo<DonnyActionsContextValue>(
    () => ({
      showPageTarget,
      clearPageTarget,
      prefillContactIntent,
      capturePageContext,
      activeHighlight,
      statusMessage,
      prefersReducedMotion,
    }),
    [
      activeHighlight,
      capturePageContext,
      clearPageTarget,
      prefillContactIntent,
      prefersReducedMotion,
      showPageTarget,
      statusMessage,
    ],
  );
}

export function useDonnyActions(): DonnyActionsContextValue {
  const context = useContext(DonnyActionsContext);
  if (!context) {
    throw new Error("useDonnyActions must be used within DonnyActionProvider");
  }
  return context;
}

export function useOptionalDonnyActions(): DonnyActionsContextValue | null {
  return useContext(DonnyActionsContext);
}
