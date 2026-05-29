import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { NextThemeProvider } from "@/providers/ThemeProvider";

vi.unmock("@/providers/ThemeProvider");

import { usePersistentTheme } from "./usePersistentTheme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextThemeProvider>{children}</NextThemeProvider>
);

describe("usePersistentTheme", () => {
  beforeEach(() => {
    document.cookie = "";
    localStorage.clear();
  });

  it("reads theme from cookie on mount", async () => {
    document.cookie = "dt_theme=dark";
    const { result } = renderHook(() => usePersistentTheme(), { wrapper });
    await vi.waitFor(() => {
      expect(result.current.theme).toBe("dark");
    });
  });

  it("cycles theme and persists cookie", () => {
    const { result } = renderHook(() => usePersistentTheme(), { wrapper });
    act(() => result.current.setPersistentTheme("dark"));
    expect(document.cookie).toContain("dt_theme=dark");

    let next: string | undefined;
    act(() => {
      next = result.current.cycleTheme();
    });
    expect(next).toBe("hcb");
    expect(document.cookie).toContain("dt_theme=hcb");
  });
});
