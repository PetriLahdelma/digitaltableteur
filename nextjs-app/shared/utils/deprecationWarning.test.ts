import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  warnDeprecated,
  warnPropRename,
  warnPropRemoved,
  clearTrackedWarnings,
  getTrackedWarnings,
} from "./deprecationWarning";

describe("deprecationWarning", () => {
  beforeEach(() => {
    clearTrackedWarnings();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearTrackedWarnings();
  });

  describe("warnDeprecated", () => {
    it("should log a deprecation warning in development mode", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Button", "disabled", "isDisabled", "Will be removed in v2.0.0");

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain("⚠️");
      expect(consoleSpy.mock.calls[0][0]).toContain("Button");
      expect(consoleSpy.mock.calls[0][0]).toContain("disabled");

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should not log in production mode", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      warnDeprecated("Button", "disabled", "isDisabled");

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should only warn once per prop per session", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Button", "disabled", "isDisabled");
      const firstCallCount = consoleSpy.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0);

      warnDeprecated("Button", "disabled", "isDisabled");
      warnDeprecated("Button", "disabled", "isDisabled");

      // Should only log once (no additional warnings)
      expect(consoleSpy.mock.calls.length).toBe(firstCallCount);
      // Verify the warning key was tracked
      expect(getTrackedWarnings().size).toBe(1);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should track different props separately", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Button", "disabled", "isDisabled");
      warnDeprecated("Button", "loading", "isLoading");

      // Should log both warnings (each warning creates 3 console.warn calls = 6 total)
      expect(consoleSpy.mock.calls.length).toBeGreaterThan(0);
      // Verify both warnings were tracked
      expect(getTrackedWarnings().size).toBe(2);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should include additional context in warning message", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const context = "Will be removed in v2.0.0";
      warnDeprecated("Button", "disabled", "isDisabled", context);

      const allCalls = consoleSpy.mock.calls.flat().join(" ");
      expect(allCalls).toContain(context);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should include migration guide link", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Button", "disabled", "isDisabled");

      const allCalls = consoleSpy.mock.calls.flat().join(" ");
      expect(allCalls).toContain("Migration guide");
      expect(allCalls).toContain("MIGRATION_GUIDE.md");
      expect(allCalls).toContain("button");

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should format message with component name and prop names", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Card", "icon", "startIcon");

      const firstCall = consoleSpy.mock.calls[0][0];
      expect(firstCall).toContain("Card");
      expect(firstCall).toContain("icon");
      expect(firstCall).toContain("deprecated");

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("warnPropRename", () => {
    it("should warn with standard v2.0.0 removal message", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnPropRename("Button", "disabled", "isDisabled");

      const allCalls = consoleSpy.mock.calls.flat().join(" ");
      expect(allCalls).toContain("Will be removed in v2.0.0");
      expect(allCalls).toContain("isDisabled");

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should only warn once for the same prop rename", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnPropRename("Button", "disabled", "isDisabled");
      warnPropRename("Button", "disabled", "isDisabled");

      // Should only log once
      expect(consoleSpy.mock.calls.length).toBe(4);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("warnPropRemoved", () => {
    it("should warn about removed prop with replacement", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const replacement =
        'Use the "variant" prop instead for color control';
      warnPropRemoved("Button", "colorScheme", replacement);

      const allCalls = consoleSpy.mock.calls.flat().join(" ");
      expect(allCalls).toContain("has been removed");
      expect(allCalls).toContain("colorScheme");
      expect(allCalls).toContain(replacement);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should only warn once per removed prop", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnPropRemoved("Button", "colorScheme", "Use variant prop");
      warnPropRemoved("Button", "colorScheme", "Use variant prop");
      warnPropRemoved("Button", "colorScheme", "Use variant prop");

      // Should only log once (3 console.warn calls)
      expect(consoleSpy.mock.calls.length).toBe(3);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should not log in production mode", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      warnPropRemoved("Button", "colorScheme", "Use variant prop");

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should include migration guide link", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnPropRemoved("Button", "colorScheme", "Use variant prop");

      const allCalls = consoleSpy.mock.calls.flat().join(" ");
      expect(allCalls).toContain("Migration guide");
      expect(allCalls).toContain("MIGRATION_GUIDE.md");

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("clearTrackedWarnings", () => {
    it("should clear all tracked warnings", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      vi.spyOn(console, "warn");

      warnDeprecated("Button", "disabled", "isDisabled");
      expect(getTrackedWarnings().size).toBe(1);

      clearTrackedWarnings();
      expect(getTrackedWarnings().size).toBe(0);

      process.env.NODE_ENV = originalEnv;
    });

    it("should allow re-warning after clearing", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Button", "disabled", "isDisabled");
      const firstCallCount = consoleSpy.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0);

      clearTrackedWarnings();
      expect(getTrackedWarnings().size).toBe(0);

      warnDeprecated("Button", "disabled", "isDisabled");
      const secondCallCount = consoleSpy.mock.calls.length;

      // Should have logged twice
      expect(secondCallCount).toBe(firstCallCount * 2);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("getTrackedWarnings", () => {
    it("should return a copy of tracked warnings", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      vi.spyOn(console, "warn");

      warnDeprecated("Button", "disabled", "isDisabled");
      warnDeprecated("Card", "icon", "startIcon");

      const tracked = getTrackedWarnings();
      expect(tracked.size).toBe(2);
      expect(tracked.has("Button::disabled::isDisabled")).toBe(true);
      expect(tracked.has("Card::icon::startIcon")).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it("should return independent copy that does not affect internal state", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      vi.spyOn(console, "warn");

      warnDeprecated("Button", "disabled", "isDisabled");
      const tracked = getTrackedWarnings();
      tracked.clear();

      // Original should still have the warning
      expect(getTrackedWarnings().size).toBe(1);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Cross-component tracking", () => {
    it("should track warnings separately for different components", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      warnDeprecated("Button", "disabled", "isDisabled");
      warnDeprecated("Card", "disabled", "isDisabled");
      warnDeprecated("Modal", "disabled", "isDisabled");

      // Should log all three
      expect(consoleSpy.mock.calls.length).toBeGreaterThan(0);
      expect(getTrackedWarnings().size).toBe(3);

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle typical component deprecation workflow", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      // Simulate a component with deprecated prop
      const disabled = true;
      const isDisabled = undefined;

      if (disabled !== undefined && isDisabled === undefined) {
        warnDeprecated("Button", "disabled", "isDisabled", "Will be removed in v2.0.0");
      }

      expect(consoleSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should track mixed deprecation types", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      vi.spyOn(console, "warn");

      warnDeprecated("Button", "disabled", "isDisabled");
      warnPropRename("Card", "icon", "startIcon");
      warnPropRemoved("Modal", "hideOnBackdropClick", "Use onBackdropClick callback");

      const tracked = getTrackedWarnings();
      expect(tracked.size).toBe(3);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
