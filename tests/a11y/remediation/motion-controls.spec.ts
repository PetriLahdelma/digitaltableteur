import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });

test("persistent client motion has a working keyboard pause and resume", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#donny-panel")).toBeAttached();
  const essential = page.getByRole("button", { name: "Only essential", exact: true });
  if (await essential.isVisible()) await essential.click();
  const pause = page.getByRole("button", { name: "Pause client logo animation", exact: true });
  await expect(pause).toBeVisible();
  await pause.focus();
  await page.keyboard.press("Enter");
  const resume = page.getByRole("button", { name: "Resume client logo animation", exact: true });
  await expect(resume).toBeFocused();
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator(".client-logo-marquee-track").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationPlayState === "paused"))).toBe(true);
  await page.keyboard.press("Space");
  await expect(pause).toBeFocused();
  expect(await page.locator(".client-logo-marquee-track").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationPlayState === "running"))).toBe(true);
});
