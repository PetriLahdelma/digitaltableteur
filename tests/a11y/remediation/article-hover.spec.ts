import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });
test.setTimeout(90_000);

for (const theme of ["light", "dark", "hcb", "hcw"] as const) {
  test(`article hover retains text contrast in ${theme}`, async ({ page }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("#donny-panel")).toBeAttached();
    const essential = page.getByRole("button", {
      name: "Only essential",
      exact: true,
    });
    if (await essential.isVisible()) await essential.click();
    await page.evaluate((themeName) => {
      const classes = {
        light: "themeLight",
        dark: "themeDark",
        hcb: "themeHCB",
        hcw: "themeHCW",
      };
      for (const element of [document.documentElement, document.body]) {
        element.classList.remove(...Object.values(classes));
        element.classList.add(classes[themeName]);
        element.setAttribute("data-theme", themeName);
      }
    }, theme);
    await page.addStyleTag({
      content: "*, *::before, *::after { transition: none !important; }",
    });
    await page.locator('main a[href^="/blog/"]').first().hover();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });
}
