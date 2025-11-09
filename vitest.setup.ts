import { expect, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import i18n, { initI18n } from "./src/i18n";

afterEach(() => {
  cleanup();
});

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await initI18n();
  }
});

// Global environment variable mocks for testing
vi.stubEnv("VITE_EMAIL_SERVICE_ID", "test_service_id");
vi.stubEnv("VITE_EMAIL_TEMPLATE_ID", "test_template_id");
vi.stubEnv("VITE_EMAIL_PUBLIC_KEY", "test_public_key");

// Mock window.matchMedia for JSDOM environment
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.share for Web Share API testing
Object.defineProperty(navigator, "share", {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});
