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
        "src",
        "locales",
        lang,
        "translation.json",
      );
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it("should have the same translation keys across all languages", () => {
    const enKeys = Object.keys(enTranslations);
    const fiKeys = Object.keys(fiTranslations);
    const svKeys = Object.keys(svTranslations);

    // Check that all languages have the same keys
    expect(fiKeys.sort()).toEqual(enKeys.sort());
    expect(svKeys.sort()).toEqual(enKeys.sort());
  });

  it("should not have empty translation values", () => {
    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];
      Object.entries(translations).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe("string");
        if (typeof value === "string") {
          expect(value.trim().length).toBeGreaterThan(0);
        }
      });
    });
  });

  it("should have all required navigation keys", () => {
    const requiredNavKeys = [
      "navHome",
      "navWork",
      "navAbout",
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
      "footerBillingName",
      "footerBillingAddress",
      "footerBillingZip",
      "footerBillingVat",
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
    languages.forEach((lang) => {
      const translations =
        translationFiles[lang as keyof typeof translationFiles];

      // Check that placeholder keys contain meaningful text
      Object.entries(translations).forEach(([key, value]) => {
        if (key.includes("Placeholder") && typeof value === "string") {
          expect(value.length).toBeGreaterThan(5); // Placeholders should be descriptive
          // Allow "Enter" as it's a common and acceptable placeholder start
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
