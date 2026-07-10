import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider } from "../components/ThemeProvider";

import { usePersistentTheme } from "./usePersistentTheme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
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

  it("cycles theme and persists through the package provider", () => {
    const { result } = renderHook(() => usePersistentTheme(), { wrapper });
    act(() => result.current.setPersistentTheme("dark"));
    expect(localStorage.getItem("theme")).toBe("dark");

    let next: string | undefined;
    act(() => {
      next = result.current.cycleTheme();
    });
    expect(next).toBe("hcb");
    expect(localStorage.getItem("theme")).toBe("hcb");
  });
});
