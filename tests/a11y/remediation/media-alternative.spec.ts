import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });
test.setTimeout(90_000);

for (const theme of ["light", "dark", "hcb", "hcw"] as const) {
  for (const width of [320, 1280]) {
    test(`media visual description is readable: ${theme}, ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/work/garage-junction", {
        waitUntil: "domcontentloaded",
      });
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
      const video = page.locator(
        'video[aria-label="Garage Junction promotional video with original sound design"]',
      );
      await expect(video).toHaveAttribute("controls");
      await expect(video).not.toHaveAttribute("autoplay");
      await expect(video).toHaveAttribute(
        "aria-describedby",
        "garage-junction-video-description",
      );
      const description = page.locator("#garage-junction-video-description");
      await expect(description).toContainText("October 13th");
      await expect(description).toContainText("white G");
      expect(
        await description.evaluate((node) =>
          node.closest("[lang]")?.getAttribute("lang"),
        ),
      ).toBe("en");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
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
}
