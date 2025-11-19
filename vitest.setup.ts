import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock environment variables that components might read
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_GA_ID: "test-ga-id",
    VITE_SENTRY_DSN: "",
    MODE: "test",
    DEV: false,
    PROD: false,
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

// Global environment variable mocks for testing
vi.stubEnv("VITE_EMAIL_SERVICE_ID", "test_service_id");
vi.stubEnv("VITE_EMAIL_TEMPLATE_ID", "test_template_id");
vi.stubEnv("VITE_EMAIL_PUBLIC_KEY", "test_public_key");

// Mock navigator.share for Web Share API testing
Object.defineProperty(navigator, "share", {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

// i18n is now initialized synchronously when imported, no setup needed
