import { expect, afterEach, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

// next/image and next/link are aliased to test-stubs/ in vitest.config.mts
// so jsdom never touches nextjs-app/node_modules/next (which ships a second
// React copy and crashes useContext under jsdom).

// Default mock for next/navigation. Individual tests can override with
// vi.mock("next/navigation", ...). This prevents components that read
// usePathname/useRouter at module init from crashing.
vi.mock("@/providers/ThemeProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/providers/ThemeProvider")>();
  return {
    ...actual,
    useTheme: () => ({
      theme: "light" as const,
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      systemPreference: "light" as const,
      isExplicitChoice: false,
      resetToSystemPreference: vi.fn(),
    }),
  };
});

vi.mock("@/providers/AnimationProvider", () => ({
  AnimationProvider: ({ children }: { children: React.ReactNode }) => children,
  useAnimationContext: () => ({
    motionPreference: "reduced" as const,
    isReady: true,
  }),
}));

vi.mock("@/nextjs-app/shared/lib/gsap", () => {
  const timeline = () => ({
    to: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    kill: vi.fn(),
  });

  const gsap = {
    context: (fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    },
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline,
    registerPlugin: vi.fn(),
    killTweensOf: vi.fn(),
    utils: {
      toArray: (v: unknown) => (Array.isArray(v) ? v : v ? [v] : []),
    },
  };

  return {
    gsap,
    useGSAP: (fn: () => void) => {
      fn();
    },
    ScrollTrigger: {
      create: vi.fn(),
      refresh: vi.fn(),
      getAll: vi.fn(() => []),
      killAll: vi.fn(),
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver = ResizeObserverMock as any;

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.IntersectionObserver = IntersectionObserverMock as any;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches:
      query.includes("prefers-reduced-motion") ||
      query.includes("prefers-contrast"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock navigator.share for Web Share API testing
Object.defineProperty(navigator, "share", {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

// jsdom returns `undefined` from HTMLMediaElement.play(), but real browsers
// (and code that calls `.catch()` on the result) expect a Promise. Stubbing
// here keeps audio/video-aware components (Designerman, ChatWidget toggle
// sounds) from crashing under the test runner.
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  writable: true,
  value: vi.fn(),
});
