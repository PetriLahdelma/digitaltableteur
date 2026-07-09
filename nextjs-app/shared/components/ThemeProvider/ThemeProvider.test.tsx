import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeProvider, useTheme } from "@dt/ThemeProvider";

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
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-hcb" onClick={() => setTheme("hcb")}>
        Set HCB
      </button>
      <button data-testid="set-hcw" onClick={() => setTheme("hcw")}>
        Set HCW
      </button>
      <button
        data-testid="set-invalid"
        onClick={() => setTheme("invalid" as any)}
      >
        Set Invalid
      </button>
    </div>
  );
};

const ExternalBridgeThemeProbe = () => {
  const { theme } = useTheme();
  return <span data-testid="bridge-theme">{theme}</span>;
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

  it("toggles theme correctly across all variants", () => {
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

    expect(themeDisplay).toHaveTextContent("hcb");

    act(() => {
      toggleButton.click();
    });

    expect(themeDisplay).toHaveTextContent("hcw");

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

  it("applies high contrast black theme class", () => {
    render(
      <ThemeProvider forcedTheme="hcb">
        <TestComponent />
      </ThemeProvider>,
    );

    expect(document.body).toHaveClass("themeHCB");
  });

  it("applies high contrast white theme class", () => {
    render(
      <ThemeProvider forcedTheme="hcw">
        <TestComponent />
      </ThemeProvider>,
    );

    expect(document.body).toHaveClass("themeHCW");
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

  it("allows setting theme explicitly", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const setHcbButton = screen.getByTestId("set-hcb");
    act(() => {
      setHcbButton.click();
    });

    expect(screen.getByTestId("current-theme")).toHaveTextContent("hcb");

    const setHcwButton = screen.getByTestId("set-hcw");

    act(() => {
      setHcwButton.click();
    });

    expect(screen.getByTestId("current-theme")).toHaveTextContent("hcw");
  });

  it("falls back to default when setTheme receives invalid value", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const invalidButton = screen.getByTestId("set-invalid");
    act(() => invalidButton.click());
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });

  it("bridges theme updates to consumers outside the provider tree", async () => {
    const provider = render(
      <ThemeProvider forcedTheme="dark">
        <span />
      </ThemeProvider>,
    );

    render(<ExternalBridgeThemeProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("bridge-theme")).toHaveTextContent("dark");
    });

    provider.rerender(
      <ThemeProvider forcedTheme="hcb">
        <span />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("bridge-theme")).toHaveTextContent("hcb");
    });
  });
});
