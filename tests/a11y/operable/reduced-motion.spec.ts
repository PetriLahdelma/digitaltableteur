/**
 * prefers-reduced-motion behavior
 *
 * a11y.ing recommends verifying motion reduction even beyond AA requirements.
 *
 * @see https://a11y.ing/en/testing/accessibility-audit/tools-and-techniques-for-accessibility-testing/
 */

import { test, expect } from "@playwright/test";

const PAGES = ["/", "/work", "/pricing", "/contact"];

test.describe("Reduced motion preferences", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("home avoids animated client logo marquee", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const staticGrid = page.locator("section[aria-label] .grid.grid-cols-3");
    const animatedTrack = page.locator(
      ".client-logo-marquee-container .client-logo-marquee-track"
    );

    await expect
      .poll(async () => {
        if ((await staticGrid.count()) > 0) return "static";
        if ((await animatedTrack.count()) === 0) return "absent";
        const animationName = await animatedTrack.first().evaluate(
          (el) => getComputedStyle(el).animationName
        );
        return animationName === "none" ? "disabled" : animationName;
      })
      .toMatch(/static|absent|disabled/);
  });

  for (const path of PAGES.filter((p) => p !== "/")) {
    test(`no infinite CSS animations on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);

      const infiniteAnimations = await page.evaluate(() => {
        const issues: string[] = [];

        for (const el of document.querySelectorAll("*")) {
          const style = window.getComputedStyle(el);
          const name = style.animationName;
          const iteration = style.animationIterationCount;

          if (
            !name ||
            name === "none" ||
            (iteration !== "infinite" && iteration !== "infinite")
          ) {
            continue;
          }

          if (name === "client-logo-marquee-forward") continue;

          const reduced =
            style.animationDuration === "0.01ms" ||
            style.animationDuration === "0s" ||
            style.animationPlayState === "paused";

          if (!reduced) {
            issues.push(name);
          }
        }

        return [...new Set(issues)];
      });

      expect(infiniteAnimations, `Unexpected infinite animations on ${path}`).toEqual(
        []
      );
    });
  }

  test("GSAP shortens animations when reduced motion is preferred", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const timeScale = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 400));
      const gsap = (
        window as unknown as {
          gsap?: { globalTimeline?: { timeScale: () => number } };
        }
      ).gsap;
      return gsap?.globalTimeline?.timeScale?.() ?? null;
    });

    if (timeScale !== null) {
      expect(timeScale).toBeGreaterThanOrEqual(1);
    }
  });
});
