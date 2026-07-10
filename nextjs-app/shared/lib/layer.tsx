"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type LayerRole = "modal" | "popover" | "toast" | "tooltip";

export interface LayerProviderProps {
  children: ReactNode;
  /** Portal target for layered UI. Defaults to document.body when available. */
  container?: HTMLElement | null;
  /** Base z-index for modal layers. */
  baseZIndex?: number;
}

export interface LayerOptions {
  role?: LayerRole;
  level?: number;
}

export interface LayerRuntime {
  container: HTMLElement | null;
  role: LayerRole;
  zIndex: number;
}

export type LayerState = LayerRuntime;

interface LayerContextValue {
  container?: HTMLElement | null;
  baseZIndex: number;
}

const ROLE_OFFSETS: Record<LayerRole, number> = {
  modal: 0,
  popover: 100,
  toast: 200,
  tooltip: 300,
};

const LayerContext = createContext<LayerContextValue>({
  container: undefined,
  baseZIndex: 5000,
});

function getDefaultContainer(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.body;
}

export function LayerProvider({
  children,
  container,
  baseZIndex = 5000,
}: LayerProviderProps) {
  const value = useMemo(
    () => ({ container, baseZIndex }),
    [container, baseZIndex],
  );

  return (
    <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
  );
}

export function useLayer(options: LayerOptions = {}): LayerRuntime {
  const { container, baseZIndex } = useContext(LayerContext);
  const role = options.role ?? "modal";
  const level = options.level ?? 0;

  return {
    container: container ?? getDefaultContainer(),
    role,
    zIndex: baseZIndex + ROLE_OFFSETS[role] + level,
  };
}
