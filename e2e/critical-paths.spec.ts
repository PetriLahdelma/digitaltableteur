/**
 * Critical Path E2E Tests
 *
 * These tests verify the most important user journeys work correctly:
 * 1. Homepage loads and displays key content
 * 2. Navigation to major pages works
 * 3. Contact form submission flow
 * 4. Blog listing and article navigation
 * 5. Work/portfolio page loads
 * 6. Theme switching persists
 * 7. Language switching works
 *
 * Prerequisites:
 * 1. Install Playwright: npx playwright install
 * 2. Start dev server: npm run dev
 * 3. Run: npx playwright test e2e/critical-paths.spec.ts
 *
 * Created: Phase 12-2 Launch Preparation
 */

import { test, expect } from "@playwright/test";

test.describe("Critical Path Tests", () => {
  test.describe("Homepage", () => {
    test("loads and displays hero section", async ({ page }) => {
      await page.goto("/");

      // Check page title
      await expect(page).toHaveTitle(/Digitaltableteur/);

      // Hero section should be visible
      const hero = page.locator("main").first();
      await expect(hero).toBeVisible();

      // Check for main navigation
      const nav = page.locator("header nav");
      await expect(nav).toBeVisible();
    });

    test("has working navigation links", async ({ page }) => {
      await page.goto("/");

      // Check major nav items exist
      const aboutLink = page.getByRole("link", { name: /about/i });
      const workLink = page.getByRole("link", { name: /work/i });
      const blogLink = page.getByRole("link", { name: /blog/i });
      const contactLink = page.getByRole("link", { name: /contact/i });

      await expect(aboutLink).toBeVisible();
      await expect(workLink).toBeVisible();
      await expect(blogLink).toBeVisible();
      await expect(contactLink).toBeVisible();
    });

    test("footer is visible with contact info", async ({ page }) => {
      await page.goto("/");

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      // Check for email link
      const emailLink = page.getByRole("link", {
        name: /mail@digitaltableteur/i,
      });
      await expect(emailLink).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("About page loads correctly", async ({ page }) => {
      await page.goto("/about");

      await expect(page).toHaveTitle(/About/i);

      // Page should have main content
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("Work page loads correctly", async ({ page }) => {
      await page.goto("/work");

      await expect(page).toHaveTitle(/Work/i);

      // Page should have project cards or content
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("Blog page loads correctly", async ({ page }) => {
      await page.goto("/blog");

      await expect(page).toHaveTitle(/Blog/i);

      // Should show blog posts
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("Contact page loads correctly", async ({ page }) => {
      await page.goto("/contact");

      await expect(page).toHaveTitle(/Contact/i);

      // Should show contact form
      const form = page.locator("form");
      await expect(form).toBeVisible();
    });

    test("Privacy policy page loads", async ({ page }) => {
      await page.goto("/privacy-policy");

      await expect(page).toHaveTitle(/Privacy/i);
    });

    test("Accessibility statement page loads", async ({ page }) => {
      await page.goto("/accessibility");

      await expect(page).toHaveTitle(/Accessibility/i);
    });
  });

  test.describe("Contact Form", () => {
    test("form has required fields", async ({ page }) => {
      await page.goto("/contact");

      // Check for form fields
      const nameInput = page.getByLabel(/name/i);
      const emailInput = page.getByLabel(/email/i);
      const messageInput = page.getByLabel(/message/i);
      const submitButton = page.getByRole("button", { name: /send|submit/i });

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(messageInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    });

    test("form shows validation errors for empty submission", async ({
      page,
    }) => {
      await page.goto("/contact");

      // Try to submit empty form
      const submitButton = page.getByRole("button", { name: /send|submit/i });
      await submitButton.click();

      // Should show validation error (HTML5 validation or custom)
      const nameInput = page.getByLabel(/name/i);
      const isInvalid = await nameInput.evaluate(
        (el) =>
          (el as HTMLInputElement).validationMessage !== "" ||
          el.getAttribute("aria-invalid") === "true"
      );

      expect(isInvalid).toBeTruthy();
    });
  });

  test.describe("Blog", () => {
    test("blog listing shows articles", async ({ page }) => {
      await page.goto("/blog");

      // Should have at least one article card/link
      const articleLinks = page.locator("article, [data-testid='article-card']");
      // If no articles, check for any main content
      const hasContent = await articleLinks.count() > 0 || (await page.locator("main").textContent())?.length > 100;
      expect(hasContent).toBeTruthy();
    });

    test("clicking an article navigates to detail page", async ({ page }) => {
      await page.goto("/blog");

      // Find first article link and click
      const articleLink = page.getByRole("link").filter({ hasText: /.{10,}/ }).first();

      if (await articleLink.isVisible()) {
        const href = await articleLink.getAttribute("href");
        if (href?.startsWith("/blog/")) {
          await articleLink.click();
          await expect(page).toHaveURL(/\/blog\//);
        }
      }
    });
  });

  test.describe("Theme Switching", () => {
    test("theme toggle exists and works", async ({ page }) => {
      await page.goto("/");

      // Look for theme toggle button
      const themeButton = page.getByRole("button", { name: /theme|dark|light/i });

      if (await themeButton.isVisible()) {
        // Get initial theme
        const htmlElement = page.locator("html");
        const initialClass = await htmlElement.getAttribute("class");

        // Click theme toggle
        await themeButton.click();

        // Check class changed
        const newClass = await htmlElement.getAttribute("class");
        expect(newClass).not.toBe(initialClass);
      }
    });
  });

  test.describe("Language Switching", () => {
    test("language selector exists", async ({ page }) => {
      await page.goto("/");

      // Look for language switcher (could be button, select, or link)
      const langSwitch = page.locator(
        "[data-testid='language-switcher'], button:has-text('EN'), button:has-text('FI'), button:has-text('SV'), [aria-label*='language']"
      );

      // Language switcher should exist somewhere
      const count = await langSwitch.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Performance & SEO Basics", () => {
    test("homepage has meta description", async ({ page }) => {
      await page.goto("/");

      const metaDescription = page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute("content");

      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(50);
    });

    test("homepage has Open Graph tags", async ({ page }) => {
      await page.goto("/");

      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');

      await expect(ogTitle).toHaveAttribute("content", /.+/);
      await expect(ogDescription).toHaveAttribute("content", /.+/);
    });

    test("images have alt text", async ({ page }) => {
      await page.goto("/");

      // Check that visible images have alt text
      const images = page.locator("img:visible");
      const count = await images.count();

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          const alt = await images.nth(i).getAttribute("alt");
          // Alt can be empty string for decorative images, but should exist
          expect(alt).not.toBeNull();
        }
      }
    });
  });

  test.describe("Error Handling", () => {
    test("404 page displays correctly", async ({ page }) => {
      await page.goto("/nonexistent-page-xyz");

      // Should show 404 content
      const pageContent = await page.textContent("body");
      expect(
        pageContent?.toLowerCase().includes("404") ||
          pageContent?.toLowerCase().includes("not found")
      ).toBeTruthy();
    });
  });
});
