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
