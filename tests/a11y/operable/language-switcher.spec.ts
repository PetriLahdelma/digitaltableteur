import { test, expect, type Page } from "@playwright/test";

/**
 * LanguageSwitcher focus order (WCAG 2.4.3 Focus Order).
 *
 * The tray of language options is position:absolute and fans out to the LEFT
 * of the trigger. It must still sit AFTER the trigger in the DOM so that
 * opening the tray and pressing Tab walks FORWARD into the revealed options —
 * otherwise the options are only reachable with Shift+Tab, which no one
 * expects right after activating a disclosure.
 */
test.describe("OPER-04: LanguageSwitcher focus order", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // The desktop switcher only renders at >=lg; the default Desktop Chrome
    // viewport clears that. Wait for the closed trigger to render.
    await page
      .getByRole("button", { name: /show language options/i })
      .waitFor();
  });

  // Opens the tray from the trigger and returns the (now "Hide…") trigger,
  // retrying to absorb the client-header hydration gap: a click that lands
  // before hydration focuses the button but doesn't toggle it.
  async function openTray(page: Page) {
    const closed = page.getByRole("button", {
      name: /show language options/i,
    });
    const open = page.getByRole("button", { name: /hide language options/i });
    await expect(async () => {
      await closed.click();
      await expect(open).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });
    // Playwright's click focuses the trigger; confirm before we tab off it.
    await expect(open).toBeFocused();
    return open;
  }

  test("Tab from the open trigger moves focus into the revealed options", async ({
    page,
  }) => {
    await openTray(page);

    await page.keyboard.press("Tab");

    const landing = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      const trig = document.querySelector("button[aria-controls]");
      const root = trig?.closest('[role="group"]');
      const tray = root?.querySelector("[data-open]");
      return {
        isButton: active?.tagName === "BUTTON",
        isTrigger: active === trig,
        inTray: !!(tray && active && tray.contains(active)),
      };
    });

    expect(landing.inTray, "Tab should move focus into the options tray").toBe(
      true
    );
    expect(landing.isButton).toBe(true);
    expect(landing.isTrigger).toBe(false);
  });

  test("Shift+Tab from the first option returns focus to the trigger", async ({
    page,
  }) => {
    const openTrigger = await openTray(page);

    await page.keyboard.press("Tab"); // into the first option
    await page.keyboard.press("Shift+Tab"); // back toward the trigger

    await expect(openTrigger).toBeFocused();
  });
});
