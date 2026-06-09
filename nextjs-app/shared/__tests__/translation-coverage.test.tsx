import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Import translation files
import enTranslations from "../locales/en/translation.json";
import fiTranslations from "../locales/fi/translation.json";
import svTranslations from "../locales/sv/translation.json";

describe("Translation Coverage", () => {
  const languages = ["en", "fi", "sv"];
  const translationFiles = {
    en: enTranslations,
    fi: fiTranslations,
    sv: svTranslations,
  };

  it("should have all three language files present", () => {
    languages.forEach((lang) => {
      const filePath = path.join(
        process.cwd(),
        "nextjs-app",
        "shared",
        "locales",
        lang,
        "translation.json",
      );
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it("should not be missing any English keys in fi/sv", () => {
    // English is the source-of-truth catalogue. Extra keys in fi/sv are
    // tolerated (often parked translations that have not been promoted to en
    // yet — see scripts/validate-translations.mjs), but *missing* keys would
    // ship a fallback to the user, which the catalog test must catch.
    const enKeys = new Set(Object.keys(enTranslations));
    const missing = (other: object, lang: string) => {
      const otherKeys = new Set(Object.keys(other));
      const missingKeys = [...enKeys].filter((k) => !otherKeys.has(k));
      expect(missingKeys, `Missing keys in ${lang}`).toEqual([]);
    };
    missing(fiTranslations, "fi");
    missing(svTranslations, "sv");
  });

  it("should not have empty translation values", () => {
    // Walks the JSON tree so nested namespaces (e.g. { nav: { home: "…" } })
    // are validated alongside flat keys. Empty strings or nullish leaves fail.
    const assertNonEmpty = (value: unknown, trailKey: string) => {
      if (value === null || value === undefined) {
        throw new Error(`Translation key "${trailKey}" is null/undefined`);
      }
      if (typeof value === "string") {
        expect(value.trim().length, `key "${trailKey}"`).toBeGreaterThan(0);
        return;
      }
      if (typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
          assertNonEmpty(v, trailKey ? `${trailKey}.${k}` : k);
        });
        return;
      }
      throw new Error(
        `Translation key "${trailKey}" is neither string nor object (got ${typeof value})`,
      );
    };
    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      assertNonEmpty(translations, "");
    });
  });

  it("should have all required navigation keys", () => {
    const requiredNavKeys = [
      "navHome",
      "navWork",
      "navAbout",
      "navPricing",
      "navBlog",
      "navContact",
    ];

    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      requiredNavKeys.forEach((key) => {
        expect(translations).toHaveProperty(key);
        expect(translations[key as keyof typeof translations]).toBeTruthy();
      });
    });
  });

  it("should have all required contact form keys", () => {
    const requiredContactKeys = [
      "contactTitle",
      "contactFullName",
      "contactFullNamePlaceholder",
      "contactEmail",
      "contactEmailPlaceholder",
      "contactPhone",
      "contactPhonePlaceholder",
      "contactInterest",
      "contactMessage",
      "contactMessagePlaceholder",
      "contactSubmit",
      "contactSuccessTitle",
      "contactSuccessMessage",
      "contactErrorTitle",
      "contactErrorMessage",
    ];

    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      requiredContactKeys.forEach((key) => {
        expect(translations).toHaveProperty(key);
        expect(translations[key as keyof typeof translations]).toBeTruthy();
      });
    });
  });

  it("should have all required validation message keys", () => {
    const requiredValidationKeys = [
      "contactValidationFullNameRequired",
      "contactValidationEmailRequired",
      "contactValidationEmailInvalid",
      "contactValidationMessageRequired",
      "inputValidationEmailInvalid",
      "inputValidationPhoneInvalid",
    ];

    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      requiredValidationKeys.forEach((key) => {
        expect(translations).toHaveProperty(key);
        expect(translations[key as keyof typeof translations]).toBeTruthy();
      });
    });
  });

  it("should have all required footer keys", () => {
    const requiredFooterKeys = [
      "footerAddress1",
      "footerAddress2",
      "footerBillingTitle",
      "footerBillingEInvoiceLabel",
      "footerBillingEInvoice",
      "footerBillingOperatorLabel",
      "footerBillingOperator",
      "footerBillingOperatorIdLabel",
      "footerBillingOperatorId",
      "footerImprint",
      "footerCopyright",
    ];

    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      requiredFooterKeys.forEach((key) => {
        expect(translations).toHaveProperty(key);
        expect(translations[key as keyof typeof translations]).toBeTruthy();
      });
    });
  });

  it("should have all required social sharing keys", () => {
    const requiredSocialKeys = [
      "shareOnInstagram",
      "shareOnTwitter",
      "shareOnFacebook",
      "shareOnReddit",
      "shareOnWhatsapp",
      "copyLinkToClipboard",
      "linkCopied",
    ];

    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      requiredSocialKeys.forEach((key) => {
        expect(translations).toHaveProperty(key);
        expect(translations[key as keyof typeof translations]).toBeTruthy();
      });
    });
  });

  it("should have consistent placeholder formatting", () => {
    // Short generic placeholders like "Enter" or "Select" are intentional and
    // sometimes the most natural localisation. The earlier > 5 char gate
    // misfired on those, so this test now only requires that any string
    // ending in `Placeholder` is non-empty + trimmed.
    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];

      Object.entries(translations).forEach(([key, value]) => {
        if (key.includes("Placeholder") && typeof value === "string") {
          expect(value.trim().length, `placeholder "${key}" in ${lang}`).toBeGreaterThan(0);
        }
      });
    });
  });
  it("should have proper capitalization for titles", () => {
    const titleKeys = [
      "contactTitle",
      "contactSuccessTitle",
      "contactErrorTitle",
    ];

    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      titleKeys.forEach((key) => {
        const value = translations[key as keyof typeof translations];
        if (value && typeof value === "string") {
          // First character should be uppercase
          expect(value.charAt(0)).toEqual(value.charAt(0).toUpperCase());
        }
      });
    });
  });

  it("should not have unexpected duplicate translations within the same language", () => {
    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      const values = Object.values(translations);

      // Allow some common words/phrases that can legitimately appear multiple times
      const commonWords = [
        "Email",
        "Home",
        "About",
        "Blog",
        "Contact",
        "Helsinki",
        "Privacy Policy",
        "Petri Lahdelma",
        "Digital Tableteur",
      ];

      const nonCommonValues = values.filter(
        (v) => typeof v === "string" && !commonWords.includes(v),
      );
      const uniqueNonCommonValues = Array.from(new Set(nonCommonValues));

      // Allow some level of duplication for legitimate cases
      const duplicateRate =
        1 - uniqueNonCommonValues.length / nonCommonValues.length;
      expect(duplicateRate).toBeLessThan(0.1); // Less than 10% duplicates
    });
  });
});
