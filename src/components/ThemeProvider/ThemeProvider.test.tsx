import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test component to access theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    document.body.className = "";
  });

  it("provides default light theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });

  it("loads theme from localStorage", () => {
    mockLocalStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
  });

  it("toggles theme correctly", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const themeDisplay = screen.getByTestId("current-theme");
    const toggleButton = screen.getByTestId("toggle-theme");

    expect(themeDisplay).toHaveTextContent("light");

    act(() => {
      toggleButton.click();
    });

    expect(themeDisplay).toHaveTextContent("dark");

    act(() => {
      toggleButton.click();
    });

    expect(themeDisplay).toHaveTextContent("light");
  });

  it("uses forced theme when provided", () => {
    render(
      <ThemeProvider forcedTheme="dark">
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
  });

  it("applies theme class to body", () => {
    render(
      <ThemeProvider forcedTheme="dark">
        <TestComponent />
      </ThemeProvider>,
    );

    expect(document.body).toHaveClass("themeDark");
  });

  it("saves theme to localStorage on change", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByTestId("toggle-theme");

    act(() => {
      toggleButton.click();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });
});
