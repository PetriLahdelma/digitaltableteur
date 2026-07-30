import { expect, afterEach, afterAll, vi } from "vitest";
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

// ---------------------------------------------------------------------------
// Leaked-timer sweep + requestAnimationFrame safety net.
//
// Page tests render components from the installed @digitaltableteur/react
// dist, which bundles real GSAP (the vi.mock of shared/lib/gsap above only
// intercepts source-path imports). GSAP keeps module-global timers alive —
// ScrollTrigger's sync interval, Observer's tap-reset timeout — that no
// component unmount can clear. Vitest tears the jsdom environment down per
// test file inside a long-lived worker, so a straggler timer can fire after
// teardown, hit a bare `requestAnimationFrame` on a globalThis that no longer
// has one, and fail the whole run with an unhandled ReferenceError while all
// tests pass. Two defenses:
//   1. Track every setTimeout/setInterval scheduled while a file runs and
//      clear the survivors in afterAll, before the environment is torn down.
//   2. Keep a requestAnimationFrame fallback reachable on the prototype of
//      globalThis: env teardown only deletes own properties, so the fallback
//      becomes visible exactly in the between-files gap where jsdom's rAF is
//      gone, and is shadowed again once the next environment installs.
// ---------------------------------------------------------------------------
type TimerId = ReturnType<typeof setTimeout>;
type ScheduleFn = (...args: unknown[]) => TimerId;
type ClearFn = (id: TimerId | undefined) => void;

const nativeSetTimeout = globalThis.setTimeout as unknown as ScheduleFn;
const nativeSetInterval = globalThis.setInterval as unknown as ScheduleFn;
const nativeClearTimeout = globalThis.clearTimeout as unknown as ClearFn;
const nativeClearInterval = globalThis.clearInterval as unknown as ClearFn;

const pendingTimeouts = new Set<TimerId>();
const pendingIntervals = new Set<TimerId>();

globalThis.setTimeout = ((...args: unknown[]) => {
  const id = nativeSetTimeout(...args);
  pendingTimeouts.add(id);
  return id;
}) as unknown as typeof globalThis.setTimeout;

globalThis.setInterval = ((...args: unknown[]) => {
  const id = nativeSetInterval(...args);
  pendingIntervals.add(id);
  return id;
}) as unknown as typeof globalThis.setInterval;

globalThis.clearTimeout = ((id?: TimerId) => {
  if (id !== undefined) pendingTimeouts.delete(id);
  nativeClearTimeout(id);
}) as unknown as typeof globalThis.clearTimeout;

globalThis.clearInterval = ((id?: TimerId) => {
  if (id !== undefined) pendingIntervals.delete(id);
  nativeClearInterval(id);
}) as unknown as typeof globalThis.clearInterval;

afterAll(() => {
  for (const id of pendingTimeouts) nativeClearTimeout(id);
  for (const id of pendingIntervals) nativeClearInterval(id);
  pendingTimeouts.clear();
  pendingIntervals.clear();
});

// The fallback resolves setTimeout at call time (bare identifier), so in the
// between-files gap it uses Node's own timer, not a closed jsdom window's.
const globalProto = Object.getPrototypeOf(globalThis) as object | null;
if (globalProto && !Object.prototype.hasOwnProperty.call(globalProto, "requestAnimationFrame")) {
  Object.defineProperty(globalProto, "requestAnimationFrame", {
    configurable: true,
    enumerable: false,
    writable: true,
    value: (cb: FrameRequestCallback) =>
      setTimeout(() => cb(Date.now()), 16) as unknown as number,
  });
  Object.defineProperty(globalProto, "cancelAnimationFrame", {
    configurable: true,
    enumerable: false,
    writable: true,
    value: (id: number) => clearTimeout(id as unknown as TimerId),
  });
}

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
