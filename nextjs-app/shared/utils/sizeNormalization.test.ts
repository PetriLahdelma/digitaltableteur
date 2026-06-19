import { describe, it, expect } from "vitest";
import {
  normalizeSizeProp,
  normalizeTitleSize,
  modernToLegacy,
  legacyToModern,
  isLegacySize,
  isModernSize,
  type SizeModern,
  type SizeLegacy,
  type TitleSizeLegacy,
} from "./sizeNormalization";

describe("sizeNormalization", () => {
  describe("normalizeSizeProp", () => {
    it("should normalize legacy uppercase to modern lowercase", () => {
      expect(normalizeSizeProp("S")).toBe("sm");
      expect(normalizeSizeProp("M")).toBe("md");
      expect(normalizeSizeProp("L")).toBe("lg");
    });

    it("should normalize legacy lowercase single-letter to modern", () => {
      expect(normalizeSizeProp("s")).toBe("sm");
      expect(normalizeSizeProp("m")).toBe("md");
      expect(normalizeSizeProp("l")).toBe("lg");
    });

    it("should pass through modern format unchanged", () => {
      expect(normalizeSizeProp("sm")).toBe("sm");
      expect(normalizeSizeProp("md")).toBe("md");
      expect(normalizeSizeProp("lg")).toBe("lg");
    });

    it("should return default 'md' when size is undefined", () => {
      expect(normalizeSizeProp()).toBe("md");
      expect(normalizeSizeProp(undefined)).toBe("md");
    });

    it("should return default 'md' for invalid sizes", () => {
      expect(normalizeSizeProp("invalid" as any)).toBe("md");
      expect(normalizeSizeProp("xl" as any)).toBe("md");
    });
  });

  describe("normalizeTitleSize", () => {
    it("should map modern and control aliases to the typography scale", () => {
      expect(normalizeTitleSize("xxs")).toBe("xxs");
      expect(normalizeTitleSize("xs")).toBe("xs");
      expect(normalizeTitleSize("sm")).toBe("s");
      expect(normalizeTitleSize("md")).toBe("m");
      expect(normalizeTitleSize("lg")).toBe("l");
      expect(normalizeTitleSize("xl")).toBe("xl");
      expect(normalizeTitleSize("xxl")).toBe("xxl");
    });

    it("should map legacy uppercase to the typography scale", () => {
      expect(normalizeTitleSize("XXS")).toBe("xxs");
      expect(normalizeTitleSize("XS")).toBe("xs");
      expect(normalizeTitleSize("S")).toBe("s");
      expect(normalizeTitleSize("M")).toBe("m");
      expect(normalizeTitleSize("L")).toBe("l");
      expect(normalizeTitleSize("XL")).toBe("xl");
      expect(normalizeTitleSize("XXL")).toBe("xxl");
    });

    it("should return default 'm' when size is undefined", () => {
      expect(normalizeTitleSize()).toBe("m");
      expect(normalizeTitleSize(undefined)).toBe("m");
    });

    it("should return default 'm' for invalid sizes", () => {
      expect(normalizeTitleSize("invalid" as any)).toBe("m");
      expect(normalizeTitleSize("huge" as any)).toBe("m");
    });
  });

  describe("modernToLegacy", () => {
    it("should convert modern to legacy format", () => {
      expect(modernToLegacy("sm")).toBe("S");
      expect(modernToLegacy("md")).toBe("M");
      expect(modernToLegacy("lg")).toBe("L");
    });

    it("should handle all modern size values", () => {
      const modernSizes: SizeModern[] = ["sm", "md", "lg"];
      const legacySizes: SizeLegacy[] = ["S", "M", "L"];

      modernSizes.forEach((modern, index) => {
        expect(modernToLegacy(modern)).toBe(legacySizes[index]);
      });
    });
  });

  describe("legacyToModern", () => {
    it("should convert legacy to modern format", () => {
      expect(legacyToModern("S")).toBe("sm");
      expect(legacyToModern("M")).toBe("md");
      expect(legacyToModern("L")).toBe("lg");
    });

    it("should handle all legacy size values", () => {
      const legacySizes: SizeLegacy[] = ["S", "M", "L"];
      const modernSizes: SizeModern[] = ["sm", "md", "lg"];

      legacySizes.forEach((legacy, index) => {
        expect(legacyToModern(legacy)).toBe(modernSizes[index]);
      });
    });
  });

  describe("isLegacySize", () => {
    it("should return true for legacy uppercase sizes", () => {
      expect(isLegacySize("S")).toBe(true);
      expect(isLegacySize("M")).toBe(true);
      expect(isLegacySize("L")).toBe(true);
    });

    it("should return false for modern lowercase sizes", () => {
      expect(isLegacySize("sm")).toBe(false);
      expect(isLegacySize("md")).toBe(false);
      expect(isLegacySize("lg")).toBe(false);
    });

    it("should return false for invalid sizes", () => {
      expect(isLegacySize("s")).toBe(false);
      expect(isLegacySize("m")).toBe(false);
      expect(isLegacySize("l")).toBe(false);
      expect(isLegacySize("XL")).toBe(false);
      expect(isLegacySize("invalid")).toBe(false);
    });
  });

  describe("isModernSize", () => {
    it("should return true for modern lowercase sizes", () => {
      expect(isModernSize("sm")).toBe(true);
      expect(isModernSize("md")).toBe(true);
      expect(isModernSize("lg")).toBe(true);
    });

    it("should return false for legacy uppercase sizes", () => {
      expect(isModernSize("S")).toBe(false);
      expect(isModernSize("M")).toBe(false);
      expect(isModernSize("L")).toBe(false);
    });

    it("should return false for invalid sizes", () => {
      expect(isModernSize("s")).toBe(false);
      expect(isModernSize("m")).toBe(false);
      expect(isModernSize("l")).toBe(false);
      expect(isModernSize("xl")).toBe(false);
      expect(isModernSize("invalid")).toBe(false);
    });
  });

  describe("round-trip conversions", () => {
    it("should maintain equivalence through modern → legacy → modern", () => {
      const modernSizes: SizeModern[] = ["sm", "md", "lg"];

      modernSizes.forEach((modern) => {
        const legacy = modernToLegacy(modern);
        const backToModern = legacyToModern(legacy);
        expect(backToModern).toBe(modern);
      });
    });

    it("should maintain equivalence through legacy → modern → legacy", () => {
      const legacySizes: SizeLegacy[] = ["S", "M", "L"];

      legacySizes.forEach((legacy) => {
        const modern = legacyToModern(legacy);
        const backToLegacy = modernToLegacy(modern);
        expect(backToLegacy).toBe(legacy);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle component prop migration scenario", () => {
      // Simulate component receiving either format
      const oldPropValue = "M"; // Legacy from existing usage
      const newPropValue = "md"; // Modern from new usage

      const normalizedOld = normalizeSizeProp(oldPropValue);
      const normalizedNew = normalizeSizeProp(newPropValue);

      expect(normalizedOld).toBe("md");
      expect(normalizedNew).toBe("md");
      expect(normalizedOld).toBe(normalizedNew);
    });

    it("should handle title size normalization for Modal component", () => {
      // Modal titleSize supports both formats
      const legacyTitleSize = "L";
      const modernTitleSize = "lg";

      const normalizedLegacy = normalizeTitleSize(legacyTitleSize);
      const normalizedModern = normalizeTitleSize(modernTitleSize);

      // Both normalize to the lowercase typography scale Title accepts.
      expect(normalizedLegacy).toBe("l");
      expect(normalizedModern).toBe("l");
    });

    it("should provide type-safe conversions", () => {
      // TypeScript should enforce correct types
      const modern: SizeModern = "sm";
      const legacy: SizeLegacy = "S";

      const convertedToLegacy: SizeLegacy = modernToLegacy(modern);
      const convertedToModern: SizeModern = legacyToModern(legacy);

      expect(convertedToLegacy).toBe("S");
      expect(convertedToModern).toBe("sm");
    });
  });
});
