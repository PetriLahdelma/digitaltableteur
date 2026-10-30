import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_INIT_SCRIPT } from "./theme-init-script";

const run = () => new Function(THEME_INIT_SCRIPT)();
const root = () => document.documentElement;

const mockDarkSystem = (dark: boolean) =>
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) => ({ matches: dark && query.includes("dark") }) as MediaQueryList,
  );

afterEach(() => {
  localStorage.clear();
  document.cookie = "dt_theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  root().className = "";
  delete root().dataset.theme;
  root().style.colorScheme = "";
  vi.restoreAllMocks();
});

describe("THEME_INIT_SCRIPT", () => {
  it("applies a saved dark choice before hydration", () => {
    mockDarkSystem(false);
    localStorage.setItem("theme", "dark");
    run();
    expect(root().classList.contains("themeDark")).toBe(true);
    expect(root().dataset.theme).toBe("dark");
    expect(root().style.colorScheme).toBe("dark");
  });

  it("falls back to the cookie when storage holds nothing valid", () => {
    mockDarkSystem(false);
    localStorage.setItem("theme", "sepia");
    document.cookie = "dt_theme=hcw; path=/";
    run();
    expect(root().classList.contains("themeHCW")).toBe(true);
    expect(root().style.colorScheme).toBe("light");
  });

  it("follows the system setting without a saved choice", () => {
    mockDarkSystem(true);
    run();
    expect(root().dataset.theme).toBe("dark");
  });

  it("stays light by default", () => {
    mockDarkSystem(false);
    run();
    expect(root().dataset.theme).toBe("light");
    expect(root().classList.contains("themeDark")).toBe(false);
  });
});
