import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.setTimeout(90_000);
test.use({ reducedMotion: "reduce" });

const themes = ["light", "dark", "hcb", "hcw"] as const;

async function applyTheme(page: Page, theme: (typeof themes)[number]) {
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
}

test("invalid contact fields retain AA contrast and error associations in every theme", async ({
  page,
}) => {
  let submissions = 0;
  await page.route("**/api/contact", async (route) => {
    submissions += 1;
    await route.abort();
  });
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#donny-panel")).toBeAttached();

  const essential = page.getByRole("button", {
    name: "Only essential",
    exact: true,
  });
  if (await essential.isVisible()) await essential.click();

  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.addStyleTag({
    content:
      "*, *::before, *::after { transition: none !important; animation: none !important; }",
  });

  const fields = [
    page.locator("#contact-name"),
    page.locator("#contact-email"),
    page.locator("#contact-message"),
  ];
  for (const field of fields) {
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const descriptionIds = (await field.getAttribute("aria-describedby"))
      ?.split(/\s+/)
      .filter(Boolean);
    expect(descriptionIds?.length).toBeGreaterThan(0);
    for (const id of descriptionIds ?? []) {
      await expect(page.locator(`[id="${id}"]`)).toBeVisible();
    }
  }
  expect(submissions).toBe(0);

  for (const theme of themes) {
    await applyTheme(page, theme);
    const result = await new AxeBuilder({ page })
      .include("form")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations,
      `${theme}: ${JSON.stringify(
        result.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target),
        })),
      )}`,
    ).toEqual([]);
  }
});
