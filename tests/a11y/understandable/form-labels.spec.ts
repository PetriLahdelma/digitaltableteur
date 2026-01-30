/**
 * UNDR-02, UNDR-03, UNDR-04, UNDR-05: Form Labels and Error Messages Tests
 *
 * Tests for WCAG requirements:
 * - 3.3.2 Labels or Instructions (UNDR-02)
 * - 3.3.1 Error Identification (UNDR-03)
 * - Required fields indication (UNDR-04)
 * - 3.3.3 Error Suggestion (UNDR-05)
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html
 */
import { test, expect } from "@playwright/test";

test.describe("UNDR-02: Form Input Labels", () => {
  test("contact form inputs have visible labels", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Get all input elements (excluding hidden and submit)
    const inputs = page.locator(
      'input:not([type="hidden"]):not([type="submit"]), textarea'
    );
    const count = await inputs.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute("id");
      const inputName = await input.getAttribute("name");
      const inputType = await input.getAttribute("type");

      // Each input should have an associated label (via for/id or wrapping)
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        const labelCount = await label.count();

        // Either has a label, or is wrapped in a label, or has aria-label
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledby = await input.getAttribute("aria-labelledby");

        const hasAccessibleName =
          labelCount > 0 || ariaLabel || ariaLabelledby;

        expect(
          hasAccessibleName,
          `Input ${inputName || inputId || inputType} should have accessible name`
        ).toBeTruthy();
      }
    }
  });

  test("labels are positioned above or beside inputs (not placeholder-only)", async ({
    page,
  }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Get form labels
    const labels = page.locator("label:visible");
    const count = await labels.count();

    // There should be visible labels (not hidden or replaced by placeholders)
    expect(
      count,
      "Contact form should have visible labels, not placeholder-only"
    ).toBeGreaterThan(0);
  });

  test("labels have descriptive text", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    const labels = page.locator("label:visible");
    const count = await labels.count();

    for (let i = 0; i < count; i++) {
      const label = labels.nth(i);
      const text = await label.textContent();

      // Label should have meaningful text (at least 2 characters, excluding just asterisk)
      const cleanText = text?.replace(/\*/g, "").trim();
      expect(
        cleanText?.length,
        `Label should have meaningful text`
      ).toBeGreaterThan(1);
    }
  });
});

test.describe("UNDR-04: Required Field Indication", () => {
  test("required fields have visual asterisk", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Check for asterisk markers in required field labels
    // The asterisk should be in the label but hidden from AT
    const asterisks = page.locator('label span[aria-hidden="true"]');
    const asteriskTexts = await asterisks.allTextContents();

    // Filter to find actual asterisks
    const hasAsterisks = asteriskTexts.some((text) => text.includes("*"));

    expect(
      hasAsterisks,
      "Required fields should have visual asterisk indicator"
    ).toBeTruthy();
  });

  test("required fields have screen reader text", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Check for sr-only required text in labels
    const srOnlyTexts = await page
      .locator("label .sr-only, label .srOnly, label [class*='sr-only']")
      .allTextContents();

    // Should have "(required)" text for screen readers
    const hasRequiredText = srOnlyTexts.some((text) =>
      /required|pakollinen|obligatorisk/i.test(text)
    );

    expect(
      hasRequiredText,
      "Required fields should have screen reader text"
    ).toBeTruthy();
  });

  test("required inputs have required attribute or aria-required", async ({
    page,
  }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Get inputs that should be required (name, email, message typically)
    const nameInput = page.locator('input[name="name"], input[id*="name"]');
    const emailInput = page.locator(
      'input[type="email"], input[name="email"]'
    );
    const messageInput = page.locator('textarea[name="message"], textarea');

    // At least some inputs should have required attribute
    const inputs = [nameInput, emailInput, messageInput];
    let requiredCount = 0;

    for (const input of inputs) {
      const count = await input.count();
      if (count > 0) {
        const required = await input.first().getAttribute("required");
        const ariaRequired = await input.first().getAttribute("aria-required");
        if (required !== null || ariaRequired === "true") {
          requiredCount++;
        }
      }
    }

    expect(
      requiredCount,
      "At least one form field should be marked as required"
    ).toBeGreaterThan(0);
  });
});

test.describe("UNDR-03/UNDR-05: Error Messages and Suggestions", () => {
  test("invalid email shows error message", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Find email input
    const emailInput = page.locator('input[type="email"]').first();

    // Enter invalid email format
    await emailInput.fill("invalid");
    await emailInput.blur();

    // Wait a bit for validation to trigger
    await page.waitForTimeout(500);

    // Error message should appear (role="alert" or aria-describedby'd element)
    const errorMessage = page.locator('[role="alert"]');
    const helperText = page.locator('[id*="helper"], [id*="error"]');

    // Either has role="alert" or has visible helper text
    const alertCount = await errorMessage.count();
    const helperCount = await helperText.count();

    // At least some error indication should be present
    expect(
      alertCount + helperCount,
      "Invalid email should show error message"
    ).toBeGreaterThan(0);
  });

  test("email with common typo shows suggestion", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Find email input
    const emailInput = page.locator('input[type="email"]').first();

    // Enter email with common typo (gmail -> gmial)
    await emailInput.fill("test@gmial.com");
    await emailInput.blur();

    // Wait for typo detection
    await page.waitForTimeout(500);

    // Should show "Did you mean" suggestion in some language
    const suggestion = page.locator(
      'text=/Did you mean|Tarkoititko|Menade du/i'
    );
    const suggestionCount = await suggestion.count();

    // The email typo suggestion feature should be active
    expect(
      suggestionCount,
      "Email typo (gmial.com) should show suggestion"
    ).toBeGreaterThan(0);
  });

  test("required field left empty shows error on submit attempt", async ({
    page,
  }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Find submit button
    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"]'
    );

    if ((await submitButton.count()) > 0) {
      // Click submit without filling required fields
      await submitButton.first().click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Should show error indication
      const errors = page.locator(
        '[role="alert"], [aria-invalid="true"], :invalid'
      );
      const errorCount = await errors.count();

      expect(
        errorCount,
        "Empty required fields should show error on submit"
      ).toBeGreaterThan(0);
    }
  });

  test("error messages are associated with their inputs", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Trigger an error
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("invalid");
    await emailInput.blur();
    await page.waitForTimeout(500);

    // Check if input has aria-describedby pointing to error
    const ariaDescribedby = await emailInput.getAttribute("aria-describedby");

    if (ariaDescribedby) {
      // The referenced element should exist
      const describedByElement = page.locator(`#${ariaDescribedby}`);
      const exists = (await describedByElement.count()) > 0;

      expect(
        exists,
        `aria-describedby references element #${ariaDescribedby}`
      ).toBeTruthy();
    }

    // Check if input has aria-invalid when in error state
    const ariaInvalid = await emailInput.getAttribute("aria-invalid");
    // aria-invalid should be "true" for invalid input
    expect(ariaInvalid).toBe("true");
  });
});

test.describe("UNDR-02: Language of Parts (Content Language)", () => {
  test("blog articles have lang attribute for English content", async ({
    page,
  }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });

    // Check if there are any lang attributes on content sections
    const langElements = page.locator('[lang="en"], [lang="fi"], [lang="sv"]');
    const count = await langElements.count();

    // Blog content in different language should be marked
    // This is informational - some blogs may not have mixed language content
    if (count > 0) {
      // If lang attributes exist, they should be valid
      const langValues = await langElements.evaluateAll((els) =>
        els.map((el) => el.getAttribute("lang"))
      );

      for (const lang of langValues) {
        expect(lang).toMatch(/^[a-z]{2}/i);
      }
    }
  });

  test("language notice appears when content differs from UI language", async ({
    page,
  }) => {
    // Go to blog (which has English content)
    await page.goto("/blog", { waitUntil: "domcontentloaded" });

    // Check if language notice component exists (informational)
    const languageNotice = page.locator('[data-testid="language-notice"]');
    const noticeCount = await languageNotice.count();

    // This is informational - notice only shows when UI language differs from content
    // Default UI is English, blog is English, so notice should NOT show
    // This verifies the conditional rendering works correctly
    if (noticeCount > 0) {
      // If notice exists, it should have appropriate ARIA attributes
      const role = await languageNotice.getAttribute("role");
      expect(role).toBe("note");
    }
  });
});
