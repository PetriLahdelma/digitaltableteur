import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock as any;

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = IntersectionObserverMock as any;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
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
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock navigator.share for Web Share API testing
Object.defineProperty(navigator, "share", {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});
