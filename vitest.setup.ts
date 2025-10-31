import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Global environment variable mocks for testing
vi.stubEnv("VITE_EMAIL_SERVICE_ID", "test_service_id");
vi.stubEnv("VITE_EMAIL_TEMPLATE_ID", "test_template_id");
vi.stubEnv("VITE_EMAIL_PUBLIC_KEY", "test_public_key");
