/**
 * Theme System Verification Tests
 *
 * Integration tests for the theme system including:
 * - Theme class application
 * - localStorage persistence
 * - prefers-color-scheme media query response
 * - System preference detection
 *
 * @file theme-verification.test.tsx
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from "vitest";
import { ThemeProvider, useTheme } from "@digitaltableteur/react";

// Mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock matchMedia
const createMockMatchMedia = (prefersDark: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mediaQueryList = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(
      (event: string, callback: (e: MediaQueryListEvent) => void) => {
        if (event === "change") listeners.push(callback);
      }
    ),
    removeEventListener: vi.fn(
      (event: string, callback: (e: MediaQueryListEvent) => void) => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }
    ),
    addListener: vi.fn((callback: (e: MediaQueryListEvent) => void) =>
      listeners.push(callback)
    ),
    removeListener: vi.fn((callback: (e: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }),
    dispatchEvent: vi.fn(),
    onchange: null,
  };

  // Helper to simulate preference change
  const simulatePreferenceChange = (newPrefersDark: boolean) => {
    mediaQueryList.matches = newPrefersDark;
    listeners.forEach((listener) =>
      listener({
        matches: newPrefersDark,
        media: "(prefers-color-scheme: dark)",
      } as MediaQueryListEvent)
    );
  };

  return { mediaQueryList, simulatePreferenceChange };
};

// Test component to access theme context
const ThemeTestComponent = () => {
  const {
    theme,
    toggleTheme,
    setTheme,
    systemPreference,
    isExplicitChoice,
    resetToSystemPreference,
  } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="system-preference">{systemPreference}</span>
      <span data-testid="is-explicit">{String(isExplicitChoice)}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        Light
      </button>
      <button data-testid="reset" onClick={resetToSystemPreference}>
        Reset
      </button>
    </div>
  );
};

describe("Theme System Verification", () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  let originalMatchMedia: typeof window.matchMedia;
  let mockMatchMediaResult: ReturnType<typeof createMockMatchMedia>;

  beforeEach(() => {
    // Setup mock localStorage
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    // Setup mock matchMedia (defaults to light preference)
    mockMatchMediaResult = createMockMatchMedia(false);
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue(mockMatchMediaResult.mediaQueryList);

    // Clear document classes
    document.documentElement.className = "";
    document.body.className = "";
    document.documentElement.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");

    // Clear cookies
    document.cookie = "dt_theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  describe("Theme Class Application", () => {
    it("applies dark theme class to documentElement and body", () => {
      render(
        <ThemeProvider forcedTheme="dark">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass("themeDark");
      expect(document.body).toHaveClass("themeDark");
    });

    it("applies high contrast black theme class correctly", () => {
      render(
        <ThemeProvider forcedTheme="hcb">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass("themeHCB");
      expect(document.body).toHaveClass("themeHCB");
    });

    it("applies high contrast white theme class correctly", () => {
      render(
        <ThemeProvider forcedTheme="hcw">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass("themeHCW");
      expect(document.body).toHaveClass("themeHCW");
    });

    it("sets data-theme attribute on documentElement", () => {
      render(
        <ThemeProvider forcedTheme="dark">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    it("sets colorScheme style for dark themes", () => {
      render(
        <ThemeProvider forcedTheme="dark">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("sets colorScheme style for light themes", () => {
      render(
        <ThemeProvider forcedTheme="light">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });

  describe("localStorage Persistence", () => {
    it("saves theme to localStorage on toggle", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("toggle-theme").click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("saves theme to localStorage on explicit setTheme", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("set-dark").click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("loads theme from localStorage on mount", () => {
      mockLocalStorage.setItem("theme", "hcb");

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("current-theme")).toHaveTextContent("hcb");
    });

    it("clears localStorage on resetToSystemPreference", async () => {
      mockLocalStorage.setItem("theme", "dark");

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // First set an explicit theme
      act(() => {
        screen.getByTestId("set-dark").click();
      });

      // Then reset
      act(() => {
        screen.getByTestId("reset").click();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("theme");
    });
  });

  describe("System Preference Detection", () => {
    it("detects light system preference", () => {
      mockMatchMediaResult = createMockMatchMedia(false);
      window.matchMedia = vi.fn().mockReturnValue(mockMatchMediaResult.mediaQueryList);

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("system-preference")).toHaveTextContent("light");
    });

    it("detects dark system preference", () => {
      mockMatchMediaResult = createMockMatchMedia(true);
      window.matchMedia = vi.fn().mockReturnValue(mockMatchMediaResult.mediaQueryList);

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("system-preference")).toHaveTextContent("dark");
    });

    it("defaults to system preference when no stored preference exists", () => {
      mockMatchMediaResult = createMockMatchMedia(true);
      window.matchMedia = vi.fn().mockReturnValue(mockMatchMediaResult.mediaQueryList);

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Should default to dark since system prefers dark
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    });

    it("uses stored preference over system preference", () => {
      mockLocalStorage.setItem("theme", "light");
      mockMatchMediaResult = createMockMatchMedia(true); // System prefers dark
      window.matchMedia = vi.fn().mockReturnValue(mockMatchMediaResult.mediaQueryList);

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Should use stored light theme, not system dark
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });
  });

  describe("Explicit Choice Tracking", () => {
    it("starts with isExplicitChoice false when no stored preference", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("is-explicit")).toHaveTextContent("false");
    });

    it("sets isExplicitChoice to true when theme is toggled", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("toggle-theme").click();
      });

      expect(screen.getByTestId("is-explicit")).toHaveTextContent("true");
    });

    it("sets isExplicitChoice to true when theme is explicitly set", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("set-dark").click();
      });

      expect(screen.getByTestId("is-explicit")).toHaveTextContent("true");
    });

    it("resets isExplicitChoice to false on resetToSystemPreference", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Set explicit theme
      act(() => {
        screen.getByTestId("set-dark").click();
      });

      expect(screen.getByTestId("is-explicit")).toHaveTextContent("true");

      // Reset to system
      act(() => {
        screen.getByTestId("reset").click();
      });

      expect(screen.getByTestId("is-explicit")).toHaveTextContent("false");
    });
  });

  describe("Theme Cycling", () => {
    it("cycles through all four themes in correct order", () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId("toggle-theme");
      const themeDisplay = screen.getByTestId("current-theme");

      // light -> dark
      act(() => toggleButton.click());
      expect(themeDisplay).toHaveTextContent("dark");

      // dark -> hcb
      act(() => toggleButton.click());
      expect(themeDisplay).toHaveTextContent("hcb");

      // hcb -> hcw
      act(() => toggleButton.click());
      expect(themeDisplay).toHaveTextContent("hcw");

      // hcw -> light (cycle complete)
      act(() => toggleButton.click());
      expect(themeDisplay).toHaveTextContent("light");
    });
  });
});
