"use client";

import { useEffect } from "react";

import { registerConsultingWebMcpTools } from "@/nextjs-app/shared/lib/webmcp/register-consulting-tools";
import type { NavigatorWithWebMcp } from "@/nextjs-app/shared/lib/webmcp/types";

/**
 * Registers read-only WebMCP tools for in-browser AI agents (Chrome preview).
 * No-op when navigator.modelContext is unavailable.
 */
export function WebMcpProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const nav = navigator as NavigatorWithWebMcp;
    const modelContext = nav.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      return;
    }

    const controller = new AbortController();
    try {
      registerConsultingWebMcpTools(modelContext, controller.signal);
    } catch {
      // Duplicate registration or unsupported runtime — safe to ignore
    }

    return () => controller.abort();
  }, []);

  return children;
}
